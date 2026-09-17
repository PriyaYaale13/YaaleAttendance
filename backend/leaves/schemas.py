from pydantic import BaseModel
from typing import Optional

class LeaveBase(BaseModel):
    empId: str
    name: str
    leaveType: str
    startDate: str
    endDate: str
    reason: str
    supportingDocs: Optional[str] = None
    status: Optional[str] = "Pending"
    rejectionReason: Optional[str] = None

class LeaveCreate(LeaveBase):
    pass

class LeaveResponse(LeaveBase):
    id: int

    class Config:
        from_attributes = True
