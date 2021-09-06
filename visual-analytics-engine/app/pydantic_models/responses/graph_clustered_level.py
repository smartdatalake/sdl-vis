from __future__ import annotations

from typing import List, Dict, Union

from pydantic import BaseModel


class Node(BaseModel):
    label: str
    cluster: int
    id: int
    level: int
    x: float
    y: float
    attributes: Dict[str, Union[float, str]]


class GraphClusteredLevel(BaseModel):
    transactionId: str
    nodes: List[Node]

    class Config:
        schema_extra = {
            "example": {
                "transactionId": "bZLkpADuuwVlOXI",
                "nodes": [
                    {
                        "label": "iris",
                        "cluster": 0,
                        "id": 15,
                        "level": 0,
                        "x": 7.953499794006348,
                        "y": 6.209072589874268,
                        "attributes": {
                            "iris$sepal_length": 5.7,
                            "iris$petal_length": 1.5
                        }
                    },
                    {
                        "label": "iris",
                        "cluster": 0,
                        "id": 19,
                        "level": 0,
                        "x": 6.395046234130859,
                        "y": 6.940788269042969,
                        "attributes": {
                            "iris$sepal_length": 5.1,
                            "iris$petal_length": 1.5
                        }
                    },
                    {
                        "label": "iris",
                        "cluster": 0,
                        "id": 24,
                        "level": 0,
                        "x": 7.3127031326293945,
                        "y": 6.360140800476074,
                        "attributes": {
                            "iris$sepal_length": 4.8,
                            "iris$petal_length": 1.9
                        }
                    },
                    {
                        "label": "iris",
                        "cluster": 0,
                        "id": 34,
                        "level": 0,
                        "x": 5.136235237121582,
                        "y": 7.875514507293701,
                        "attributes": {
                            "iris$sepal_length": 4.9,
                            "iris$petal_length": 1.5
                        }
                    },
                    {
                        "label": "iris",
                        "cluster": 0,
                        "id": 42,
                        "level": 0,
                        "x": 5.842156410217285,
                        "y": 7.663434982299805,
                        "attributes": {
                            "iris$sepal_length": 4.4,
                            "iris$petal_length": 1.3
                        }
                    },
                    {
                        "label": "iris",
                        "cluster": 1,
                        "id": 80,
                        "level": 0,
                        "x": 6.823776721954346,
                        "y": 7.869338512420654,
                        "attributes": {
                            "iris$sepal_length": 5.5,
                            "iris$petal_length": 3.8
                        }
                    },
                    {
                        "label": "iris",
                        "cluster": 1,
                        "id": 86,
                        "level": 0,
                        "x": 5.360720157623291,
                        "y": 7.225754261016846,
                        "attributes": {
                            "iris$sepal_length": 6.7,
                            "iris$petal_length": 4.7
                        }
                    },
                    {
                        "label": "iris",
                        "cluster": 1,
                        "id": 95,
                        "level": 0,
                        "x": 6.368307590484619,
                        "y": 8.35568618774414,
                        "attributes": {
                            "iris$sepal_length": 5.7,
                            "iris$petal_length": 4.2
                        }
                    },
                    {
                        "label": "iris",
                        "cluster": 2,
                        "id": 102,
                        "level": 0,
                        "x": 6.413705825805664,
                        "y": 5.500891208648682,
                        "attributes": {
                            "iris$sepal_length": 7.1,
                            "iris$petal_length": 5.9
                        }
                    },
                    {
                        "label": "iris",
                        "cluster": 2,
                        "id": 103,
                        "level": 0,
                        "x": 6.033418655395508,
                        "y": 5.297041893005371,
                        "attributes": {
                            "iris$sepal_length": 6.3,
                            "iris$petal_length": 5.6
                        }
                    },
                    {
                        "label": "iris",
                        "cluster": 1,
                        "id": 106,
                        "level": 0,
                        "x": 5.859716892242432,
                        "y": 4.963018894195557,
                        "attributes": {
                            "iris$sepal_length": 4.9,
                            "iris$petal_length": 4.5
                        }
                    },
                    {
                        "label": "iris",
                        "cluster": 2,
                        "id": 125,
                        "level": 0,
                        "x": 3.9553093910217285,
                        "y": 6.433642864227295,
                        "attributes": {
                            "iris$sepal_length": 7.2,
                            "iris$petal_length": 6
                        }
                    },
                    {
                        "label": "iris",
                        "cluster": 2,
                        "id": 128,
                        "level": 0,
                        "x": 3.6843414306640625,
                        "y": 5.54799747467041,
                        "attributes": {
                            "iris$sepal_length": 6.4,
                            "iris$petal_length": 5.6
                        }
                    },
                    {
                        "label": "iris",
                        "cluster": 2,
                        "id": 143,
                        "level": 0,
                        "x": 3.9031858444213867,
                        "y": 7.04716682434082,
                        "attributes": {
                            "iris$sepal_length": 6.8,
                            "iris$petal_length": 5.9
                        }
                    }
                ]
            }
        }
