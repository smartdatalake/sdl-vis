from __future__ import annotations

from typing import Union, Optional, Literal

from pydantic import BaseModel, Field


class BaseOp(BaseModel):
    confidence: Optional[float] = 90
    error: Optional[float] = 10


class BinningOp(BaseOp):
    type: Literal['binning']
    field: str
    num_bins: int = Field(..., alias="numBins")


class ProfilingOp(BaseOp):
    type: Literal['profiling']


class QuantileOp(BaseOp):
    type: Literal['quantile']
    field: str
    percentage: int


QALOp = Union[BinningOp, ProfilingOp, QuantileOp]


class QALPayload(BaseModel):
    table: str
    op: QALOp


qal_request_examples = {
    "binning": {
        "summary": "Binning",
        "value": {
            "table": "sct",
            "op": {
                "type": "binning",
                "field": "numberOfEmployees",
                "numBins": 3,
                "confidence": 90,
                "error": 10
            }
        }
    },
    "profiling": {
        "summary": "Table Profiling",
        "value": {
            "table": "sct",
            "op": {
                "type": "profiling",
                "confidence": 90,
                "error": 10
            }
        }
    },
    "quantile": {
        "summary": "Quantile",
        "value": {
            "table": "sct",
            "op": {
                "type": "quantile",
                "field": "numberOfEmployees",
                "percentage": 5,
                "confidence": 90,
                "error": 10
            }
        }
    },
}

qal_response_examples = {
    200: {
        "description": "Success",
        "content": {
            "application/json": {
                "examples": {
                    "binning": {
                        "summary": "Binning",
                        "value": [
                            {
                                "start": 0.0,
                                "end": 12823.666666666666,
                                "count": 8527415
                            },
                            {
                                "start": 12823.666666666666,
                                "end": 25647.333333333332,
                                "count": 0
                            },
                            {
                                "start": 25647.333333333332,
                                "end": 38471.0,
                                "count": 0
                            }
                        ]
                    },
                    "profiling": {
                        "summary": "Table Profiling",
                        "value": [
                            {
                                "name": "acheneID",
                                "type": "String",
                                "countNonNull": 72468220,
                                "countDistinct": 0,
                                "min": 0.0,
                                "max": 0.0,
                                "avg": 0.0,
                                "sum": 0.0,
                                "avgDistinct": 0,
                                "sumDistinct": 0.0
                            },
                            {
                                "name": "numberOfEmployees",
                                "type": "Integer",
                                "countNonNull": 34066790,
                                "countDistinct": 0,
                                "min": 0.0,
                                "max": 38471.0,
                                "avg": 3.4199180492203696,
                                "sum": 116505630.0,
                                "avgDistinct": 11650563,
                                "sumDistinct": 116505630.0
                            },
                            {
                                "name": "revenue",
                                "type": "Long",
                                "countNonNull": 4873420,
                                "countDistinct": 0,
                                "min": 0.0,
                                "max": 3686602000.0,
                                "avg": 1939194.9595971617,
                                "sum": 9450511500000.0,
                                "avgDistinct": 2147483647,
                                "sumDistinct": 9450511500000.0
                            },
                            {
                                "name": "EBITDA",
                                "type": "Double",
                                "countNonNull": 4144020,
                                "countDistinct": 0,
                                "min": -15693000.0,
                                "max": 295884000.0,
                                "avg": 169022.89564239554,
                                "sum": 700434260000.0,
                                "avgDistinct": 2147483647,
                                "sumDistinct": 700434260000.0
                            },
                            {
                                "name": "province",
                                "type": "String",
                                "countNonNull": 63379220,
                                "countDistinct": 0,
                                "min": 0.0,
                                "max": 0.0,
                                "avg": 0.0,
                                "sum": 0.0,
                                "avgDistinct": 0,
                                "sumDistinct": 0.0
                            },
                            {
                                "name": "legalStatus",
                                "type": "String",
                                "countNonNull": 72468220,
                                "countDistinct": 0,
                                "min": 0.0,
                                "max": 0.0,
                                "avg": 0.0,
                                "sum": 0.0,
                                "avgDistinct": 0,
                                "sumDistinct": 0.0
                            },
                            {
                                "name": "ww___ww",
                                "type": "Double",
                                "countNonNull": 72468220,
                                "countDistinct": 0,
                                "min": 0.0,
                                "max": 1.0,
                                "avg": 1.0,
                                "sum": 72468220.0,
                                "avgDistinct": 7246822,
                                "sumDistinct": 72468220.0
                            }
                        ]
                    },
                    "quantile": {
                        "summary": "Quantile",
                        "value": [
                            {
                                "percent": 20.0,
                                "value": 1.0
                            },
                            {
                                "percent": 40.0,
                                "value": 1.0
                            },
                            {
                                "percent": 60.0,
                                "value": 1.0
                            },
                            {
                                "percent": 80.0,
                                "value": 3.0
                            }
                        ]
                    },
                }
            }
        }
    },
}
