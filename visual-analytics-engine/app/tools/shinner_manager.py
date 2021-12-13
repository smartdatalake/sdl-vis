import json

import networkx as nx
import pandas as pd
import requests


class ShinnerManager:
    _service_url = None
    sourceCons = {}  # dictionary of all source constraints in the ggds
    ggds = {}

    def __init__(self, gcore_endpoint):
        self._service_url = gcore_endpoint
        r = requests.get(self._service_url + 'graphDB')
        print(r.content)

    def get_graphs(self):
        print("GCore service url::" + self._service_url)
        r = requests.get(self._service_url + 'graphDB')
        x = json.loads(r.content)
        print(x)
        return json.dumps(x)

    def graph_schema(self, name=None):
        urlGCore = self._service_url + 'graphDB/' + name
        r = requests.get(url=urlGCore)
        #print(json.loads(r.content))
        x = json.loads(r.content)
        return x

    def set_ggds(self, ggds):
        r = requests.post(url=self._service_url + 'ggds/setGGDs', data=ggds)
        print(r.content)
        return r.content

    # def set_ggd_ui(self, ggd, id):
    #    self.ggds[id] = ggd
    #    print(self.ggds[ggd])
    #    return("GGD " + id + " setted!")

    # def set_ggd_ui_all(self):
    #    ggdsArray = self.ggds.items()
    #    print(ggdsArray)
    #    r = requests.post(url=self._service_url+'ggds/setGGDs', json = ggdsArray)
    #    print("Here answer to set ggds:" + r.content)
    #    return r.content

    def get_ggds(self):
        r = requests.get(url=self._service_url + 'ggds/getGGDs')
        x = json.loads(r.content)
        return x
        #return r.content

    def drop_ggds(self, info):
        r = requests.post(url=self._service_url + 'ggds/dropGGDs', json=info)
        return r.content

    def run_ER(self):
        r = requests.get(url=self._service_url + 'ggds/runER')
        x = json.loads(r.content)
        return x

    def target_graph_create(self, target):
        r = requests.post(url=self._service_url + 'ggds/createGraph', json=target)
        return r.content

    def set_source_constraints(self, cons, ggd):
        self.sourceCons[ggd] = cons
        print(self.sourceCons[ggd])
        return "GGDs Constraints setted!"

    def selectQuery(self, query, limit):
        # json = {"key": "value"}
        r = requests.post(url=self._service_url + 'gcore/select', json={"query": query, "limit": limit})
        # r = requests.post(url=service_url + 'gcore/select', data=query)
        # tableData = pd.DataFrame.from_dict(json.loads(r['content']))
        tableData = json.loads(r.content)
        return tableData

    def constructQuery(self, query, limit):
        print(query)
        r = requests.post(url=self._service_url + 'gcore/construct', json={"query": query, "limit": limit})
        # r = requests.post(url=service_url + "gcore/construct", data=query)
        #jsonobj = json.loads(r.content)
        print(r.content)
        #graph = r.content  # nx.readwrite.json_graph.node_link_graph(r.content)
        graph = json.loads(r.content)
        return graph
        #return graph

    #def selectQuery_table(self, tableName, graphName=None):
    #    if graphName is None:
    #        query = "SELECT * MATCH (a:" + tableName + ")"
    #    else:
    #        query = "SELECT * MATCH (a:" + tableName + ") ON " + graphName
    #    r = requests.post(url=self._service_url + 'gcore/select', data=query)
    #    tableData = pd.DataFrame.from_dict(json.loads(r['content']))
    #    return tableData

    #def constructQuery_graph(self, resPattern, matchPattern, graphName=None):
    #    if graphName is None:
    #        query = "CONSTRUCT " + resPattern + " MATCH " + matchPattern
    #    else:
    #        query = "CONSTRUCT " + resPattern + " MATCH " + matchPattern + " ON " + graphName
    #    r = requests.post(url=self._service_url + "gcore/construct", data=query)
    #    graph = nx.readwrite.json_graph.node_link_graph(r.content)
    #    return graph

    def selectQuery_table(self, tableName, graphName=None):
        if graphName is None:
            query = "SELECT * MATCH (a:" + tableName + ")"
        else:
            query = "SELECT * MATCH (a:" + tableName + ") ON " + graphName
        r = requests.post(url=self._service_url + 'gcore/select', data=query)
        tableData = pd.DataFrame.from_dict(json.loads(r['content']))
        return tableData

    def constructQuery_graph(self, resPattern, matchPattern, graphName=None):
        if graphName is None:
            query = "CONSTRUCT " + resPattern + " MATCH " + matchPattern
        else:
            query = "CONSTRUCT " + resPattern + " MATCH " + matchPattern + " ON " + graphName
        r = requests.post(url=self._service_url + "gcore/construct", data=query)
        graph = nx.readwrite.json_graph.node_link_graph(r.content)
        return graph

    # example json file
    #    with open("data/graph.txt") as json_file:
    #        jsonParam = json.load(json_file)
    #    print(jsonParam)
    #    r = requests.post(url='http://localhost:8080/gcore/construct-neighbor', json=jsonParam)

    # json format for "passing node information"
    # {
    #        "nodeLabel": "ProductAmazon",
    #        "id": "1",
    #        "edgeLabel": "",
    #        "graphName": "Amazon",
    #        "limit": -1
    #    }
    def getNeighbors(self, nodeParam):
        r = requests.post(url=self._service_url + "gcore/select-neighbor", json=nodeParam)
        neighborData = pd.DataFrame.from_dict(json.loads(r['content']))
        return neighborData

    def getNeighborsGraph(self, nodeParam):
        r = requests.post(url=self._service_url + "gcore/construct-neighbor", json=nodeParam)
        graphNeighbor = nx.readwrite.json_graph.node_link_graph(r.content)
        return graphNeighbor

    def startVisualization(self, param):
        print(param)
        r = requests.post(url=self._service_url + "graphvis/initialvis", json=param)
        print(r.content)
        return r.content  # jsonify(data=r.content)
        # initialGraph = nx.readwrite.json_graph.node_link_graph(r.content)
        # return initialGraph

    def nextLevelGraph(self, param):
        print(param)
        r = requests.post(url=self._service_url + "graphvis/nextlevel", json=param)
        print(r.content)
        return r.content  # jsonify(data=r.content)
