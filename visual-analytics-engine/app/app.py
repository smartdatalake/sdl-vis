import argparse
import json
import os
import sys
import warnings

import uvicorn
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from db import PostgresManager, ProteusManager, QALManager, GCoreManager
from db.simsearch_manager import SimSearchManager
from db.timeseries_manager import TimeSeriesManager
from pydantic_models.misc.generic_dict import GenericDict
from pydantic_models.requests.ggds_payload import GGDsPayload
from pydantic_models.requests.graph_cluster_payload import GraphClusterPayload
from pydantic_models.requests.graph_init_payload import GraphInitPayload
from pydantic_models.requests.qal_payload import QALPayload, qal_request_examples, qal_response_examples
from pydantic_models.requests.relational_schema_payload import RelationalSchemaPayload
from pydantic_models.requests.relational_table_payload import RelationalTablePayload
from pydantic_models.requests.relational_table_transform_payload import RelationalTableTransformPayload
from pydantic_models.requests.simsearch_search_payload import SimsearchSearchPayload
from pydantic_models.requests.timeseries_catalog_search_payload import TimeseriesCatalogSearchPayload
from pydantic_models.requests.timeseries_correlate_payload import TimeseriesCorrelatePayload
from pydantic_models.responses.graph_catalog import GraphCatalog
from pydantic_models.responses.graph_clustered_level import GraphClusteredLevel
from pydantic_models.responses.relational_schema_catalog import RelationalSchemaCatalog
from pydantic_models.responses.relational_table import RelationalTable
from pydantic_models.responses.relational_table_transformed import RelationalTableTransformed
from pydantic_models.responses.simsearch_column import SimsearchColumns
from pydantic_models.responses.simsearch_similarity_graph import SimilarityGraphs
from pydantic_models.responses.timeseries_catalog import TimeseriesCatalog
from pydantic_models.responses.timeseries_correlation_response import CorrelationResponse
from typing import List
from tools.data_transformer import transform
from tools.shinner_manager import ShinnerManager

warnings.filterwarnings("ignore", category=UserWarning)

# Get environment variables
POSTGRES_DB = os.environ["POSTGRES_DB"]
POSTGRES_USER = os.environ["POSTGRES_USER"]
POSTGRES_PASSWORD = os.environ["POSTGRES_PASSWORD"]

PROTEUS_URL = os.environ["PROTEUS_URL"]
PROTEUS_USER = os.environ["PROTEUS_USER"]
PROTEUS_PASSWORD = os.environ["PROTEUS_PASSWORD"]

QAL_ENDPOINT = os.environ["QAL_ENDPOINT"]

GCORE_ENDPOINT = os.environ["GCORE_ENDPOINT"]

SIMSEARCH_ENDPOINT = os.environ["SIMSEARCH_ENDPOINT"]
SIMSEARCH_CATALOG_ENDPOINT = os.environ["SIMSEARCH_CATALOG"]
SIMSEARCH_API_KEY = os.environ["SIMSEARCH_API_KEY"]

TIMESERIES_ENDPOINT = os.environ["TIMESERIES_ENDPOINT"]
TIMESERIES_API_KEY = os.environ["TIMESERIES_API_KEY"]

app = FastAPI(
    title="Visual Analytics Engine",
    description="""The computational backend of the visual analytics layer of the
                   [SmartDataLake](https://smartdatalake.eu/) project.""",
    version="1.1.0",
    contact={
        "name": "Thilo Spinner",
        "url": "https://www.vis.uni-konstanz.de/en/members/spinner",
        "email": "thilo.spinner@uni-konstanz.de",
    },
)

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

simsearch_manager = SimSearchManager(SIMSEARCH_ENDPOINT, SIMSEARCH_CATALOG_ENDPOINT, SIMSEARCH_API_KEY)
postgres_manager = PostgresManager(POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, "test-db")
proteus_manager = ProteusManager(PROTEUS_URL, PROTEUS_USER, PROTEUS_PASSWORD)
qal_manager = QALManager(QAL_ENDPOINT)
gcore_manager = GCoreManager(GCORE_ENDPOINT)
timeseries_manager = TimeSeriesManager(TIMESERIES_ENDPOINT, TIMESERIES_API_KEY)
shinner_manager = ShinnerManager(GCORE_ENDPOINT)


