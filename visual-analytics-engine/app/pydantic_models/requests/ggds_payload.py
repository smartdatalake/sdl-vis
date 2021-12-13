from __future__ import annotations

from typing import Any, List, Optional, Dict

from pydantic import BaseModel


class ConstraintSettings(BaseModel):
    attr1: str
    attr2: str
    distance: str
    operator: str
    threshold: str

class VerticesSettings(BaseModel):
    label: str
    variable:str

class EdgeSettings(BaseModel):
    label: str
    variable:str
    fromVariable: str
    toVariable: str

class GraphPatternSettings(BaseModel):
    name: str
    vertices: List[VerticesSettings]
    edges: List[EdgeSettings]

class GGDsPayload(BaseModel):
    sourceGP: List[GraphPatternSettings] = None
    sourceCons: List[ConstraintSettings] = None
    targetGP: List[GraphPatternSettings] = None
    targetCons: List[ConstraintSettings] = None

class GGDsPayloadList(BaseModel):
    ggds: List[GGDsPayload]