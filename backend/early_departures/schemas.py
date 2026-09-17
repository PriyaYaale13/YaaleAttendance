from pydantic import BaseModel
from typing import Optional

class EarlyDepartureBase(BaseModel):
    empId: str
    name: str
    date: str
    departureTime: str
    reason: str
    supportingInfo: Optional[str] = None
    status: Optional[str] = "Pending"

class EarlyDepartureCreate(EarlyDepartureBase):
    pass

class EarlyDepartureResponse(EarlyDepartureBase):
    id: int

    class Config:
        from_attributes = True
