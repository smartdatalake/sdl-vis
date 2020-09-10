import requests
import sys

from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.manifold import MDS
import umap

import numpy as np
import pandas as pd
import csv
import json

import random
import re

class APIResultsError(Exception):
    pass

keywords_value = ['Computer+science', 'Electronics', 'Software', 'E-commerce']  # desired keywords
keywords_weights = [0.33]  # importance factor for keywords (between 0 and 1)
revenue_value = '100000'  # desired revenue
revenue_weights = [0.33]  # importance factor for revenue (between 0 and 1)
employees_value = '5'  # desired number of employees
employees_weights = [0.33]  # importance factor for employees (between 0 and 1)
location_value = 'POINT (12.4534 41.9029)'  # desired location
location_weights = '1.0'  # importance factor for location (between 0 and 1)

# DO NOT EDIT THE FOLLOWING
decay = 0.01

#service_url = 'http://83.212.114.165:10106/simsearch/search'
service_url = 'http://sdl-simsearch.magellan.imsi.athenarc.gr/simsearch/api/search'
api_key = 'UKON_nUmV6fyCF2bwenv3MeuqCzkcsMM8UKcX3zoBdhha'

k = 15  # the number of top results to return

# array of all keywords
allKeywords = []
# columns used for projections
projCols = ['revenue', 'numEmployees', 'keyBin']

scaler = StandardScaler()
pca = PCA(n_components=2)
mds = MDS(n_components=2)
umap = umap.UMAP()

baseline = dict()
prevReq = []
searches = []

def restCall(attributes):

    query_conditions = []

    for a in attributes.keys():
        if a == 'keywords' and attributes[a].get('active', False):
            keywords_weights = attributes[a].get('weight', [0.33])
            keywords_value = re.sub('[^A-Za-z0-9,+-]+', '', str(attributes[a].get('value', ''))).split(',')
            condition_keywords = {'operation': 'categorical_topk', 'column': 'keywords',
                                'value': keywords_value, 'weights': keywords_weights, 'decay': decay}
            query_conditions.append(condition_keywords)
            print(f"keywords: {keywords_value}: {keywords_weights}", flush=True)
        elif a == 'revenue' and attributes[a].get('active', False):
            revenue_weights = attributes[a].get('weight', [0.33])
            revenue_value = re.sub('[^0-9]+', '', str(attributes[a].get('value', '')))
            condition_revenue = {'operation': 'numerical_topk', 'column': 'revenue',
                                'value': revenue_value, 'weights': revenue_weights, 'decay': decay}
            query_conditions.append(condition_revenue)
            print(f"revenue: {revenue_value}: {revenue_weights}", flush=True)
        elif a == 'employees' and attributes[a].get('active', False):
            employees_weights = attributes[a].get('weight', [0.33])
            employees_value = re.sub('[^0-9]+', '', str(attributes[a].get('value', '')))
            condition_employees = {'operation': 'numerical_topk', 'column': 'employees', 
                                'value': employees_value, 'weights': employees_weights, 'decay': decay}
            query_conditions.append(condition_employees)
            print(f"employees: {employees_value}: {employees_weights}", flush=True)
        elif a == 'location' and attributes[a].get('active', False):
            location_weights = attributes[a].get('weight', [0.33])
            location_value = str(attributes[a].get('value', ''))
            condition_location = {'operation':'spatial_knn', 'column':['lon','lat'], 
                                'value':location_value, 'weights':location_weights, 'decay':decay}
            query_conditions.append(condition_location)
            print(f"location: {location_value}: {location_weights}", flush=True)


    # DO NOT EDIT THE FOLLOWING
    headers = { 'api_key' : api_key , 'Content-Type' : 'application/json'}
    params = {'k': k, 'queries': query_conditions}

    print("Params", json.dumps(list(map(lambda x: x["weights"], params["queries"])), indent=4))

    data = json.dumps(params)
    try:        
        r = requests.post(service_url, data=data, headers=headers)
        response = r.json()
        #print(response, flush=True)
        return response
    except Exception as e:
        print("Request failed", e, flush=True)
        return json.dumps("")


def keywords2binary(keystring):
    idx = []
    # remove brackets & whitespaces
    keystring = re.sub("[ \[\]]", '', keystring)

    # get keywords as vector
    keyvector = keystring.split(',')

    for key in keyvector:
        # check if keyword already exists in array of all keywords
        try:
            # yes -> get index in array
            idx.append(allKeywords.index(key))
        except:
            # no  -> add to array
            idx.append(len(allKeywords))
            allKeywords.append(key)

    # generate n hot encoded string from saved indices
    binary = list("0" * len(allKeywords))
    for i in idx:
        binary[i] = "1"

    return ''.join(binary)