@app.get("/",
         response_class=HTMLResponse,
         tags=["ROOT"])
async def root():
    html_content = """
        <html>
            <head>
                <title>SDL VAE</title>
            </head>
            <body>
                <h1>SmartDataLake Visual Analytics Engine</h1>
                Visit the <a href="/docs">API doc</a> (<a href="/redoc">alternative</a>) for usage information or
                <a href="https://smartdatalake.eu/">smartdatalake.eu</a> for information on the project.
            </body>
        </html>
        """
    return HTMLResponse(content=html_content, status_code=200)


##########################
# Hierarchical Graph Vis #
##########################
@app.post('/gcore/graphs',
          response_model=GraphCatalog,
          summary="List Available Graphs",
          tags=["GCore"])
async def gcore_list_graphs():
    """
    Get all graphs available in the GCore system.
    """
    return await gcore_manager.get_available_graphs()


@app.post('/gcore/graphvis/init',
          response_model=GraphClusteredLevel,
          summary="Initialize GraphVis Session",
          tags=["GCore"])
async def gcore_graphvis_init(payload: GraphInitPayload):
    """
    Initialize a new hierarchical graph session with the given parameters. If everything goes well,
    the response contains a transaction ID, that can later be used to reference this session.
    """
    return await gcore_manager.hierarchical_graph_init(payload)


@app.post('/gcore/graphvis/cluster',
          response_model=GraphClusteredLevel,
          summary="Expand GraphVis Cluster",
          tags=["GCore"])
async def gcore_graphvis_cluster(payload: GraphClusterPayload):
    """
    Retrieve inner clusters from a hierarchical graph session.
    """
    return await gcore_manager.hierarchical_graph_cluster(payload)


###########################
# Proteus / Relational DB #
###########################
@app.post('/relational/schema',
          response_model=RelationalSchemaCatalog,
          summary="Get Schema Information",
          tags=["Relational"])
async def schema_route(payload: RelationalSchemaPayload):
    """
    Get formatted schema information for a relational database connection.
    """
    db_manager = proteus_manager if payload.proteus else postgres_manager
    return await db_manager.query_schema(payload.tables)


@app.post('/relational/table',
          response_model=RelationalTable,
          summary="Get Table Content",
          tags=["Relational"])
async def table_route(payload: RelationalTablePayload):
    """
    Retrieve the content from a relational database table.
    """
    db_manager = proteus_manager if payload.proteus else postgres_manager
    df = await db_manager.query_table(payload.table, payload.columns, payload.max_rows)
    return df.to_dict(orient="records")


@app.post('/relational/table/transform',
          response_model=RelationalTableTransformed,
          summary="Get Transformed Table Content",
          tags=["Relational"])
async def table_transform_route(payload: RelationalTableTransformPayload):
    """
    Retrieve the content from a relational database table and apply the given transformations to it.
    """
    db_manager = proteus_manager if payload.proteus else postgres_manager

    rows = await db_manager.query_table(payload.table, payload.columns, payload.max_rows)
    df = await transform(rows, payload.transform)

    return df.to_dict(orient="records")


######################################
# Approximate Query Processing (QAL) #
######################################
# TODO @TS: Response model
@app.post('/qal',
          response_model=RelationalTable,
          summary="Get Approximate Results",
          tags=["QAL"],
          responses=qal_response_examples)
async def qal_route(payload: QALPayload = Body(..., examples=qal_request_examples)):
    """
    Retrieve approximate results for a given operation.
    """
    return await qal_manager.query(payload.table, payload.op)


#####################
# Similarity Search #
#####################
@app.post('/simsearch/columns',
          response_model=SimsearchColumns,
          summary="List Available Columns",
          tags=["SimSearch"])
async def get_all_simsearch_columns():
    """
    Get information on the queryable columns.
    """
    return await simsearch_manager.get_available_columns()


