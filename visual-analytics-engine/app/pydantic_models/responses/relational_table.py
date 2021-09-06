from __future__ import annotations

from typing import List, Dict, Any

from pydantic import BaseModel


class RelationalTable(BaseModel):
    __root__: List[Dict[str, Any]]

    class Config:
        schema_extra = {
            "example": [
                {
                    "actor_id": 1,
                    "first_name": "Penelope",
                    "last_name": "Guiness"
                },
                {
                    "actor_id": 2,
                    "first_name": "Nick",
                    "last_name": "Wahlberg"
                }
            ]
        }
