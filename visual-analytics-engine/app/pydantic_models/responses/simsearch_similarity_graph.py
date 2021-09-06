from __future__ import annotations

from typing import List

from pydantic import BaseModel, Extra


class SimilarityGraphNode(BaseModel):
    x: float
    y: float
    id: str
    totalScore: float
    cluster: int

    class Config:
        extra = Extra.allow


class SimilarityGraphEdge(BaseModel):
    left: str
    right: str
    score: float


class SimilarityGraph(BaseModel):
    adjMat: List[SimilarityGraphEdge]
    points: List[SimilarityGraphNode]

    class Config:
        schema_extra = {
            "example": [
                {
                    "adjMat": [
                        {
                            "left": "root_search",
                            "right": "27a9ac65-edf9-4e73-8ab2-6d7582ff8bcc",
                            "score": 0.8913772860068429
                        },
                        {
                            "left": "root_search",
                            "right": "2cb34ed0-32df-4aec-96f0-b3382fd719a7",
                            "score": 0.888029318251166
                        },
                        {
                            "left": "27a9ac65-edf9-4e73-8ab2-6d7582ff8bcc",
                            "right": "2cb34ed0-32df-4aec-96f0-b3382fd719a7",
                            "score": 0.8791932788989538
                        }
                    ],
                    "points": [
                        {
                            "x": 0.602197971574332,
                            "y": -0.21710734442023796,
                            "id": "root_search",
                            "totalScore": 1.0,
                            "cluster": 0,
                            "revenueScore": 1.0,
                            "revenue": "561000",
                            "employeesScore": 1.0,
                            "employees": "100"
                        },
                        {
                            "x": -0.6005035030555687,
                            "y": 0.17857843026563242,
                            "id": "27a9ac65-edf9-4e73-8ab2-6d7582ff8bcc",
                            "totalScore": 0.9146624277106377,
                            "cluster": 1,
                            "revenueScore": 0.951229424500714,
                            "revenue": 556000.0,
                            "employeesScore": 0.8780954309205613,
                            "employees": 87.0
                        },
                        {
                            "x": -0.6091589284771861,
                            "y": -0.10918310841585634,
                            "id": "2cb34ed0-32df-4aec-96f0-b3382fd719a7",
                            "totalScore": 0.893249817955993,
                            "cluster": 1,
                            "revenueScore": 0.835270211411272,
                            "revenue": 579000.0,
                            "employeesScore": 0.951229424500714,
                            "employees": 95.0
                        }
                    ]
                }
            ]
        }


class SimilarityGraphs(BaseModel):
    __root__: List[SimilarityGraph]