@app.post('/simsearch',
          response_model=SimilarityGraphs,
          summary="Execute Search",
          tags=["SimSearch"])
async def simsearch_route(payload: SimsearchSearchPayload):
    """
    Execute a similarity search with the given parameters.
    """
    return await simsearch_manager.handle_request(payload)


#####################
# Time Series Graph #
#####################
@app.post('/timeseries/catalog-search',
          response_model=TimeseriesCatalog,
          summary="List Available Time-Series",
          tags=["Time-Series"])
async def timeseries_catalog_search(payload: TimeseriesCatalogSearchPayload):
    """
    Search the catalog of all available time series for a given substring.
    """
    return await timeseries_manager.catalog_search(payload.filter_str, payload.limit)


@app.post('/timeseries/correlate',
          response_model=CorrelationResponse,
          summary="Get Time-Series Correlation",
          tags=["Time-Series"])
async def timeseries_correlate(payload: TimeseriesCorrelatePayload):
    """
    Compute the correlation of two or more time series with the given parameters.
    """
    return await timeseries_manager.correlate(payload)


###########################
# GCore Entity Resolution #
###########################
@app.get("/gcore/schema/{graph_name}")  # ok
def get_schema(graph_name: str):
    return shinner_manager.graph_schema(graph_name)


@app.get("/gcore/availableGraphs")
async def get_graphdb():
    return shinner_manager.get_graphs()


@app.post("/gcore/er/setggds")
def set_ggds(args: List[GenericDict]): #List[GGDsPayload]
    return shinner_manager.set_ggds(json.dumps(args))


@app.get("/gcore/er/getggds")
def get_ggds():
    return shinner_manager.get_ggds()


@app.get("/gcore/er/run")
def run_er():
    return shinner_manager.run_ER()


@app.post("/gcore/er/drop-tables")
def drop_ggds(args: List[GenericDict]):
    return shinner_manager.drop_ggds(args)


@app.post("/gcore/er/targetgraph")
def target_graph_create(args: GenericDict):
    return shinner_manager.target_graph_create(args)


@app.post("/gcore/query/select")
def select_query(args: GenericDict):
    query = args["query"]
    limit = args["limit"]
    print("here select panel" + query)
    return shinner_manager.selectQuery(query, limit)


@app.post("/gcore/set-source-constraints")
def set_constraints(args: GenericDict):
    constraints = args["constraints"]
    ggd = args["ggd"]
    return shinner_manager.set_source_constraints(constraints, ggd)


@app.post("/gcore/query/construct")
def construct_query(args: GenericDict):
    query = args["query"]
    limit = args["limit"]
    print("here construct panel" + query)
    return shinner_manager.constructQuery(query, limit)


# args for both select and graph neighbor
# json format for "passing node information"
# {
#        "nodeLabel": "ProductAmazon",
#        "id": "1",
#        "edgeLabel": "",
#        "graphName": "Amazon",
#        "limit": -1
#    }
@app.post("/gcore/query/select-neighbor")
def select_neighbor(args: GenericDict):
    return shinner_manager.getNeighbors(args)


@app.post("/gcore/query/graph-neighbor")
def graph_neighbor(args: GenericDict):
    return shinner_manager.getNeighborsGraph(args)


def main(args):
    parser = argparse.ArgumentParser(description='Visual Analytics Engine for SDL-Vis.')

    parser.add_argument('--port', type=int, default=8080, help='Port to run flask server on.')
    parser.add_argument('--dev', action='store_true',
                        help='If true, launch flask so that the server restarts as changes occur to the template.')

    args = parser.parse_args(args)

    if args.dev:
        print(f"Serving on port {args.port} in development mode.")
        uvicorn.run("app:app", host="0.0.0.0", port=args.port, reload=True, access_log=False, workers=8)
    else:
        print(f"Serving on port {args.port} in live mode.")
        uvicorn.run("app:app", host="0.0.0.0", port=args.port, reload=False, access_log=False, workers=8)


if __name__ == "__main__":
    main(sys.argv[1:])
