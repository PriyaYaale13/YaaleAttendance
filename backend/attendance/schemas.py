from pydantic import BaseModel
from typing import Optional

class AttendanceBase(BaseModel):
    employeeId: str
    date: str
    inTime: Optional[str] = None
    outTime: Optional[str] = None
    workingHours: Optional[str] = None
    location: Optional[str] = None

class AttendanceResponse(AttendanceBase):
    id: int
    name: Optional[str] = None

    class Config:
        from_attributes = True

class AttendanceScan(BaseModel):
    employeeId: str
    location: Optional[str] = None
