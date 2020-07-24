import argparse
import json
import os
import pathlib
import sys
import warnings

import networkx as nx
from flask import Flask, request
from flask_cors import CORS
from gevent.pywsgi import WSGIServer

import proj_helpers
from tools.timeseries_manager import TimeSeriesManager
from mining_engine import cluster_graph_hierarchical
from tools.data_transformer import transform
from tools.db_manager import DBManager

warnings.filterwarnings("ignore", category=UserWarning)


# Create paths in output
def create_paths():
    pathlib.Path("/data/output/graph").mkdir(parents=True, exist_ok=True)


# Get environment variables
POSTGRES_DB = os.environ["POSTGRES_DB"]
POSTGRES_USER = os.environ["POSTGRES_USER"]
POSTGRES_PASSWORD = os.environ["POSTGRES_PASSWORD"]


def make_flask_app() -> Flask:
    app = Flask(__name__)

    create_paths()

    db_manager = DBManager(POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, "test-db")
    timeseries_manager = TimeSeriesManager()

    with app.app_context():
        graph = nx.read_gpickle("/data/input/graph/graph.gpickle")
        clustered_graph = cluster_graph_hierarchical(graph, 2, "/data/output/graph/graph_plot.eps")

        with open(f'/data/output/graph/graph_hierarchy.json', 'w') as outfile:
            json.dump(clustered_graph["hierarchical"], outfile, indent=2)

        with open(f'/data/output/graph/graph_nodelink.json', 'w') as outfile:
            json.dump(clustered_graph["nodelink"], outfile, indent=2)

    proj_helpers.initProjections()

    @app.route('/graph', methods=['POST'])
    def graph_route():
        return clustered_graph["hierarchical"]

    # Renamed from /tables to /schema to avoid confusion
    @app.route('/schema', methods=['POST'])
    def schema_route():
        args = request.json

        schema = db_manager.query_schema(args["table"] if "table" in args else None)

        return json.dumps(schema)

    # Renamed from /column to /table to avoid confusion
    @app.route('/table', methods=['POST'])
    def table_route():
        args = request.json

        if "table" in args:
            df = db_manager.query_table(
                args["table"],
                args["columns"] if "columns" in args else None,
                args["maxRows"] if "maxRows" in args else None)
        else:
            raise KeyError("Key 'table' missing in query JSON.")

        return df.to_json(orient="records")

    @app.route('/table/transform', methods=['POST'])
    def table_transform_route():
        args = request.json

        if "table" and "transform" in args:
            rows = db_manager.query_table(
                args["table"],
                args["columns"] if "columns" in args else None,
                args["maxRows"] if "maxRows" in args else None)

            df = transform(rows, args["transform"])
        else:
            raise KeyError("Key 'table' or 'transform' missing in query JSON.")

        return df.to_json(orient="records")

    @app.route('/simsearch', methods=['POST'])
    def simsearch_route():
        args = request.json
        print(f"projection route called {args}", flush=True)
        retobj = None
        retobj = proj_helpers.getprojection(args)

        return retobj

    @app.route('/simsearch/prefetch', methods=['POST'])
    def simsearch_prefetch_route():
        args = request.json
        print(f"prefetching results for {args}", flush=True)
        retobj = None
        retobj = proj_helpers.getprefetch(args)

        return retobj

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
        app.run(port=args.port, host='0.0.0.0')
    else:
        http_server = WSGIServer(('0.0.0.0', args.port), app, log=sys.stdout)
        print(f"Serving on port {args.port} in WSGI server mode.")
        http_server.serve_forever()


if __name__ == "__main__":
    main(sys.argv[1:])
