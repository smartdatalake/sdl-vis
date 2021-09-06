from __future__ import annotations

from enum import Enum
from typing import Optional, List

from pydantic import BaseModel, Field


class CorrelationMethod(str, Enum):
    PEARSON = 'pearson',
    KENDALL = 'kendall',
    SPEARMAN = 'spearman',


class TimeseriesCorrelatePayload(BaseModel):
    timeseries: List[str]
    start: int
    window_size: int = Field(alias="windowSize")
    step_size: int = Field(alias="stepSize")
    steps: int
    correlation_method: CorrelationMethod = Field(alias="correlationMethod")
    locale: Optional[str]

    class Config:
        schema_extra = {
            "example": {
                "timeseries": [
                    "US- Butter Future_00110E.txt",
                    "US- Coffee -C- Future_000654.txt"
                ],
                "start": 0,
                "windowSize": 3,
                "stepSize": 3,
                "steps": 3,
                "correlationMethod": "pearson"
            }
        }
