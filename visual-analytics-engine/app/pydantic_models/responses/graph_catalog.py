from __future__ import annotations

from typing import List, Dict

from pydantic import BaseModel, Field


class Link(BaseModel):
    label: str
    title: str
    property: List[str]
    from_: int = Field(..., alias='from')
    to: int


class Node(BaseModel):
    id: int
    label: str
    title: str
    property: List[str]


class GraphSchema(BaseModel):
    links: List[Link]
    nodes: List[Node]


class GraphCatalog(BaseModel):
    __root__: Dict[str, GraphSchema]

    class Config:
        schema_extra = {
            "example": {
                "company_graph": {
                    "links": [],
                    "nodes": [
                        {
                            "id": 1,
                            "label": "Company",
                            "title": "id ; name",
                            "property": [
                                "id",
                                "name"
                            ]
                        }
                    ]
                },
                "people_graph": {
                    "links": [
                        {
                            "label": "WorksAt",
                            "title": "id ; fromId ; toId",
                            "property": [
                                "id",
                                "fromId",
                                "toId"
                            ],
                            "from": 1,
                            "to": 2
                        }
                    ],
                    "nodes": [
                        {
                            "id": 1,
                            "label": "Person",
                            "title": "id ; name ; employer",
                            "property": [
                                "id",
                                "name",
                                "employer"
                            ]
                        },
                        {
                            "id": 2,
                            "label": "Company",
                            "title": "id ; name",
                            "property": [
                                "id",
                                "name"
                            ]
                        }
                    ]
                }
            }
        }
