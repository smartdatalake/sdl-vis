import argparse
import json
import os
import pathlib
import sys
import warnings
import hashlib

import networkx as nx
from flask import Flask, request
from flask_cache import Cache
from flask_cors import CORS
from gevent.pywsgi import WSGIServer

from db import PostgresManager, ProteusManager, QALManager
from mining_engine import cluster_graph_hierarchical
from tools.data_transformer import transform
from tools.simsearch_manager import SimSearchManager
from tools.timeseries_manager import TimeSeriesManager
from tools.gcore_manager import GCoreManager

warnings.filterwarnings("ignore", category=UserWarning)


# Create paths in output
def create_paths():
    pathlib.Path("/data/output/graph").mkdir(parents=True, exist_ok=True)


# Get environment variables
POSTGRES_DB = os.environ["POSTGRES_DB"]
POSTGRES_USER = os.environ["POSTGRES_USER"]
POSTGRES_PASSWORD = os.environ["POSTGRES_PASSWORD"]

PROTEUS_URL = os.environ["PROTEUS_URL"]
PROTEUS_USER = os.environ["PROTEUS_USER"]
PROTEUS_PASSWORD = os.environ["PROTEUS_PASSWORD"]

QAL_ENDPOINT = os.environ["QAL_ENDPOINT"]
GCORE_ENDPOINT = os.environ["GCORE_ENDPOINT"]


