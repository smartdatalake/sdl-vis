from __future__ import annotations

from typing import Any, List, Optional, Dict

from pydantic import BaseModel


class GraphSettings(BaseModel):
    graphName: str
    graphAttributes: List[str]


class AlgorithmSettings(BaseModel):
    algorithm: str
    featureExtractor: Optional[str]
    algorithmParams: Dict[str, Dict[str, Any]]


class GraphInitPayload(BaseModel):
    graphSettings: GraphSettings
    algorithmSettings: AlgorithmSettings

    class Config:
        schema_extra = {
            "example": {
                "graphSettings": {
                    "graphName": "Iris",
                    "graphAttributes": [
                        "iris$sepal_length",
                        "iris$petal_length"
                    ]
                },
                "algorithmSettings": {
                    "algorithm": "kmeansf",
                    "featureExtractor": None,
                    "algorithmParams": {
                        "kmeansf": {
                            "k": 3,
                            "reps": 5,
                            "algorep": "topk"
                        }
                    }
                }
            }
        }
