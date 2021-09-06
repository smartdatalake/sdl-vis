from __future__ import annotations

from pydantic import BaseModel


class GraphClusterPayload(BaseModel):
    transactionId: str
    level: int
    clusterId: int
    numNeighbors: int
    idOfClosestNeighbor: int

    class Config:
        schema_extra = {
            "example": {
                "transactionId": "bZLkpADuuwVlOXI",
                "level": 1,
                "clusterId": 1,
                "numNeighbors": 3,
                "idOfClosestNeighbor": 99
            }
        }
