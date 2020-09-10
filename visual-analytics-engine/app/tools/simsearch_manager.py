import json
import re

import pandas as pd
import requests
import umap
from sklearn.decomposition import PCA
from sklearn.manifold import MDS
from sklearn.preprocessing import StandardScaler


class SimSearchManager:
    __service_url = 'http://sdl-simsearch.magellan.imsi.athenarc.gr/simsearch/api/search'
    __api_key = 'UKON_nUmV6fyCF2bwenv3MeuqCzkcsMM8UKcX3zoBdhha'
    __k = 15  # the number of results to return
    __allKeywords = []  # list of all keywords contained in query
    __rootKeywordsBin = ""  # binary representation of keywords of root query

    __projection_cols = []  # columns used to compute projection

    def _api_call(self, query_conditions):
        headers = {'api_key': self.__api_key, 'Content-Type': 'application/json'}
        params = {'k': self.__k, 'queries': query_conditions}

        data = json.dumps(params)

        try:
            r = requests.post(self.__service_url, data=data, headers=headers)
            response = r.json()
            # print("Received response for ", data, ":\n", response)
            return response
        except Exception as e:
            return json.dumps("Request error." + str(e)), 400

    def handle_request(self, args):
        self.__k = args.get('projection', {}).get('k', 15)
        self.__projection_cols = []

        query_conditions = []
        attributes = args.get('attributes', {})
        # prepare args for api call
        for attribute in attributes.keys():
            if (
                    attribute == 'keywords' and
                    attributes[attribute].get('active', False)
            ):
                query_conditions.append({
                    'operation': 'categorical_topk', 'column': 'keywords',
                    'value': [re.sub('[^A-Za-z0-9,+-]+', '', str(kword)) for kword in
                              attributes[attribute].get('value')],
                    'weights': [str(w) for w in attributes[attribute].get('weights', [1])],
                    'decay': 0.01})
                self.__projection_cols.append('keywordsSim')
            elif (
                    attribute == 'revenue' and
                    attributes[attribute].get('active', False)
            ):
                query_conditions.append({
                    'operation': 'numerical_topk', 'column': 'revenue',
                    'value': re.sub('[^0-9]+', '', str(attributes[attribute].get('value', ''))),
                    'weights': [str(w) for w in attributes[attribute].get('weights', [1])],
                    'decay': 0.01})
                self.__projection_cols.append('revenue')
            elif (
                    attribute == 'employees' and
                    attributes[attribute].get('active', False)
            ):
                query_conditions.append({
                    'operation': 'numerical_topk', 'column': 'employees',
                    'value': re.sub('[^0-9]+', '', str(attributes[attribute].get('value', ''))),
                    'weights': [str(w) for w in attributes[attribute].get('weights', [1])],
                    'decay': 0.01})
                self.__projection_cols.append('numEmployees')
            elif (
                    attribute == 'location' and
                    attributes[attribute].get('active', False)
            ):
                query_conditions.append({
                    'operation': 'spatial_knn', 'column': ['lon', 'lat'],
                    'value': str(attributes[attribute].get('value', '')),
                    'weights': [str(w) for w in attributes[attribute].get('weights', [1])],
                    'decay': 0.01})
                self.__projection_cols.append('lon')
                self.__projection_cols.append('lat')

        # print(query_conditions, flush=True)
        response = self._api_call(query_conditions)

        # add dummy dimension if input only has 1 column
        if len(self.__projection_cols) < 2:
            self.__projection_cols.append('add1')

        # print(response, flush=True)
        if response[0]['rankedResults'] is None:
            try:
                return json.dumps(response[0]['notification']), 400
            except Exception as e:
                return json.dumps(""), 400

        retstr = "["

        for i in range(len(response)):
            dataframe = pd.DataFrame()

            self.__allKeywords = []
            self.__rootKeywordsBin = self._keywords_to_binary(
                ",".join(args.get('attributes').get('keywords', {}).get('value', "")))

            # loop over returned datapoints
            for result in response[i]['rankedResults']:
                entry = dict()
                entry['id'] = result['id']
                # loop over each attribute
                for attr in result['attributes']:
                    entry[attr.get('name')] = attr.get('value')
                    entry[attr.get('name') + 'Score'] = attr.get('score')

                if 'keywordsSim' in self.__projection_cols:
                    entry['keywordsBin'] = self._keywords_to_binary(entry['keywords'])

                if 'lon' in self.__projection_cols:
                    location = re.findall(r"\(([^\)]+)\)", entry.get("[lon, lat]", "(0 0)"))[0].split(" ")
                    entry['lon'] = float(location[0])
                    entry['lat'] = float(location[1])

                dataframe = dataframe.append(entry, ignore_index=True)

            # fix colName mismatch between csv and api
            dataframe = dataframe.rename(columns={'employees': 'numEmployees'})

            if 'keywordsSim' in self.__projection_cols:
                # pad the keywords vector to len(self.__allKeywords)
                self.__rootKeywordsBin = self.__rootKeywordsBin.ljust(len(self.__allKeywords), '0')
                dataframe['keywordsBin'] = dataframe['keywordsBin'].str.pad(width=len(self.__allKeywords), fillchar="0",
                                                                            side='right')
                dataframe['keywordsSim'] = 0

                # compute similarity of keywords
                dataframe['keywordsSim'] = dataframe.apply(
                    lambda row: self._compare_binary_keywords(row['keywordsBin'])
                    , axis=1)

            try:
                rootLoc = \
                    re.findall(r"\(([^\)]+)\)", str(args.get('attributes').get('location', {}).get('value', "(0 0)")))[
                        0].split(" ")
            except IndexError:
                rootLoc = "0 0".split(" ")

            # print(rootLoc, flush=True)
            # add root search query
            dataframe = dataframe.append({
                'id': 'rootSearch',
                'keywords': args.get('attributes').get('keywords', {}).get('value', ""),
                'keywordsScore': 1,
                'revenue': str(args.get('attributes').get('revenue', {}).get('value', 0)),
                'revenueScore': 1,
                'numEmployees': str(args.get('attributes').get('employees', {}).get('value', 0)),
                'employeesScore': 1,
                '[lon, lat]': str(args.get('attributes').get('location', {}).get('value', "")),
                '[lon, lat]Score': 1,
                'lon': rootLoc[0],
                'lat': rootLoc[1],
                'keywordsBin': self.__rootKeywordsBin,
                'keywordsSim': 1,
                'totalScore': 1,
            }, ignore_index=True)

            # replace empty entries ('') with -1
            for col in self.__projection_cols:
                if col in dataframe:
                    dataframe[col] = dataframe[col].replace('', -1)

            # add dummy dimension if input only has 1 column
            if 'add1' in self.__projection_cols:
                dataframe['add1'] = 1

            # print(dataframe[['[lon, lat]', 'lon', 'lat']], flush=True)

            # fit scaler
            scaler = StandardScaler()
            scaler.fit(dataframe[self.__projection_cols])

            # decide on projection to be used
            if args.get('projection').get('type', 'pca') == 'pca':
                pca = PCA(n_components=2)
                pca.fit(scaler.transform(dataframe[self.__projection_cols]))
                dataframe = dataframe.join(
                    pd.DataFrame(
                        pca.transform(
                            scaler.transform(
                                dataframe[self.__projection_cols])),
                        columns=['x', 'y']))
            elif args.get('projection').get('type') == 'mds':
                mds = MDS(n_components=2, eps=args.get('projection').get('epsilon', 0.001),
                          max_iter=args.get('projection').get('maxIter', 300))
                dataframe = dataframe.join(
                    pd.DataFrame(
                        mds.fit_transform(
                            dataframe[self.__projection_cols]),
                        columns=['x', 'y']))
            elif args.get('projection').get('type') == 'umap':
                umapper = umap.UMAP()
                dataframe = dataframe.join(
                    pd.DataFrame(
                        umapper.fit_transform(
                            scaler.transform(
                                dataframe[self.__projection_cols])),
                        columns=['x', 'y']))

            # drop dimensions unnecessary for return object
            dataframe = dataframe.drop(['keywordsBin', 'keywordsSim', 'lon', 'lat'], axis=1, errors='ignore')

            matrixdf = pd.DataFrame(response[i]['similarityMatrix'])
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

        return retstr

    def _keywords_to_binary(self, keystring):
        idx = []
        # remove brackets & whitespaces
        keystring = re.sub("[ \[\]]", '', keystring)

        # get keywords as vector
        keyvector = keystring.split(',')

        for key in keyvector:
            # check if keyword already exists in array of all keywords
            try:
                # yes -> get index in array
                idx.append(self.__allKeywords.index(key))
            except:
                # no  -> add to array
                idx.append(len(self.__allKeywords))
                self.__allKeywords.append(key)

        # generate n hot encoded string from saved indices
        binary = list("0" * len(self.__allKeywords))
        for i in idx:
            binary[i] = "1"

        return ''.join(binary)

    def _compare_binary_keywords(self, binKeyword):
        idx = 0
        res = 0
        for bit in binKeyword:
            if bit == self.__rootKeywordsBin[idx]:
                if bit == 1:
                    res = res + 2 / len(self.__allKeywords)
                else:
                    res = res + 1 / len(self.__allKeywords)
            idx = idx + 1

        return res
