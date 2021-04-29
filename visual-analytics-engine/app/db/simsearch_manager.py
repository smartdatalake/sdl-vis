import copy
import json

import numpy as np
import pandas as pd
import requests
import umap
from flask import jsonify
from sklearn.cluster import KMeans
from sklearn.manifold import MDS
from sklearn.metrics import silhouette_score

from tools.flask_cache import cache


class SimSearchManager:
    __k = 15  # the number of results to return
    all_columns = []

    def __init__(self, endpoint, catalog_endpoint, api_key):
        self.__service_url = endpoint
        self.__api_key = api_key
        self.all_columns = self._get_available_columns(catalog_endpoint)

    @cache.memoize()
    def _api_call(self, query_conditions):
        headers = {'api_key': self.__api_key, 'Content-Type': 'application/json'}
        params = {'k': self.__k, 'queries': query_conditions}

        data = json.dumps(params)

        return requests.post(self.__service_url, data=data, headers=headers)

    def handle_request(self, args):
        self.__k = args.get('projection', {}).get('k', 15)
        print(args, flush=True)
        # construct root seach object
        rootSearch = {
            'id': 'rootSearch',
            'totalScore': 1
        }

        query_conditions = []
        attributes = args.get('attributes', {})

        # loop over request parameters
        for attribute in attributes.keys():
            if (
                    attributes[attribute].get('active', False) and
                    attribute in [d['column'] for d in self.all_columns]
            ):
                condition = copy.deepcopy(
                    next((item for item in self.all_columns if item['column'] == attribute), None))
                # TODO: input sanitation dependent on datatype
                condition['value'] = attributes[attribute].get('value', '')
                condition['weights'] = [str(w) for w in attributes[attribute].get('weights', ['1'])]
                condition['decay'] = .01
                query_conditions.append(condition)
                rootSearch[attribute] = str(attributes[attribute].get('value', ''))
                rootSearch[(attribute + 'Score')] = 1

        # print(query_conditions, flush=True)
        if len(query_conditions) > 0:
            response = self._api_call(query_conditions)
        else:
            return jsonify(code=404, reason='no params specified'), 404

        if response.status_code != 200:
            print(f"response: {response}", flush=True)
            return jsonify(code=404, reason="incorrect parameters specified"), 404

        response = response.json()
        # print(response, flush=True)

        if response[0].get('rankedResults', None) is None:
            try:
                print(f" {str(response[0]['notification'])}", flush=True)
                return jsonify(code=404, reason=str(response[0]['notification'])), 404
            except Exception as e:
                print(f"somethings wrong", flush=True)
                return jsonify(code=404, reason=str(e)), 404

        retstr = "["

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
            dataframe = pd.concat([pd.DataFrame(rootSearch, index=[0]), dataframe]).reset_index(drop=True)

            # add edges of rootSearch to edgelist
            edgelist = response[i]['similarityMatrix']
            for r in response[i]['rankedResults']:
                edgelist.append({'left': 'rootSearch', 'right': r['id'], 'score': r['score']})
                edgelist.append({'left': r['id'], 'right': 'rootSearch', 'score': r['score']})

            # transform edge list to adjacency Matrix
            mat = np.ones((dataframe.shape[0], dataframe.shape[0]))
            for edge in edgelist:
                lidx = dataframe.loc[dataframe['id'] == edge['left']].index.tolist()[0]
                ridx = dataframe.loc[dataframe['id'] == edge['right']].index.tolist()[0]
                mat[lidx][ridx] = edge['score']

            # decide on projection to be used
            if args.get('projection').get('type') in ['pca', 'mds']:
                mds = MDS(n_components=2, random_state=1, eps=args.get('projection').get('epsilon', 0.001),
                          max_iter=args.get('projection').get('maxIter', 300), dissimilarity='precomputed')
                dataframe = dataframe.join(
                    pd.DataFrame(
                        mds.fit_transform(
                            mat),
                        columns=['x', 'y']))
            elif args.get('projection').get('type') == 'umap':
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

            retstr = retstr + "{" + '"points": ' + dataframe.to_json(orient='records') + ","
            retstr = retstr + '"adjMat": ' + matrixdf.to_json(orient='records')
            retstr = retstr + "},"
        retstr = retstr[:-1] + "]"

        # return Response(json.dumps(retarr))
        return retstr

    def _get_available_columns(self, catalog_endpoint):
        headers = {'api_key': self.__api_key, 'Content-Type': 'application/json'}
        response = requests.post(catalog_endpoint, json={}, headers=headers)

        if response.status_code == 200:
            return response.json()
        else:
            print(response.text)
            return {}
