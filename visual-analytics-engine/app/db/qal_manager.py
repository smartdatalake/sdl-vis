import sys
from typing import Callable, Union

import requests
from fastapi import HTTPException

from pydantic_models.requests.qal_payload import BinningOp, ProfilingOp, QuantileOp, QALOp

is_int: Callable[[Union[int, float]], bool] = lambda v: int(v) == v
clamp: Callable[[int], int] = lambda v: min(100, max(0, v))
percentage_to_int: Callable[[Union[float, int]], int] = lambda v: clamp(int(v) if is_int(v) else int(v * 100))


class QALManager:
    _qal_endpoint = None

    def __init__(self, qal_endpoint):
        self._qal_endpoint = qal_endpoint

    async def query(self, table, op: QALOp):
        # Make sure that confidence is int, otherwise QAL service breaks.
        op.confidence = percentage_to_int(op.confidence)
        op.error = percentage_to_int(op.error)

        if op.type == "binning":
            return self._binning(table, op)

        if op.type == "profiling":
            return self._profiling(table, op)

        if op.type == "quantile":
            return self._quantile(table, op)

        return {}

    def _binning(self, table, op: BinningOp):
        table_profile = self._profiling(table, op)
        table_profile_filtered = list(filter(lambda f: f["name"] == op.field, table_profile))

        if len(table_profile_filtered) == 1:
            field_profile = table_profile_filtered[0]

            min_val = field_profile["min"]
            max_val = field_profile["max"]

            query = f"select binning({op.field},{min_val},{max_val},{op.num_bins}) from {table} confidence {op.confidence} error {op.error}"
            return self._execute_query(query)

        return []

    def _profiling(self, table, op: ProfilingOp):
        query = f"dataprofile {table} confidence {op.confidence} error {op.error}"
        return self._execute_query(query)

    def _quantile(self, table, op: QuantileOp):
        query = f"select quantile({op.field},{op.percentage}) from {table} confidence {op.confidence} error {op.error}"
        return self._execute_query(query)

    def _execute_query(self, query: str):
        try:
            response = requests.get(self._qal_endpoint, params={"query": query})

            if not response.ok:
                response.raise_for_status()

            python_obj = response.json()

            if isinstance(python_obj, list):
                return python_obj
        except Exception as e:
            error_msg = f"Error in QAL request for query '{query}': {e}"
            print("[ERR] " + error_msg, file=sys.stderr)
            raise HTTPException(status_code=500, detail=error_msg)

        return []
