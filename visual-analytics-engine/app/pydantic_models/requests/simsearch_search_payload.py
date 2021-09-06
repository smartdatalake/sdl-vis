from __future__ import annotations

from typing import List, Union, Dict, Optional

from pydantic import BaseModel

SearchParameterValue = Union[str, float, List[Union[str, float]]]


class SearchParameters(BaseModel):
    active: bool
    value: SearchParameterValue
    weights: List[float]
    column: str
    operation: str

    # The following are remains from the columns response
    datatype: Optional[str]
    sampleValue: Optional[SearchParameterValue]


class Projection(BaseModel):
    type: str
    k: int = 15
    epsilon: Optional[float] = 0.001
    maxIter: Optional[int] = 300


class SimsearchSearchPayload(BaseModel):
    attributes: Dict[str, SearchParameters]
    projection: Projection

    class Config:
        schema_extra = {
            "example": {
                "attributes": {
                    "revenue": {
                        "active": True,
                        "value": 561000,
                        "weights": [
                            0.5
                        ],
                        "column": "revenue",
                        "operation": "numerical_topk"
                    },
                    "employees": {
                        "active": True,
                        "value": 100,
                        "weights": [
                            0.5
                        ],
                        "column": "employees",
                        "operation": "numerical_topk"
                    }
                },
                "projection": {
                    "type": "mds",
                    "k": 15,
                    "epsilon": 0.001,
                    "maxIter": 300
                }
            }
        }
