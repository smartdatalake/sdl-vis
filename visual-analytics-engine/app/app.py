import argparse
import hashlib
import json
import os
import pathlib
import sys
import warnings

import networkx as nx
from flask import Flask, request, make_response, jsonify
from flask_cors import CORS
from gevent import monkey
from gevent.pywsgi import WSGIServer

from tools.helpers import exception_to_success_message

monkey.patch_all()

from db import PostgresManager, ProteusManager, QALManager, GCoreManager
from mining_engine import cluster_graph_hierarchical
from tools.data_transformer import transform
from db.timeseries_manager import TimeSeriesManager
from tools.flask_cache import cache

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

SIMSEARCH_ENDPOINT = os.environ["SIMSEARCH_ENDPOINT"]
SIMSEARCH_CATALOG_ENDPOINT = os.environ["SIMSEARCH_CATALOG"]
SIMSEARCH_API_KEY = os.environ["SIMSEARCH_API_KEY"]

TIMESERIES_ENDPOINT = os.environ["TIMESERIES_ENDPOINT"]
TIMESERIES_API_KEY = os.environ["TIMESERIES_API_KEY"]


def make_flask_app() -> Flask:
    app = Flask(__name__)
    cache.init_app(app, config={
        'DEBUG': True,
        'CACHE_TYPE': 'redis',
        'CACHE_KEY_PREFIX': 'vae_flask_',
        'CACHE_DEFAULT_TIMEOUT': 31536000,
        'CACHE_REDIS_HOST': 'redis',
        'CACHE_REDIS_PORT': '6379'
    })

    from db.simsearch_manager import SimSearchManager

    # Custom function to also include JSON request body into caching hash
    def make_cache_key(*args, **kwargs):
        args_str = json.dumps(dict(request.json), sort_keys=True)
        path_str = str(request.path)
        args_hash_str = str(hashlib.sha256(args_str.encode("utf-8")).hexdigest())
        path_hash_str = str(hashlib.sha256(path_str.encode("utf-8")).hexdigest())
        cache_key = path_hash_str + "/" + args_hash_str
        # print("Generating cache key from", args_str, path_str, "=>", cache_key)
        return cache_key

    create_paths()

    simsearch_manager = SimSearchManager(SIMSEARCH_ENDPOINT, SIMSEARCH_CATALOG_ENDPOINT, SIMSEARCH_API_KEY)
    postgres_manager = PostgresManager(POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, "test-db")
    proteus_manager = ProteusManager(PROTEUS_URL, PROTEUS_USER, PROTEUS_PASSWORD)
    qal_manager = QALManager(QAL_ENDPOINT)
    gcore_manager = GCoreManager(GCORE_ENDPOINT)
    timeseries_manager = TimeSeriesManager(TIMESERIES_ENDPOINT, TIMESERIES_API_KEY)

    with app.app_context():
        graph = nx.read_gpickle("/data/input/graph/graph.gpickle")
        clustered_graph = cluster_graph_hierarchical(graph, 2, "/data/output/graph/graph_plot.eps")

        with open(f'/data/output/graph/graph_hierarchy.json', 'w') as outfile:
            json.dump(clustered_graph["hierarchical"], outfile, indent=2)

        with open(f'/data/output/graph/graph_nodelink.json', 'w') as outfile:
            json.dump(clustered_graph["nodelink"], outfile, indent=2)

    @app.route('/', methods=['POST'])
    def index():
        return ''

    # # @TS: This will be replaced by SHINER from TU/e
    @app.route('/graph', methods=['POST'])
    def graph_route():
        return clustered_graph["hierarchical"]

    @app.route('/gcore/graphs', methods=['POST'])
    def gcore_list_graphs():
        return gcore_manager.get_available_graphs()

    @app.route('/gcore/graphvis/init', methods=['POST'])
    # @cache.cached(make_cache_key=make_cache_key)
    def gcore_graphvis_init():
        args = request.json

        records = gcore_manager.hierarchical_graph_init(args)

        return records

    # Renamed from /tables to /schema to avoid confusion
    @app.route('/schema', methods=['POST'])
    @cache.cached(key_prefix=make_cache_key)
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
    @cache.cached(key_prefix=make_cache_key)
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
    @cache.cached(key_prefix=make_cache_key)
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
    @cache.cached(key_prefix=make_cache_key)
    def qal_route():
        args = request.json

        if "table" in args and "op" in args:
            result = qal_manager.query(args["table"],
                                       args["op"])
        else:
            raise KeyError("Key 'table' or 'op' missing in query JSON.")

        return json.dumps(result)

    @app.route('/simsearch', methods=['POST'])
    @cache.cached(key_prefix=make_cache_key)
    def simsearch_route():
        args = request.json

        result = simsearch_manager.handle_request(args)

        # Trying to force content-encoding=identity
        response = make_response(result)
        response.headers['content-encoding'] = 'identity'
        return response

        # return result

    @app.route('/simsearch/columns', methods=['GET'])
    def get_all_simsearch_columns():
        cols = []
        # removes duplicate columns with different similarity operations for now
        for c in simsearch_manager.all_columns:
            # if c['column'] not in [d['column'] for d in cols]:
            if c['operation'] != 'pivot_based':
                cols.append(c)
        return json.dumps(cols)

    @app.route('/timeseries/catalog-search', methods=['POST'])
    def timeseries_catalog_search():
        payload = request.get_json()

        try:
            filter_str = payload['filterStr']
            limit = payload.get('limit', 10)

            return jsonify(timeseries_manager.catalog_search(filter_str, limit))
        except Exception as e:
            return jsonify(exception_to_success_message(e, app.debug))

    @app.route('/timeseries/correlate', methods=['POST'])
    def timeseries_correlate():
        payload = request.get_json()

        try:
            payload_translated = {
                "data": payload['timeseries'],
                "start": payload['start'],
                "window_size": payload['windowSize'],
                "step_size": payload['stepSize'],
                "steps": payload['steps'],
                "correlation_method": payload['correlationMethod'],
                "locale": payload.get("locale", None)
            }

            return jsonify(timeseries_manager.correlate(payload_translated))
        except Exception as e:
            return jsonify(exception_to_success_message(e, app.debug))

    #
    # @app.route('/timeseries/allcompanies', methods=['GET'])
    # @cache.cached(make_cache_key=make_cache_key)
    # def get_all_companies():
    #     args = request.json
    #     print("getting all comps", flush=True)
    #     return timeseries_manager.getAllCompanies(args)

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