def make_flask_app() -> Flask:
    app = Flask(__name__)
    cache = Cache(app, config={
        'DEBUG': True,
        'CACHE_TYPE': 'redis',
        'CACHE_KEY_PREFIX': 'vaecache',
        'CACHE_DEFAULT_TIMEOUT': 86400,
        'CACHE_REDIS_HOST': 'redis',
        'CACHE_REDIS_PORT': '6379'
    })

    # Custom function to also include JSON request body into caching hash
    def make_cache_key(*args, **kwargs):
        args_str = json.dumps(dict(request.json), sort_keys=True)

        path_str = str(request.path)
        args_hash_str = str(hashlib.sha256(args_str.encode("utf-8")).hexdigest())
        key_str = path_str + "/" + args_hash_str
        # print("Cache key:", key_str, json.dumps(dict(request.json), sort_keys=True))
        return key_str

    create_paths()

    simsearch_manager = SimSearchManager()
    postgres_manager = PostgresManager(POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, "test-db")
    proteus_manager = ProteusManager(PROTEUS_URL, PROTEUS_USER, PROTEUS_PASSWORD)
    qal_manager = QALManager(QAL_ENDPOINT)
    timeseries_manager = TimeSeriesManager()
    gcore_manager = GCoreManager(GCORE_ENDPOINT)

    with app.app_context():
        graph = nx.read_gpickle("/data/input/graph/graph.gpickle")
        clustered_graph = cluster_graph_hierarchical(graph, 2, "/data/output/graph/graph_plot.eps")

        with open(f'/data/output/graph/graph_hierarchy.json', 'w') as outfile:
            json.dump(clustered_graph["hierarchical"], outfile, indent=2)

        with open(f'/data/output/graph/graph_nodelink.json', 'w') as outfile:
            json.dump(clustered_graph["nodelink"], outfile, indent=2)

    # @TS: Legacy code. Removed.
    # proj_helpers.initProjections()

    @app.route('/', methods=['POST'])
    def index():
        return ''

    @app.route('/graph', methods=['POST'])
    def graph_route():
        return clustered_graph["hierarchical"]

    ############graph g-core entity resolution - routes###############

    #graph schema
    @app.route("/gcore/schema/<string:graph_name>")  # ok
    def get_schema(graph_name):
        return gcore_manager.graph_schema(graph_name)

    @app.route("/gcore/availableGraphs")
    def get_graphdb():
        return gcore_manager.get_graphs()

    @app.route("/gcore/er/setggds", methods=['POST'])
    def set_ggds():
        args = request.json
        return gcore_manager.set_ggds(args)

    @app.route("/gcore/er/getggds")
    def get_ggds():
        return gcore_manager.get_ggds()

    @app.route("/gcore/er/run")
    def run_er():
        return gcore_manager.run_ER()

    @app.route("/gcore/query/select", methods=['POST'])
    def select_query():
        args = request.json
        query = args["query"]
        limit = args["limit"]
        print("here select panel" + query)
        return gcore_manager.selectQuery(query, limit)

    @app.route("/gcore/query/construct", methods=['POST'])
    def construct_query():
        args = request.json
        query = args["query"]
        limit = args["limit"]
        print("here construct panel" + query)
        return gcore_manager.constructQuery(query, limit)

    #args for both select and graph neighbor
    # json format for "passing node information"
    # {
    #        "nodeLabel": "ProductAmazon",
    #        "id": "1",
    #        "edgeLabel": "",
    #        "graphName": "Amazon",
    #        "limit": -1
    #    }
    @app.route("/gcore/query/select-neighbor", methods=['POST'])
    def select_neighbor():
        args = request.json
        return gcore_manager.getNeighbors(args)

    @app.route("/gcore/query/graph-neighbor", methods=['POST'])
    def graph_neighbor():
        args = request.json
        return gcore_manager.getNeighborsGraph(args)

    ##############################

    # Renamed from /tables to /schema to avoid confusion
    @app.route('/schema', methods=['POST'])
    @cache.cached(timeout=432000, key_prefix=make_cache_key)
    def schema_route():
        args = request.json

        if "proteus" in args and args["proteus"]:
            db_manager = proteus_manager
        else:
            db_manager = postgres_manager

        schema = db_manager.query_schema(args["tables"] if "tables" in args else None)
        return json.dumps(schema)

    # Renamed from /column to /table to avoid confusion
    @app.route('/table', methods=['POST'])
    @cache.cached(timeout=432000, key_prefix=make_cache_key)
    def table_route():
        args = request.json

        if "proteus" in args and args["proteus"]:
            db_manager = proteus_manager
        else:
            db_manager = postgres_manager

        if "table" in args:
            df = db_manager.query_table(
                args["table"],
                args["columns"] if "columns" in args else None,
                args["maxRows"] if "maxRows" in args else None)
        else:
            raise KeyError("Key 'table' missing in query JSON.")

        return df.to_json(orient="records")

    @app.route('/table/transform', methods=['POST'])
    @cache.cached(timeout=432000, key_prefix=make_cache_key)
    def table_transform_route():
        args = request.json

        if "proteus" in args and args["proteus"]:
            db_manager = proteus_manager
        else:
            db_manager = postgres_manager

        if "table" in args and "transform" in args:
            rows = db_manager.query_table(
                args["table"],
                args["columns"] if "columns" in args else None,
                args["maxRows"] if "maxRows" in args else None)

            df = transform(rows, args["transform"])
        else:
            raise KeyError("Key 'table' or 'transform' missing in query JSON.")

        return df.to_json(orient="records")

    @app.route('/qal', methods=['POST'])
    @cache.cached(timeout=432000, key_prefix=make_cache_key)
    def qal_route():
        args = request.json

        if "table" in args and "op" in args:
            result = qal_manager.query(args["table"],
                                       args["op"])
        else:
            raise KeyError("Key 'table' or 'op' missing in query JSON.")

        return json.dumps(result)

    @app.route('/simsearch', methods=['POST'])
    @cache.cached(timeout=432000, key_prefix=make_cache_key)
    def simsearch_route_new():
        args = request.json

        return simsearch_manager.handle_request(args)

    # @TS: Legacy code. Removed.
    # @app.route('/simsearch', methods=['POST'])
    # def simsearch_route():
    #     args = request.json
    #     print(f"projection route called {args}", flush=True)
    #     retobj = proj_helpers.getprojection(args)
    #
    #     return retobj
    #
    # @app.route('/simsearch/prefetch', methods=['POST'])
    # def simsearch_prefetch_route():
    #     args = request.json
    #     print(f"prefetching results for {args}", flush=True)
    #     retobj = proj_helpers.getprefetch(args)
    #
    #     return retobj

    @app.route('/timeseries', methods=['POST'])
    def get_timeseries_data():
        args = request.json
        print(f"timeseries for {args}", flush=True)
        return timeseries_manager.handleRequest(args)

    @app.route('/timeseries/allcompanies', methods=['GET'])
    def get_all_companies():
        args = request.json
        print("getting all comps", flush=True)
        return timeseries_manager.getAllCompanies(args)

    return app


def main(args):
    parser = argparse.ArgumentParser(description='Visual Analytics Engine for SDL-Vis.')

    parser.add_argument('--port', type=int, default=8080, help='Port to run flask server on.')
    parser.add_argument('--dev', action='store_true',
                        help='If true, launch flask so that the server restarts as changes occur to the template.')

    args = parser.parse_args(args)

    app = make_flask_app()
    CORS(app)

    if args.dev:
        app.debug = True
        print(f"Serving on port {args.port} in development mode.")
        app.run(port=args.port, host='0.0.0.0', threaded=True)
    else:
        http_server = WSGIServer(('0.0.0.0', args.port), app, log=sys.stdout)
        print(f"Serving on port {args.port} in WSGI server mode.")
        http_server.serve_forever()


if __name__ == "__main__":
    main(sys.argv[1:])
