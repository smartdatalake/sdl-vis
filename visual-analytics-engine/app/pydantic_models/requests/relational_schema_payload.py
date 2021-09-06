from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel


class RelationalSchemaPayload(BaseModel):
    proteus: bool = False
    tables: Optional[List[str]]

    class Config:
        schema_extra = {
            "example": {
                "proteus": False,
                "tables": ["actor", "actor_info"]
            }
        }
