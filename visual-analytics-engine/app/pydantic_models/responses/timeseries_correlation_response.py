from __future__ import annotations

from typing import List

from pydantic import BaseModel


class TimePoint(BaseModel):
    date: str
    value: float


class Timeseries(BaseModel):
    tsName: str
    numDatapoints: int
    startDate: str
    endDate: str
    rawDatapoints: List[TimePoint]


class CorrelationResponse(BaseModel):
    timeseries: List[Timeseries]
    correlations: List[List[List[float]]]
    meanCorrelation: List[List[float]]
    meanAbsCorrelation: List[List[float]]

    class Config:
        schema_extra = {
            "example": {
                "timeseries": [
                    {
                        "tsName": "US- Butter Future_00110E.txt",
                        "numDatapoints": 1566,
                        "startDate": "2007-01-01T00:00:00",
                        "endDate": "2012-12-31T00:00:00",
                        "rawDatapoints": [
                            {
                                "date": "2007-01-01T00:00:00",
                                "value": 128.5
                            },
                            {
                                "date": "2007-01-02T00:00:00",
                                "value": 128.5
                            },
                            {
                                "date": "2007-01-03T00:00:00",
                                "value": 127.5
                            },
                            {
                                "date": "2007-01-04T00:00:00",
                                "value": 127.5
                            }
                        ]
                    },
                    {
                        "tsName": "US- Coffee -C- Future_000654.txt",
                        "numDatapoints": 1566,
                        "startDate": "2007-01-01T00:00:00",
                        "endDate": "2012-12-31T00:00:00",
                        "rawDatapoints": [
                            {
                                "date": "2007-01-01T00:00:00",
                                "value": 126.2
                            },
                            {
                                "date": "2007-01-02T00:00:00",
                                "value": 126.2
                            },
                            {
                                "date": "2007-01-03T00:00:00",
                                "value": 123.6
                            },
                            {
                                "date": "2007-01-04T00:00:00",
                                "value": 125.0
                            }
                        ]
                    }
                ],
                "correlations": [
                    [
                        [
                            1.0,
                            0.8429886839453135
                        ],
                        [
                            0.8429886839453135,
                            1.0
                        ]
                    ],
                    [
                        [
                            1.0,
                            -0.6317977517912003
                        ],
                        [
                            -0.6317977517912003,
                            1.0
                        ]
                    ],
                    [
                        [
                            1.0,
                            -0.9773555548504375
                        ],
                        [
                            -0.9773555548504375,
                            1.0
                        ]
                    ]
                ],
                "meanCorrelation": [
                    [
                        1.0,
                        -0.25538820756544145
                    ],
                    [
                        -0.25538820756544145,
                        1.0
                    ]
                ],
                "meanAbsCorrelation": [
                    [
                        1.0,
                        0.8173806635289838
                    ],
                    [
                        0.8173806635289838,
                        1.0
                    ]
                ]
            }
        }
