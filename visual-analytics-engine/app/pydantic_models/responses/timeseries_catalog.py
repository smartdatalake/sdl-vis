from __future__ import annotations

from typing import Dict

from pydantic import BaseModel


class TimeseriesCatalogEntry(BaseModel):
    numDatapoints: int
    startDate: str
    endDate: str


class TimeseriesCatalog(BaseModel):
    __root__: Dict[str, TimeseriesCatalogEntry]

    class Config:
        schema_extra = {
            "example": {
                "US- Butter Future_00110E.txt": {
                    "numDatapoints": 1531,
                    "startDate": "2013-03-30T00:00:00",
                    "endDate": "2019-07-12T00:00:00"
                },
                "US- Coffee -C- Future_000654.txt": {
                    "numDatapoints": 1531,
                    "startDate": "2013-03-30T00:00:00",
                    "endDate": "2019-07-12T00:00:00"
                },
                "US- Corn-Future_001047.txt": {
                    "numDatapoints": 1531,
                    "startDate": "2013-03-30T00:00:00",
                    "endDate": "2019-07-12T00:00:00"
                },
                "US- Cotton No.2 Future_000655.txt": {
                    "numDatapoints": 1531,
                    "startDate": "2013-03-30T00:00:00",
                    "endDate": "2019-07-12T00:00:00"
                },
                "US- Feeder Cattle-Future_001061.txt": {
                    "numDatapoints": 1531,
                    "startDate": "2013-03-30T00:00:00",
                    "endDate": "2019-07-12T00:00:00"
                }
            }
        }
