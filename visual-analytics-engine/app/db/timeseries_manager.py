import asyncio
import hashlib
import json
import sys
import uuid
from datetime import datetime, timedelta
from typing import Tuple, Union, TypedDict, List, Optional

import aiohttp
import numpy as np
import requests

from pydantic_models.requests.timeseries_correlate_payload import TimeseriesCorrelatePayload
from redis_tools import cached, hash_args
from tools.helpers import exception_to_status_message

# Can be used to generate different cache keys on every application startup
# by prepending it to the function args passed to key_builder.
run_id = str(uuid.uuid4())


class CorrelateParameters(TypedDict):
    api_key: str
    data: List[str]
    start: int
    window_size: int
    step_size: int
    steps: int
    correlation_method: str
    stocks_format: bool
    locale: Optional[str]


def correlate_make_cache_key(*args, **_):
    args_str = json.dumps(args[1], sort_keys=True)
    args_hash_str = str(hashlib.sha256(args_str.encode("utf-8")).hexdigest())
    return "5e20a7f5/" + args_hash_str


class TimeSeriesManager:
    def __init__(self, endpoint, api_key):
        self.__endpoint = endpoint
        self.__api_key = api_key

    async def catalog_search(self, filter_str: str, limit: int):
        def filter_fn(list_item: Tuple[str, dict]):
            return list_item[0].startswith(filter_str)

        ts_catalog = await self.get_available_timeseries()

        return dict(list(filter(filter_fn, ts_catalog.items()))[:limit])

    @cached(alias="default", key_builder=lambda fn, *args, **kwargs: "f7f34951_" + hash_args((run_id,) + args[1:]))
    async def get_available_timeseries(self):
        try:
            r = requests.post(self.__endpoint + "/catalog",
                              data=json.dumps({"api_key": self.__api_key}),
                              headers={'Content-Type': 'application/json'},
                              timeout=10)

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
                # # OLD FORMAT (List of Dicts)
                # for ts_record in content["filename_length_start_end"]:
                #     for key, value in ts_record.items():
                #         result[key] = {
                #             "numDatapoints": value["length"],
                #             "startDate": to_iso(value["start"]),
                #             "endDate": to_iso(value["end"])
                #         }
                # NEW FORMAT (List of Tuples)
                for ts_tuple in content["filename_length_start_end"]:
                    result[ts_tuple[0]] = {
                        "numDatapoints": ts_tuple[1],
                        "startDate": to_iso(ts_tuple[2], '%m-%d-%Y'),
                        "endDate": to_iso(ts_tuple[3], '%m-%d-%Y')
                    }

                return result
        except Exception as e:
            print(exception_to_status_message(e), file=sys.stderr)

        return {}

    async def correlate(self, payload: TimeseriesCorrelatePayload):
        # Translate to request format and attach additional information
        correlate_parameters: CorrelateParameters = dict(api_key=self.__api_key, data=payload.timeseries,
                                                         start=payload.start, window_size=payload.window_size,
                                                         step_size=payload.step_size, steps=payload.steps,
                                                         correlation_method=payload.correlation_method,
                                                         stocks_format=False, locale=payload.locale)

        try:
            r = await self._correlate_api_call(correlate_parameters)

            if r.ok:
                content = json.loads(r.content)

                correlations = list(map(lambda c: np.array(c, dtype=float), content["correlations"]))
                correlations_no_nan = list(map(lambda c: np.where(np.isnan(c), None, c), correlations))

                mean_correlation = np.nanmean(correlations, axis=0, dtype=float)
                mean_correlation_no_nan = np.where(np.isnan(mean_correlation), None, mean_correlation)

                mean_abs_correlation = np.nanmean(np.abs(correlations), axis=0, dtype=float)
                mean_abs_correlation_no_nan = np.where(np.isnan(mean_abs_correlation), None, mean_abs_correlation)

                ts_catalog = await self.get_available_timeseries()

                result = {
                    "timeseries": [{"tsName": ts_name, **ts_catalog[ts_name]} for ts_name in
                                   correlate_parameters["data"]],
                    "correlations": list(map(lambda c: c.tolist(), correlations_no_nan)),
                    "meanCorrelation": mean_correlation_no_nan.tolist(),
                    "meanAbsCorrelation": mean_abs_correlation_no_nan.tolist(),
                }

                # After getting correlations, also get the raw values in the specified interval
                async with aiohttp.ClientSession() as session:
                    res = await asyncio.gather(*[self._raw_datapoints_api_call(
                        session,
                        ts_catalog,
                        ts["tsName"],
                        correlate_parameters['start'],
                        correlate_parameters['start'] + correlate_parameters[
                            'steps']) for ts in result["timeseries"]])

                for ts, raw_datapoints in zip(result["timeseries"], res):
                    ts["rawDatapoints"] = raw_datapoints

                return result
            else:
                r.raise_for_status()

        except Exception as e:
            print(f"{type(e).__name__} while querying correlation for time-series '{payload.timeseries}': {e}")

        return None

    @cached(alias="default", key_builder=lambda fn, *args, **kwargs: "7658e24e_" + hash_args(args[1:]))
    async def _correlate_api_call(self, correlate_parameters: CorrelateParameters):
        data = json.dumps(correlate_parameters)
        return requests.post(self.__endpoint + "/correlate", data=data, headers={'Content-Type': 'application/json'})

    @cached(alias="default", key_builder=lambda fn, *args, **kwargs: "7658e24e_" + hash_args(args[2:]))
    async def _raw_datapoints_api_call(self, session: aiohttp.ClientSession, ts_catalog, ts_name: str,
                                       start: Union[int, str, datetime],
                                       end: Union[int, str, datetime]):

        # Convert an int giving the offset from the TS start to an ISO date string
        if type(start) == int and type(end) == int:
            start = (datetime.fromisoformat(ts_catalog[ts_name]["startDate"]) + timedelta(start)).isoformat()
            end = (datetime.fromisoformat(ts_catalog[ts_name]['startDate']) + timedelta(end)).isoformat()
        # Convert a datetime object to an ISO date string
        elif type(start) == datetime and type(end) == datetime:
            start = start.isoformat()
            end = end.isoformat()
        # Otherwise, assume that start and end already are an ISO date string
        else:
            pass

        raw_datapoints_parameters = {
            "api_key": self.__api_key,
            "path": ts_name,
            "start": from_iso(start, "%Y-%m-%d"),
            "end": from_iso(end, "%Y-%m-%d")
        }

        # print("Querying raw datapoints for time-series '" + ts_name + "'.")
        try:
            url = self.__endpoint + "/getData"
            data = json.dumps(raw_datapoints_parameters)

            # print("raw_datapoints/request", json.dumps(raw_datapoints_parameters, indent=4))

            async with session.post(url=url, data=data,
                                    headers={'Content-Type': 'application/json'}) as raw_datapoints_response:
                if raw_datapoints_response.ok:
                    raw_datapoints = await raw_datapoints_response.json()

                    print("raw_datapoints/response", raw_datapoints)

                    return [{"date": to_iso(date, "%Y-%m-%d"), "value": value} for value, date in
                            zip(raw_datapoints["data"], raw_datapoints["dates"])]
                else:
                    raw_datapoints_response.raise_for_status()
        except Exception as e:
            print(f"{type(e).__name__} while querying raw datapoints for time-series '{ts_name}': {e}")

        return []


def to_iso(date_str: str, format_str: str):
    date = datetime.strptime(date_str, format_str)
    return date.isoformat()


def from_iso(date_str: str, format_str: str):
    date = datetime.fromisoformat(date_str)
    return date.strftime(format_str)
