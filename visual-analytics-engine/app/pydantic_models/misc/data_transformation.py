from __future__ import annotations

from typing import Union, Literal

from pydantic import BaseModel, Field


class TransformBin(BaseModel):
    type: Literal['bin']
    bins: int
    field: str


class TransformAggregate(BaseModel):
    type: Literal['aggregate']
    field: str
    op: str
    as_: str = Field(alias='as')


class TransformFilter(BaseModel):
    type: Literal['filter']
    query: str


class TransformSample(BaseModel):
    type: Literal['sample']
    count: int


DataTransformation = Union[TransformBin, TransformAggregate, TransformFilter, TransformSample]
