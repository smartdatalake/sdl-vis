from __future__ import annotations

from enum import Enum
from typing import List, Union

from pydantic import BaseModel


class DataType(str, Enum):
    NUMBER = 'NUMBER',
    GEOLOCATION = 'GEOLOCATION',
    DATE_TIME = 'DATE_TIME',
    KEYWORD_SET = 'KEYWORD_SET',


class SimilarityOperation(str, Enum):
    NUMERICAL_TOPK = "numerical_topk"
    SPATIAL_KNN = "spatial_knn"
    TEMPORAL_TOPK = "temporal_topk"
    CATEGORICAL_TOPK = "categorical_topk"


class SimsearchColumn(BaseModel):
    operation: SimilarityOperation
    datatype: DataType
    sampleValue: Union[Union[int, str], List[str]]
    column: str


class SimsearchColumns(BaseModel):
    __root__: List[SimsearchColumn]

    class Config:
        schema_extra = {
            "example": [
                {
                    "operation": "numerical_topk",
                    "datatype": "NUMBER",
                    "sampleValue": 1,
                    "column": "employees"
                },
                {
                    "operation": "spatial_knn",
                    "datatype": "GEOLOCATION",
                    "sampleValue": "POINT (12.75731 43.8982)",
                    "column": "location"
                },
                {
                    "operation": "temporal_topk",
                    "datatype": "DATE_TIME",
                    "sampleValue": "2019-05-10T00:00:00Z",
                    "column": "active_since"
                },
                {
                    "operation": "categorical_topk",
                    "datatype": "KEYWORD_SET",
                    "sampleValue": [
                        "E-mail",
                        "Insurance"
                    ],
                    "column": "keywords"
                }
            ]
        }
