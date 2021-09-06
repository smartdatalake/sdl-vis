import json
from typing import List, Any

import numpy as np
import pandas as pd
import requests
import umap
from sklearn.cluster import KMeans
from sklearn.manifold import MDS
from sklearn.metrics import silhouette_score

from pydantic_models.requests.simsearch_search_payload import SimsearchSearchPayload
from redis_tools import hash_args, cached


class SimSearchManager:
    def __init__(self, endpoint, catalog_endpoint, api_key):
        self.__catalog_endpoint = catalog_endpoint
        self.__search_endpoint = endpoint
        self.__api_key = api_key

    @cached(alias="default", key_builder=lambda fn, *args, **kwargs: "9226b1ad_" + hash_args(args[1:]))
    async def _api_call(self, k, query_conditions):
        headers = {'api_key': self.__api_key, 'Content-Type': 'application/json'}
        params = {'k': k, 'queries': query_conditions}

        data = json.dumps(params)

        return requests.post(self.__search_endpoint, data=data, headers=headers, timeout=120)

    async def handle_request(self, payload: SimsearchSearchPayload):
        # construct root seach object
        root_search = {
            'id': 'root_search',
            'totalScore': 1
        }

        query_conditions = []
        attributes = payload.attributes

        # loop over request parameters
        for attribute_name, attribute in attributes.items():
            if attribute.active:
                # Copy (and format) only the properties that are important for the query condition
                condition = {
                    'operation': attribute.operation,
                    'column': attribute.column,
                    'value': attribute.value,
                    'weights': [str(w) for w in attribute.weights],
                    'decay': .01
                }

                query_conditions.append(condition)
                root_search[attribute_name] = str(attribute.value)
                root_search[(attribute_name + 'Score')] = 1

        if len(query_conditions) > 0:
            response = await self._api_call(payload.projection.k, query_conditions)
        else:
            return json.dumps({"code": 404, "reason": 'no params specified'}), 404

        if response.status_code != 200:
            print(f"response: {response}", flush=True)
            return json.dumps({"code": 404, "reason": "incorrect parameters specified"}), 404

        response = response.json()

        if response[0].get('rankedResults', None) is None:
            try:
                print(f" {str(response[0]['notification'])}", flush=True)
                return json.dumps({"code": 404, "reason": str(response[0]['notification'])}), 404
            except Exception as e:
                print(f"somethings wrong", flush=True)
                return json.dumps({"code": 404, "reason": str(e)}), 404

        ##########################################
        # Transform, Format, and Return the Data #
        ##########################################
        result_rows: List[Any] = []

        for i in range(len(response)):
            dataframe = pd.DataFrame()

            # loop over returned datapoints
            for result in response[i]['rankedResults']:
                entry = dict()
                entry['id'] = result['id']
                entry['totalScore'] = result['score']

                # loop over each attribute
                for attr in result['attributes']:
                    entry[attr.get('name')] = attr.get('value')
                    entry[attr.get('name') + 'Score'] = attr.get('score')

                dataframe = dataframe.append(entry, ignore_index=True)

            # add root search query
            dataframe = dataframe.sort_values(by=['totalScore'], ascending=False)
            dataframe = pd.concat([pd.DataFrame(root_search, index=[0]), dataframe]).reset_index(drop=True)

            # add edges of root_search to edgelist
            edgelist = response[i]['similarityMatrix']
            for r in response[i]['rankedResults']:
                edgelist.append({'left': 'root_search', 'right': r['id'], 'score': r['score']})
                edgelist.append({'left': r['id'], 'right': 'root_search', 'score': r['score']})

            # transform edge list to adjacency Matrix
            mat = np.ones((dataframe.shape[0], dataframe.shape[0]))
            for edge in edgelist:
                lidx = dataframe.loc[dataframe['id'] == edge['left']].index.tolist()[0]
                ridx = dataframe.loc[dataframe['id'] == edge['right']].index.tolist()[0]
                mat[lidx][ridx] = edge['score']

            # decide on projection to be used
            if payload.projection.type in ['pca', 'mds']:
                mds = MDS(n_components=2, random_state=1, eps=payload.projection.epsilon,
                          max_iter=payload.projection.maxIter, dissimilarity='precomputed')
                dataframe = dataframe.join(pd.DataFrame(mds.fit_transform(mat),
                                                        columns=['x', 'y']))
            elif payload.projection.type == 'umap':
                umapper = umap.UMAP(metric='precomputed', spread=10)
                dataframe = dataframe.join(
                    pd.DataFrame(
                        umapper.fit_transform(
                            mat),
                        columns=['x', 'y']))

            # print(dataframe[['x','y']], flush=True)
            # silhouette coefficient to determine optimal k for k-means
            distortions = []
            # if less than 4 results, no need for clustering
            if dataframe.shape[0] < 4:
                dataframe['cluster'] = 0
            else:
                for n_cluster in range(2, min(dataframe.shape[0] - 1, 10)):
                    kmeans = KMeans(n_clusters=n_cluster).fit(dataframe[['x', 'y']])
                    distortions.append(silhouette_score(dataframe[['x', 'y']], kmeans.labels_, metric='euclidean'))

                # cluster on x & y values
                kmeans = KMeans(n_clusters=(distortions.index(max(distortions)) + 3)).fit(dataframe[['x', 'y']])
                dataframe['cluster'] = kmeans.labels_

            matrixdf = pd.DataFrame(edgelist)

            # remove items where left & right have same id
            matrixdf = matrixdf[matrixdf['left'] != matrixdf['right']]
            # remove duplicates
            matrixdf = matrixdf[~matrixdf[['left', 'right']].apply(frozenset, axis=1).duplicated()]
            # only select top 75%
            matrixdf = matrixdf[matrixdf.score > matrixdf.score.quantile(.75)]

            result_rows.append({
                "points": dataframe.to_dict(orient='records'),
                "adjMat": matrixdf.to_dict(orient='records')
            })

        return result_rows

    @cached(alias="default", key_builder=lambda fn, *args, **kwargs: "1f63a836_" + hash_args(args[1:]))
    async def get_available_columns(self):
        headers = {'api_key': self.__api_key, 'Content-Type': 'application/json'}
        response = requests.post(self.__catalog_endpoint, json={}, headers=headers)

        if response.status_code == 200:
            all_columns = response.json()

            # removes duplicate columns with different similarity operations for now
            filtered_columns = [c for c in all_columns if c['operation'] != 'pivot_based']

            return filtered_columns

        else:
            print(response.text)
            return []
