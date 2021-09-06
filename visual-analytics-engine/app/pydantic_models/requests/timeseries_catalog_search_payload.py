from __future__ import annotations

from pydantic import BaseModel, Field


class TimeseriesCatalogSearchPayload(BaseModel):
    filter_str: str = Field(alias="filterStr")
    limit: int

    class Config:
        schema_extra = {
            "example": {
                "filterStr": "US-",
                "limit": 100
            }
        }
