from __future__ import annotations

from typing import Union, Optional

from pydantic import BaseModel, Field


class BaseParams(BaseModel):
    type: str
    confidence: Optional[Union[int, float]] = 90
    error: Optional[Union[int, float]] = 10


class BinningParams(BaseParams):
    field: str
    num_bins: int = Field(..., alias="numBins")


class ProfilingParams(BaseParams):
    pass


class QuantileParams(BaseParams):
    field: str
    percentage: float


QALOp = Union[BinningParams, ProfilingParams, QuantileParams]


class QALPayload(BaseModel):
    table: str
    op: QALOp
