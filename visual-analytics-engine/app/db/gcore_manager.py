import json
from hashlib import sha256
from urllib.parse import urljoin

import networkx as nx
import pandas as pd
import requests

from tools import cache


class GCoreManager:
    _service_url = None

    def __init__(self, gcore_endpoint):
        self._service_url = gcore_endpoint

    ######################################
    # Methods for Hierarchical Graph Vis #
    ######################################
    def get_available_graphs(self):
        result = {}

        graph_db_response = requests.post(urljoin(self._service_url, "graphDB"))

        if graph_db_response.ok:
            graph_db = json.loads(graph_db_response.content)

            for graph_name in graph_db:
                graph_schema = self._get_graph_schema(graph_name)

                if graph_schema:
                    result[graph_name] = graph_schema

        return result

    @cache.cached(timeout=31536000,
                  make_cache_key=lambda *args, **_: "26f41a0a_" + sha256(args[1].encode("utf-8")).hexdigest())
    def _get_graph_schema(self, graph_name: str, timeout: int = 10):
        print("Querying graph schema for graph '" + graph_name + "'.")
        try:
            graph_schema_response = requests.post(urljoin(self._service_url, "/".join(["graphDB", graph_name])),
                                                  timeout=timeout)

            if graph_schema_response.ok:
                graph_schema = json.loads(graph_schema_response.content)
                graph_schema["links"] = json.loads(graph_schema["links"])
                graph_schema["nodes"] = json.loads(graph_schema["nodes"])

                return graph_schema
        except Exception as e:
            print("Error while querying schema for graph '" + graph_name + "':", e)

        return False

    def hierarchical_graph_select_neighbors(self, node_param):
        r = requests.post(url=self._service_url + "gcore/select-neighbor", json=node_param)
        neighbor_data = pd.DataFrame.from_dict(json.loads(r['content']))
        return neighbor_data

    def hierarchical_graph_construct_neighbors(self, node_param):
        r = requests.post(url=self._service_url + "gcore/construct-neighbor", json=node_param)
        graph_neighbor = nx.readwrite.json_graph.node_link_graph(r.content)
        return graph_neighbor

    def hierarchical_graph_init(self, param):
        print(param)
        r = requests.post(url=self._service_url + "graphvis/initialvis", json=param)
        print(r.content)
        return r.content

    def hierarchical_graph_next_level(self, param):
        print(param)
        r = requests.post(url=self._service_url + "graphvis/nextlevel", json=param)
        print(r.content)
        return r.content
