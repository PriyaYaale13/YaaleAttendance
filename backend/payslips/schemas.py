from pydantic import BaseModel
from typing import Optional

class PayslipBase(BaseModel):
    empId: str
    name: str
    department: str
    designation: str
    period: str
    basicSalary: float
    workingDays: int
    presentDays: int
    otHours: float
    otAmount: float
    allowances: float
    deductions: float
    netSalary: float
    status: str
    paymentDate: Optional[str] = None
    accountNo: Optional[str] = None
    paymentMode: Optional[str] = None

class PayslipCreate(PayslipBase):
    pass

class PayslipResponse(PayslipBase):
    id: int

    class Config:
        from_attributes = True
