import hashlib
import json
from hashlib import sha256
from urllib.parse import urljoin

import networkx as nx
import numpy as np
import pandas as pd
import requests
import umap

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

    def hierarchical_graph_init(self, graph_settings):
        # Transform to correct payload format
        # See: https://docs.google.com/document/d/1IpOJtUQe4ip8QlH4pgBys_q5qtfdxtxd7TlsdIujoDU
        graph_label = "a"
        attributes = graph_settings["graphSettings"]["graphAttributes"]
        params = {
            "attributes": list(map(lambda x: f"{graph_label}${x}", attributes)),
            "graph": {
                "name": graph_settings["graphSettings"]["graphName"],
                "vertices": [
                    {
                        "label": graph_settings["graphSettings"]["graphName"].lower(),
                        "variable": graph_label,
                    }
                ],
                "edges": []
            },
            "algorithm": graph_settings["algorithmSettings"]["algorithm"],
            "feature":
                graph_settings["algorithmSettings"]["featureExtractor"]
                if graph_settings["algorithmSettings"]["featureExtractor"]
                else "none",
            "algoParams":
                json.dumps(graph_settings["algorithmSettings"]["algorithmParamsKMeans"])
                if graph_settings["algorithmSettings"]["algorithm"] == "kmeans"
                else json.dumps(graph_settings["algorithmSettings"]["algorithmParamsSingle"])
        }

        # r = requests.post(url=self._service_url + "graphvis/initialvis", json=params)
        r = self.temp_cached_query_helper(params)

        if r.ok:
            # Parse the information in the response. Nested fields might be stringified JSONs.
            content = json.loads(r.content)

            raw_nodes = json.loads(content["graph"]["nodes"])
            raw_links = json.loads(content["graph"]["links"])
            raw_similarity = json.loads(content["similarity"])

            # Convert similarity information from
            #   {"138": [
            #       {"id":20,"distance":3.562302626111375},
            #       {"id":23,"distance":3.4928498393145957},
            #       ...],
            #    ...}
            # to
            #   {"138": {
            #       "20": 3.562302626111375,
            #       "23": 3.4928498393145957,
            #       ...},
            #    ...}
            for n1_key, n1 in raw_similarity.items():
                raw_similarity[n1_key] = {str(n2["id"]): n2["distance"] for n2 in n1}

            # Convert similarity information to distance matrix
            node_ids = raw_similarity.keys()
            distance_matrix = np.zeros(shape=[len(node_ids), len(node_ids)])

            for n1_id, n1_name in enumerate(node_ids):
                for n2_id, n2_name in enumerate(node_ids):
                    if n1_name in raw_similarity:
                        if n2_name in raw_similarity[n1_name]:
                            distance_matrix[n1_id][n2_id] = raw_similarity[n1_name][n2_name]

            # Transform the raw nodes from SHINER to our graph format
            df_nodes = pd.DataFrame(raw_nodes)
            # Strip graph label from attribute column headers and rename id column
            df_nodes.rename(columns={f"{graph_label}${a}": a for a in attributes}, inplace=True)
            df_nodes.rename(columns={"rowId": "id"}, inplace=True)
            # Convert values to correct data types
            df_nodes[attributes] = df_nodes[attributes].astype(float)
            df_nodes["id"] = df_nodes["id"].astype(str)

            # Project based on the distance matrix
            embeddings = project_on_distances(distance_matrix)
            df_embeddings = pd.DataFrame(embeddings, columns=["x", "y"])
            # Attach id column, which tells both the order of the data points in the distance matrix and the node id
            df_embeddings["id"] = node_ids

            # INNER JOIN on id to merge node info with embeddings
            df_nodes = pd.merge(df_nodes, df_embeddings, on='id', how='inner')

            # Convert the result to JSON and return it
            records = df_nodes.to_json(orient="records")
            return records

    def hierarchical_graph_next_level(self, param):
        print(param)
        r = requests.post(url=self._service_url + "graphvis/nextlevel", json=param)
        print(r.content)
        return r.content

    # Temporary helpers to speed up development
    def temp_cached_query_helper_mck(*args, **_):
        args_str = json.dumps(dict(args[1]), sort_keys=True)
        args_hash_str = str(hashlib.sha256(args_str.encode("utf-8")).hexdigest())
        cache_key = "a7f89d42_" + args_hash_str
        return cache_key

    @cache.cached(timeout=31536000,
                  make_cache_key=temp_cached_query_helper_mck)
    def temp_cached_query_helper(self, params):
        return requests.post(url=self._service_url + "graphvis/initialvis", json=params)


# For compatibily with Python 3.7; in Python 3.9+ there is a str.removeprefix method.
def remove_prefix(text, prefix):
    return text[text.startswith(prefix) and len(prefix):]


def project_on_distances(distance_matrix: np.ndarray) -> np.ndarray:
    # Create UMAP and limit n_neighbors to the number of data points. Otherwise, UMAP will throw a warning.
    umap_reducer = umap.UMAP(
        n_neighbors=min(15, len(distance_matrix) - 1),
        metric="precomputed",
        random_state=42,  # Ensure reproducibility of results
        n_components=2
    )

    return umap_reducer.fit_transform(distance_matrix)
