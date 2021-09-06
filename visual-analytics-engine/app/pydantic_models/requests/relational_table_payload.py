from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class RelationalTablePayload(BaseModel):
    proteus: bool = False
    table: str
    columns: Optional[List[str]]
    max_rows: Optional[int] = Field(alias="maxRows")

    class Config:
        schema_extra = {
            "example": {
                "proteus": False,
                "table": "actor",
                "columns": [
                    "actor_id",
                    "first_name",
                    "last_name"
                ],
                "maxRows": 2
            }
        }
