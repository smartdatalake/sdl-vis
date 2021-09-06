from __future__ import annotations

from pydantic_models.responses.relational_table import RelationalTable


class RelationalTableTransformed(RelationalTable):
    class Config:
        schema_extra = {
            "example": [
                {
                    "start": 1,
                    "end": 15.2,
                    "count": 15,
                    "count_sum": 100
                },
                {
                    "start": 57.8,
                    "end": 72,
                    "count": 14,
                    "count_sum": 100
                },
                {
                    "start": 43.599999999999994,
                    "end": 57.8,
                    "count": 14,
                    "count_sum": 100
                }
            ]
        }
