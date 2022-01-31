import asyncio
import json
from urllib.parse import urljoin

import aiohttp
import numpy as np
import pandas as pd
import requests
import umap

from pydantic_models.requests.graph_cluster_payload import GraphClusterPayload
from pydantic_models.requests.graph_init_payload import GraphInitPayload
from redis_tools import cached, hash_args, set_df, get_df, set_dict, get_dict


class GCoreManager:
    _service_url = None
    _latest_init_objects = {
        "attributes": None,
        "df_embeddings": None
    }

    def __init__(self, gcore_endpoint):
        self._service_url = gcore_endpoint
        self._asyncio_loop = asyncio.get_event_loop()

    ######################################
    # Methods for Hierarchical Graph Vis #
    ######################################
    @cached(alias="default", key_builder=lambda fn, *args, **kwargs: "26f41a0a_" + hash_args(args[1:]))
    async def get_available_graphs(self):
        try:
            graph_db_response = requests.post(urljoin(self._service_url, "graphDB"))

            if graph_db_response.ok:
                graph_db = json.loads(graph_db_response.content)

                async with aiohttp.ClientSession() as session:
                    res = await asyncio.gather(*[self._get_graph_schema(session, graph_name) for graph_name in graph_db])
                    return {graph_name: response for (graph_name, response) in zip(graph_db, res) if response is not False}
        except Exception as e:
            print(f"{type(e).__name__} while retrieving graph DB.")

        # Fallback: empty dict.
        return {}

    async def _get_graph_schema(self, session: aiohttp.ClientSession, graph_name: str, timeout: int = 10):
        print("Querying graph schema for graph '" + graph_name + "'.")
        try:
            url = urljoin(self._service_url, "/".join(["graphDB", graph_name]))

            async with session.post(url=url, timeout=timeout) as graph_schema_response:
                if graph_schema_response.ok:
                    graph_schema = await graph_schema_response.json()
                    graph_schema["links"] = json.loads(graph_schema["links"])
                    graph_schema["nodes"] = json.loads(graph_schema["nodes"])

                    return graph_schema
                else:
                    graph_schema_response.raise_for_status()
        except Exception as e:
            print(f"{type(e).__name__} while querying schema for graph '{graph_name}'.")

        return False

    async def hierarchical_graph_init(self, payload: GraphInitPayload):
        # Store the attributes in a distinct variable since it is used multiple times in the following
        attributes = payload.graphSettings.graphAttributes

        # Extract the distinct vertex labels from all vertices the user wants to query.
        # E.g., the user queries verta$attr1, verta$attr2, and vertb$attr1.
        # Then the result of this would be the list ["verta", "vertb"].
        distinct_vertex_labels = list(set(map(lambda a: a.split("$")[0], attributes)))

        # Transform to correct payload format
        # See: https://docs.google.com/document/d/1IpOJtUQe4ip8QlH4pgBys_q5qtfdxtxd7TlsdIujoDU
        params = {
            "attributes": attributes,
            "graph": {
                "name": payload.graphSettings.graphName,
                "vertices": list(map(lambda vertex_label: {
                    "label": vertex_label,  # Assign the vertex_label as label,
                    "variable": vertex_label,  # as well as for the placeholder variable
                }, distinct_vertex_labels)),
                "edges": []
            },
            "algorithm": payload.algorithmSettings.algorithm,
            "feature":
                payload.algorithmSettings.featureExtractor
                if payload.algorithmSettings.featureExtractor
                else "none",
            "algoParams": json.dumps(payload.algorithmSettings.algorithmParams[payload.algorithmSettings.algorithm])
        }

        # DEBUG
        # with open(f"/data/output/hierarchical-graph-init_request-payload_{time.time()}.json", "w") as f:
        #     json.dump(params, f, indent=4)

        r = await self.hierarchical_graph_init_cached_api_call(params)

        if r.ok:
            # Parse the information in the response. Nested fields might be stringified JSONs.
            content = json.loads(r.content)
            # with open(f"/data/output/hierarchical-graph-init_result_{time.time()}.json", "w") as f:
            #     json.dump(content, f, indent=4)

            raw_nodes = json.loads(content["graph"]["nodes"])
            raw_links = json.loads(content["graph"]["links"])
            raw_similarity = json.loads(content["similarity"])
            transaction_id = content["visid"]

            ###############################################################################
            # Convert similarity information from upper triangle of matrix to full matrix #
            ###############################################################################

            # Get total number of nodes (row_ids) from the similarity matrix instead of nodes since the
            # similarity matrix is ensured to be complete in the init call, while the nodes are only
            # cluster representatives.
            total_num_nodes = len(raw_similarity) + 1

            # Create full square matrix of ones.
            distance_matrix = np.ones(shape=(total_num_nodes, total_num_nodes))

            # Copy the entries from the upper triangle of matrix to their respective location in the full matrix.
            for list_index_d0 in range(total_num_nodes - 1):
                for list_index_d1 in range(total_num_nodes - 1 - list_index_d0):
                    matrix_index_d0 = list_index_d0
                    matrix_index_d1 = list_index_d0 + list_index_d1 + 1

                    distance_matrix[matrix_index_d0][matrix_index_d1] = raw_similarity[list_index_d0][list_index_d1]
                    distance_matrix[matrix_index_d1][matrix_index_d0] = raw_similarity[list_index_d0][list_index_d1]

            # Transform the raw nodes from SHINER to our graph format
            df_nodes = pd.DataFrame(raw_nodes)
            # Rename id column
            df_nodes.rename(columns={"rowId": "id"}, inplace=True)
            # Convert values to correct data pydantic_models
            df_nodes[attributes] = df_nodes[attributes].astype(float)
            df_nodes["id"] = df_nodes["id"].astype(int)

            # Project based on the distance matrix
            embeddings = project_on_distances(distance_matrix)
            df_embeddings = pd.DataFrame(embeddings, columns=["x", "y"])
            # Attach id column, which tells both the order of the data points in the distance matrix and the node id
            df_embeddings["id"] = list(range(total_num_nodes))

            # Store details on this transaction for later use in hierarchical_graph_cluster()
            set_dict(f"gcore_transaction-{transaction_id}_attributes", attributes)
            set_df(f"gcore_transaction-{transaction_id}_df-embeddings", df_embeddings)

            # INNER JOIN on id to merge node info with embeddings
            df_nodes = pd.merge(df_nodes, df_embeddings, on='id', how='inner')

            # Split between attribute and other columns
            df_attrs = df_nodes[attributes]
            df_nodes = df_nodes[df_nodes.columns.difference(attributes)]

            # Convert the result to JSON and return it
            node_records = df_nodes.to_dict(orient="records")
            attr_records = df_attrs.to_dict(orient="records")
            for record_idx, node_record in enumerate(node_records):
                node_record["attributes"] = attr_records[record_idx]

            return {
                "transactionId": transaction_id,
                "nodes": node_records
            }

    async def hierarchical_graph_cluster(self, payload: GraphClusterPayload):
        # Transform to correct payload format
        # See: https://docs.google.com/document/d/1IpOJtUQe4ip8QlH4pgBys_q5qtfdxtxd7TlsdIujoDU
        params = {
            "visid": payload.transactionId,
            "level": payload.level,
            "clusterid": payload.clusterId,
            "numpoints": payload.numNeighbors,
            "id": payload.idOfClosestNeighbor,
        }

        r = await self.hierarchical_graph_cluster_cached_api_call(params)

        if r.ok:
            # Parse the information in the response. Nested fields might be stringified JSONs.
            content = json.loads(r.content)
            # with open(f"/data/output/hierarchical-graph-cluster_result_{time.time()}.json", "w") as f:
            #     json.dump(content, f, indent=4)

            raw_nodes = json.loads(content["graph"]["nodes"])

            # Get details on this transaction from init operation
            attributes = get_dict(f"gcore_transaction-{payload.transactionId}_attributes")
            df_embeddings = get_df(f"gcore_transaction-{payload.transactionId}_df-embeddings")

            # Transform the raw nodes from SHINER to our graph format
            df_nodes = pd.DataFrame(raw_nodes)
            # Rename id column
            df_nodes.rename(columns={"rowId": "id"}, inplace=True)
            # Convert values to correct data pydantic_models
            df_nodes[attributes] = df_nodes[attributes].astype(float)
            df_nodes["id"] = df_nodes["id"].astype(int)

            # The projection should be done at this point (in graphvis init method). Use the latest embeddings
            # and join with the respective points.
            # INNER JOIN on id to merge node info with embeddings
            df_nodes = pd.merge(df_nodes, df_embeddings, on='id', how='inner')

            # Split between attribute and other columns
            df_attrs = df_nodes[attributes]
            df_nodes = df_nodes[df_nodes.columns.difference(attributes)]

            # Convert the result to JSON and return it
            node_records = df_nodes.to_dict(orient="records")
            attr_records = df_attrs.to_dict(orient="records")
            for record_idx, node_record in enumerate(node_records):
                node_record["attributes"] = attr_records[record_idx]

            return {
                "transactionId": payload.transactionId,
                "nodes": node_records
            }

    # Do not cache this endpoint, so it actually creates a new transaction in the SHINNER system.
    # @cached(alias="default", key_builder=lambda fn, *args, **kwargs: "a7f89d42_" + hash_args(args[1:]))
    async def hierarchical_graph_init_cached_api_call(self, params):
        return requests.post(url=self._service_url + "graphvis/initialvis", json=params)

    @cached(alias="default", key_builder=lambda fn, *args, **kwargs: "117e38d2_" + hash_args(args[1:]))
    async def hierarchical_graph_cluster_cached_api_call(self, params):
        return requests.post(url=self._service_url + "graphvis/nextlevel", json=params)


def project_on_distances(distance_matrix: np.ndarray) -> np.ndarray:
    # Create UMAP and limit n_neighbors to the number of data points. Otherwise, UMAP will throw a warning.
    umap_reducer = umap.UMAP(
        n_neighbors=min(15, len(distance_matrix) - 1),
        metric="precomputed",
        random_state=42,  # Ensure reproducibility of results
        n_components=2
    )

    return umap_reducer.fit_transform(distance_matrix)
