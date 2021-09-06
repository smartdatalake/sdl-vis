import sys

import requests

from pydantic_models.requests.qal_payload import QALOp


class QALManager:
    _qal_endpoint = None

    def __init__(self, qal_endpoint):
        self._qal_endpoint = qal_endpoint

    async def query(self, table, op: QALOp):
        if op.type == "binning":
            return self._binning(table, op)

        if op.type == "profiling":
            return self._profiling(table, op)

        if op.type == "quantile":
            return self._quantile(table, op)

        return {}

    def _binning(self, table, op: QALOp):
        table_profile = self._profiling(table, op)
        table_profile_filtered = list(filter(lambda f: f["name"] == op.field, table_profile))

        if len(table_profile_filtered) == 1:
            field_profile = table_profile_filtered[0]

            min_val = field_profile["min"]
            max_val = field_profile["max"]

            query = f"select binning({op.field},{min_val},{max_val},{op.num_bins}) from {table} confidence {op.confidence} error {op.error}"
            return self._execute_query(query)

        return []

    def _profiling(self, table, op: QALOp):
        query = f"dataProfile {table} confidence {op.confidence} error {op.error}"
        return self._execute_query(query)

    def _quantile(self, table, op: QALOp):
        query = f"select quantile({op.field},{op.percentage}) from {table} confidence {op.confidence} error {op.error}"
        return self._execute_query(query)

    def _execute_query(self, query: str):
        response = requests.get(self._qal_endpoint, params={"query": query})

        try:
            python_obj = response.json()

            if isinstance(python_obj, list):
                return python_obj
        except Exception as e:
            print("[ERR] Error on processing of QAL response.", str(e), file=sys.stderr)

        return []