def initProjections():
    global baseline
    global searches
    global prevReq

    projCols = ['revenue', 'numEmployees']

    try:
        attributes = {
            'keywords': {'weight': [0.7],
                'value': ['Computer+science','Electronics','Software','E-commerce'],
                'active': True},
            'revenue': {'weight': [0.5], 'value': '1000000', 'active': True},
            'employees': {'weight': [0.5], 'value': '50'}, 'active': True}
        response = restCall(attributes)
        results = response[0]['rankedResults']

        if results is None:
            raise APIResultsError("Invalid result set.")

    except Exception as e:
        print("Could not get results from SimSearch API.", e, file=sys.stderr)
        return json.dumps("")

    baseline['df'] = pd.DataFrame(
        columns=['id', 'rank', 'keywords', 'keywordsScore', 'revenue', 'revenueScore', 'employees',
                    'employeesScore', 'totalScore'])

    # ADD root search query
    baseline['df'] = baseline.get('df').append({
        'id': 'rootSearch',
        'rank': 0,
        'keywords': '[Computer+science,Electronics,Software,E-commerce]',
        'keywordsScore': 1,
        'revenue': 1000000,
        'revenueScore': 1,
        'employees': 50,
        'employeesScore': 1,
        'totalScore': 1
    }, ignore_index=True)

    for result in results:
        entry = dict()
        entry['id'] = result['id']
        entry['rank'] = result['rank']
        entry['totalScore'] = result['score']
        for attr in result['attributes']:
            entry[attr.get('name')] = attr.get('value')
            entry[attr.get('name') + 'Score'] = attr.get('score')
        baseline['df'] = baseline.get('df').append(entry, ignore_index=True)

    # fix colName mismatch between csv and api
    baseline['df'] = baseline['df'].rename(columns={'employees': 'numEmployees'})

    #remove nan
    baseline.get('df')[projCols] = baseline.get('df')[projCols].fillna(0)

    scaler.fit(baseline.get('df')[projCols])
    pca.fit(scaler.transform(baseline.get('df')[projCols]))

    baseline['df'] = baseline['df'].join(
        pd.DataFrame(pca.transform(scaler.transform(baseline.get('df')[projCols])), columns=['x', 'y']))
    baseline['df']['color'] = 'red'
    baseline['df'].loc[baseline.get("df")['id'] == 'rootSearch', 'color'] = 'black'

    prevReq = baseline['df']



def getprefetch(weights):
    projCols = ['revenue', 'numEmployees']

    # create weights vector +0-.2
    activeAttr = [
        k for k in weights.get('attributes',{}).keys() 
        if weights.get('attributes',{})[k].get('active') == True]
    
    i = 0
    for a in weights.get('attributes',{}).keys():
        if(a not in activeAttr):
            continue
        wval = weights.get('attributes',{})[a]['weight']
        no = [ wval, wval ]
        yes = [ max( wval - 0.2, 0), min( wval + 0.2, 1) ]

        wvect = []

        for j in range (len(activeAttr)):
            if i == j:
                wvect = wvect + yes
            else:
                wvect = wvect + no 
        i = i + 1 

        weights.get('attributes',{})[a]['weight'] = wvect
    
    response = restCall(weights.get('attributes', {}))

    if response == json.dumps(""):
        return json.dumps("")

    retobj = "["

    for i in range(len(response)):
        #    for call in response:

        cl = 'red'
        if i % 2 == 0:
            cl = 'green'

        corrAtt = activeAttr[int(i/2)]

        dataframe = pd.DataFrame()
        for result in response[i]['rankedResults']:

            entry = dict()
            entry['id'] = result['id']
            # entry['rank']= result['rank']
            # entry['totalScore'] = result['score']
            entry['color'] = cl
            #get corresponding attribute
            entry['attribute'] = corrAtt
            for attr in result['attributes']:
                entry[attr.get('name')] = attr.get('value')
                entry[attr.get('name') + 'Score'] = attr.get('score')

            dataframe = dataframe.append(entry, ignore_index=True)

        # fix colName mismatch between csv and api
        dataframe = dataframe.rename(columns={'employees': 'numEmployees'})

        # replace empty entries ('') with -1
        for col in projCols:
            dataframe[col][dataframe[col] == ''] = -1

        scaler.fit(dataframe[projCols])

        print(dataframe[projCols])

        # decide which projection to use
        if weights.get('type') == 'pca':
            dataframe = dataframe.join(
                pd.DataFrame(pca.transform(scaler.transform(dataframe[projCols])), columns=['x', 'y']))
        elif weights.get('type') == 'mds':
            mds = MDS(n_components=2, eps=weights.get('epsilon', 0.001), max_iter=weights.get('maxIter', 300))
            dataframe = dataframe.join(pd.DataFrame(mds.fit_transform(dataframe[projCols]), columns=['x', 'y']))
        elif weights.get('type') == 'umap':
            dataframe = dataframe.join(
                pd.DataFrame(umap.fit_transform(scaler.transform(dataframe[projCols])), columns=['x', 'y']))

        retobj = retobj + dataframe.to_json(orient='records') + ','

    retobj = retobj[:-1]
    retobj = retobj + "]"

    return retobj



