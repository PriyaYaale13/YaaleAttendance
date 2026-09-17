from pydantic import BaseModel
from typing import Optional
from datetime import date

class TimecardBase(BaseModel):
    employeeId: str
    employeeName: str
    designation: str
    noOfWorkingDays: int
    salary: str
    timecardDate: date

class TimecardCreate(TimecardBase):
    pass

class TimecardResponse(TimecardBase):
    id: int
    fileName: str
    filePath: str
    uploadDate: date

    class Config:
        from_attributes = True
