from __future__ import annotations

from typing import List

from pydantic_models.misc.data_transformation import DataTransformation
from pydantic_models.requests.relational_table_payload import RelationalTablePayload


class RelationalTableTransformPayload(RelationalTablePayload):
    transform: List[DataTransformation]

    class Config:
        schema_extra = {
            "example": {
                "proteus": False,
                "table": "actor",
                "columns": [
                    "actor_id"
                ],
                "maxRows": 100,
                "transform": [
                    {
                        "type": "bin",
                        "bins": 10,
                        "field": "actor_id"
                    },
                    {
                        "type": "aggregate",
                        "field": "count",
                        "op": "sum",
                        "as": "count_sum"
                    },
                    {
                        "type": "filter",
                        "query": "end <= 100"
                    },
                    {
                        "type": "sample",
                        "count": 3
                    }
                ]
            }
        }
