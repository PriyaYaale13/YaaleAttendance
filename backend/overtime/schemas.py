from pydantic import BaseModel
from typing import Optional

class OvertimeBase(BaseModel):
    empId: str
    name: str
    date: str
    actualWorkingHours: Optional[str] = None
    potentialOtHours: Optional[str] = None
    submittedOtHours: Optional[str] = None
    supervisorReviewedOt: Optional[str] = None
    adminApprovedOt: Optional[str] = None
    paidOtHours: Optional[str] = None
    outstandingOtBalance: Optional[str] = None
    status: Optional[str] = "Pending Submission"

class OvertimeCreate(OvertimeBase):
    pass

class OvertimeResponse(OvertimeBase):
    id: int
    class Config:
        from_attributes = True