def getprojection(weights):
    global prevReq

    projCols = ['revenue', 'numEmployees']

    # vectorize
    for a in weights.get('attributes',{}).keys():
        print(a, flush=True)
        weights.get('attributes',{})[a]['weight'] = [ weights.get('attributes',{})[a]['weight'] ]
    #        weightVector = [[weights.get('w1', 0.33)], [weights.get('w2', 0.33)], [weights.get('w3', 0.33)]]

    try:

        response = restCall(weights.get('attributes',{}))
        # process request

        results = response[0]['rankedResults']
        matrix = response[0]['similarityMatrix']

    except:
        return json.dumps("")

    retobj = dict()
    retobj['df'] = pd.DataFrame(
        columns=['id', 'rank', 'keywords', 'keywordsScore', 'revenue', 'revenueScore', 'employees',
                    'employeesScore'])
    for result in results:
        entry = dict()
        entry['id'] = result['id']
        entry['rank'] = result['rank']
        entry['totalScore'] = result['score']
        entry['color'] = 'red'
        for attr in result['attributes']:
            entry[attr.get('name')] = attr.get('value')
            entry[attr.get('name') + 'Score'] = attr.get('score')
        retobj['df'] = retobj.get('df').append(entry, ignore_index=True)

    matrixdf = pd.DataFrame(matrix)
    # print(matrixdf,flush=True)

    # ADD root search query
    retobj['df'] = retobj.get('df').append({
        'id': 'rootSearch',
        'rank': 0,
        'keywords': '[Computer+science,Electronics,Software,E-commerce]',
        'keywordsScore': 1,
        'revenue': 1000000,
        'revenueScore': 1,
        'employees': 50,
        'employeesScore': 1,
        'totalScore': 1,
        'color': 'black'
    }, ignore_index=True)

    # fix colName mismatch between csv and api
    retobj['df'] = retobj['df'].rename(columns={'employees': 'numEmployees'})

    # replace empty entries ('') with -1
    for col in projCols:
        retobj['df'][col][retobj['df'][col] == ''] = -1


    # remove items where left & right have same id
    matrixdf = matrixdf[matrixdf['left'] != matrixdf['right']]
    # remove duplicates
    matrixdf = matrixdf[~matrixdf[['left', 'right']].apply(frozenset, axis=1).duplicated()]
    # only select top 75%
    matrixdf = matrixdf[matrixdf.score > matrixdf.score.quantile(.75)]
    
    scaler.fit(retobj.get('df')[projCols])

    # decide which projection to use
    if weights.get('type') == 'pca':
        retobj = retobj.get('df').join(
            pd.DataFrame(pca.transform(scaler.transform(retobj.get('df')[projCols])), columns=['x', 'y']))
    elif weights.get('type') == 'mds':
        mds = MDS(n_components=2, eps=weights.get('epsilon', 0.001), max_iter=weights.get('maxIter', 300))
        retobj = retobj.get('df').join(pd.DataFrame(mds.fit_transform(retobj.get('df')[projCols]), columns=['x', 'y']))
    elif weights.get('type') == 'umap':
        retobj = retobj.get('df').join(
            pd.DataFrame(umap.fit_transform(scaler.transform(retobj.get('df')[projCols])), columns=['x', 'y']))

    # change color of dots that stay to black
    #retobj.loc[retobj['id'].isin(prevReq['id'].values), 'color'] = 'mediumblue'
    # change color of rootNode
    retobj.loc[retobj['id'] == 'rootSearch', 'color'] = 'black'

    prevReq = retobj

    # combine pca & ajdMat
    retobj = "[" + retobj.to_json(orient='records') + ',' + matrixdf.to_json(orient='records') + ']'

    return retobj
