import hashlib
import json
import sys
from datetime import datetime, timedelta
from typing import List, Optional, Tuple, Union, Dict

import numpy as np

from tools import cache

if sys.version_info >= (3, 8):
    from typing import TypedDict
else:
    from typing_extensions import TypedDict

import requests


class CorrelateParameters(TypedDict):
    data: List[str]
    start: int
    window_size: int
    step_size: int
    steps: int
    correlation_method: str
    locale: Optional[str]
    api_key: Optional[str]


class TSCatalogEntry(TypedDict):
    numDatapoints: int
    startDate: str
    endDate: str


def correlate_make_cache_key(*args, **_):
    args_str = json.dumps(args[1], sort_keys=True)
    args_hash_str = str(hashlib.sha256(args_str.encode("utf-8")).hexdigest())
    return "5e20a7f5/" + args_hash_str


class TimeSeriesManager:
    def __init__(self, endpoint, api_key):
        self.__endpoint = endpoint
        self.__api_key = api_key

        self.__ts_catalog: Dict[str, TSCatalogEntry] = self._get_available_timeseries()
        print(self.__ts_catalog)

    def catalog_search(self, filter_str: str, limit: int):
        def filter_fn(list_item: Tuple[str, dict]):
            return list_item[0].startswith(filter_str)

        return dict(list(filter(filter_fn, self.__ts_catalog.items()))[:limit])

    @cache.cached(timeout=604800, make_cache_key=lambda *_, **__: "c2d372b5")
    def _get_available_timeseries(self):
        r = requests.get(self.__endpoint + "/catalog")

        if r.ok:
            content = json.loads(r.content)

            # Result format:
            # {
            #     "filename_length_start_end": [
            #         {
            #             "EU- Corn Future_0011B1.txt": {
            #                 "length": 1531,
            #                 "start": "03-30-2013",
            #                 "end": "07-12-2019"
            #             }
            #         },
            #         ...
            #     ]
            # }
            #
            # Transform this to key-value store:
            # {
            #     "EU- Corn Future_0011B1.txt": {
            #         "length": 1531,
            #         "start": "03-30-2013",
            #         "end": "07-12-2019"
            #     },
            #     ...
            # }

            result = {}
            for ts_record in content["filename_length_start_end"]:
                for key, value in ts_record.items():
                    result[key] = {
                        "numDatapoints": value["length"],
                        "startDate": to_iso(value["start"]),
                        "endDate": to_iso(value["end"])
                    }

            return result

        return None

    # @cache.cached(timeout=604800, make_cache_key=correlate_make_cache_key)
    def correlate(self, correlate_parameters: CorrelateParameters):
        correlate_parameters["api_key"] = self.__api_key
        data = json.dumps(correlate_parameters)
        r = requests.post(self.__endpoint + "/correlate", data=data, headers={'Content-Type': 'application/json'})

        if r.ok:
            content = json.loads(r.content)

            correlations = list(map(lambda c: np.array(c, dtype=float), content["correlations"]))
            correlations_no_nan = list(map(lambda c: np.where(np.isnan(c), None, c), correlations))

            mean_correlation = np.nanmean(correlations, axis=0, dtype=float)
            mean_correlation_no_nan = np.where(np.isnan(mean_correlation), None, mean_correlation)

            mean_abs_correlation = np.nanmean(np.abs(correlations), axis=0, dtype=float)
            mean_abs_correlation_no_nan = np.where(np.isnan(mean_abs_correlation), None, mean_abs_correlation)

            # After getting correlations, also get the raw values in the specified interval

            result = {
                "timeseries": [{"tsName": ts_name, **self.__ts_catalog[ts_name]} for ts_name in
                               correlate_parameters["data"]],
                "correlations": list(map(lambda c: c.tolist(), correlations_no_nan)),
                "meanCorrelation": mean_correlation_no_nan.tolist(),
                "meanAbsCorrelation": mean_abs_correlation_no_nan.tolist(),
            }

            for ts in result["timeseries"]:
                ts["rawDatapoints"] = self.raw_datapoints(ts["tsName"], correlate_parameters['start'],
                                                          correlate_parameters['start'] + correlate_parameters['steps'])

            return result

        return None

    def raw_datapoints(self, ts_name: str, start: Union[int, str, datetime],
                       end: Union[int, str, datetime]) -> Optional[List[float]]:

        # Convert an int giving the offset from the TS start to an ISO date string
        if type(start) == int and type(end) == int:
            start = (datetime.fromisoformat(self.__ts_catalog[ts_name]["startDate"]) + timedelta(start)).isoformat()
            end = (datetime.fromisoformat(self.__ts_catalog[ts_name]['startDate']) + timedelta(end)).isoformat()
        # Convert a datetime object to an ISO date string
        elif type(start) == datetime and type(end) == datetime:
            start = start.isoformat()
            end = end.isoformat()
        # Otherwise, assume that start and end already are an ISO date string
        else:
            pass

        print("start, end", start, end)

        raw_datapoints_parameters = {
            "api_key": self.__api_key,
            "path": ts_name,
            "start": from_iso(start),
            "end": from_iso(end)
        }

        print("raw_datapoints_parameters", raw_datapoints_parameters)

        data = json.dumps(raw_datapoints_parameters)
        r = requests.post(self.__endpoint + "/getData", data=data, headers={'Content-Type': 'application/json'})

        if r.ok:
            content = json.loads(r.content)
            return content["data"]

        return None


def to_iso(date_str: str):
    date = datetime.strptime(date_str, '%m-%d-%Y')
    return date.isoformat()


def from_iso(date_str: str):
    date = datetime.fromisoformat(date_str)
    return date.strftime("%m-%d-%Y")
