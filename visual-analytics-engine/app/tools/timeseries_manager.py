import requests
import json
import pandas as pd

service_url = 'http://83.212.114.165:10110/timeseries/'
api_key = 'UKON_nUmV6fyCF2bwenv3MeuqCzkcsMM8UKcX3zoBdhha'

class TimeSeriesManager:

    __stock_name = 'TCL Electronics Holdings Ltd._016288'
    __smoothing_factor = 0.02


#    def __init__(self):

    def handleRequest(self, args):
        json_str = '['
        companies = args.get('activeCompanies', [])
        for company in companies:
        # call the service
            data = dict()
            data['api_key'] = api_key
            data['ts_name'] = company
            data['smoothing_factor'] = self.__smoothing_factor
            data = json.dumps(data)
            r = requests.post(service_url + 'preview', data=data)
            response = r.json()

            stock_data = pd.DataFrame.from_dict(json.loads(response['content']))
            json_str = json_str + stock_data.to_json(orient='records') + ', '

        json_str = json_str[:-2] + "]"
        return json_str

    def getAllCompanies(self,args):
        data = dict()
        data['api_key'] = api_key
        data = json.dumps(data)
        r = requests.post(service_url + 'catalog', data=data)
        response = r.json()
        status = response['status']
        message = response['message']
        stocks = response['content']

        return json.dumps(response['content'])
