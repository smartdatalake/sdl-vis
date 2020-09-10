import json
import sys

import requests


class QALManager:
    _qal_endpoint = None

    def __init__(self, qal_endpoint):
        self._qal_endpoint = qal_endpoint

    def query(self, table, op):
        return self._query_cache_helper(table, json.dumps(op, sort_keys=True))

    def _query_cache_helper(self, table, op_hashable_json):
        op = json.loads(op_hashable_json)

        optional_qal_params = {}
        if "confidence" in op:
            optional_qal_params["confidence"] = op["confidence"]
        if "error" in op:
            optional_qal_params["error"] = op["error"]

        if op["type"] == "binning":
            return self._binning(table,
                                 op["field"],
                                 op["numBins"],
                                 **optional_qal_params)

        if op["type"] == "profiling":
            return self._profiling(table,
                                   **optional_qal_params)

        if op["type"] == "quantile":
            return self._quantile(table,
                                  op["field"],
                                  op["percentage"],
                                  **optional_qal_params)

        return {}

    def _binning(self, table, field, num_bins, confidence=90, error=10):
        table_profile = self._profiling(table)
        table_profile_filtered = list(filter(lambda f: f["name"] == field, table_profile))

        if len(table_profile_filtered) == 1:
            field_profile = table_profile_filtered[0]

            min_val = field_profile["min"]
            max_val = field_profile["max"]

            query = f"select binning({field},{min_val},{max_val},{num_bins}) from {table} confidence {confidence} error {error}"
            return self._execute_query(query)

        return []

    def _profiling(self, table, confidence=90, error=10):
        query = f"dataProfile {table} confidence {confidence} error {error}"
        return self._execute_query(query)

    def _quantile(self, table, field, percentage, confidence=90, error=10):
        query = f"select quantile({field},{percentage}) from {table} confidence {confidence} error {error}"
        return self._execute_query(query)

    def _execute_query(self, query):
        response = requests.get(self._qal_endpoint, params={"query": query})

        try:
            python_obj = response.json()

            if isinstance(python_obj, list):
                return python_obj
        except Exception as e:
            print("[ERR] Error on processing of QAL response.", str(e), file=sys.stderr)

        return []
