import hashlib
import json
import sys
from datetime import datetime
from typing import List, Optional, Tuple

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


def correlate_make_cache_key(*args, **_):
    args_str = json.dumps(args[1], sort_keys=True)
    args_hash_str = str(hashlib.sha256(args_str.encode("utf-8")).hexdigest())
    return "5e20a7f5/" + args_hash_str


class TimeSeriesManager:
    def __init__(self, endpoint, api_key):
        self.__endpoint = endpoint
        self.__api_key = api_key

        self.__ts_catalog = self._get_available_timeseries()
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

            def date_transformer(date_str: str):
                date = datetime.strptime(date_str, '%m-%d-%Y')
                return date.isoformat()

            result = {}
            for ts_record in content["filename_length_start_end"]:
                for key, value in ts_record.items():
                    result[key] = {
                        "numDatapoints": value["length"],
                        "startDate": date_transformer(value["start"]),
                        "endDate": date_transformer(value["end"])
                    }

            return result

        return None

    @cache.cached(timeout=604800, make_cache_key=correlate_make_cache_key)
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

            result = {
                "timeseries": [{"tsName": ts_name, **self.__ts_catalog[ts_name]} for ts_name in
                               correlate_parameters["data"]],
                "correlations": list(map(lambda c: c.tolist(), correlations_no_nan)),
                "meanCorrelation": mean_correlation_no_nan.tolist(),
                "meanAbsCorrelation": mean_abs_correlation_no_nan.tolist(),
            }

            return result

        return None
