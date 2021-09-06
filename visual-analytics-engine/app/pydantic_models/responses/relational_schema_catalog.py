from __future__ import annotations

from typing import List, Dict

from pydantic import BaseModel


class Column(BaseModel):
    column_name: str
    data_type: str


class RelationalSchemaCatalog(BaseModel):
    __root__: Dict[str, List[Column]]

    class Config:
        schema_extra = {
            "example": {
                "actor": [
                    {
                        "column_name": "actor_id",
                        "data_type": "integer"
                    },
                    {
                        "column_name": "first_name",
                        "data_type": "character varying"
                    },
                    {
                        "column_name": "last_name",
                        "data_type": "character varying"
                    },
                    {
                        "column_name": "last_update",
                        "data_type": "timestamp without time zone"
                    }
                ],
                "actor_info": [
                    {
                        "column_name": "actor_id",
                        "data_type": "integer"
                    },
                    {
                        "column_name": "first_name",
                        "data_type": "character varying"
                    },
                    {
                        "column_name": "last_name",
                        "data_type": "character varying"
                    },
                    {
                        "column_name": "film_info",
                        "data_type": "text"
                    }
                ]
            }
        }
