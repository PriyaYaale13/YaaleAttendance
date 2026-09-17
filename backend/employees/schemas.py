from pydantic import BaseModel, EmailStr
from typing import Optional

class EmployeeBase(BaseModel):
    employeeId: str
    fullName: str
    department: str
    designation: str
    joiningDate: str
    salaryDetails: str
    supervisorAssignment: Optional[str] = None
    contactInformation: str
    employmentStatus: str = 'Active'
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    payMode: Optional[str] = None
    upiNo: Optional[str] = None
    accountNumber: Optional[str] = None
    educationalQualification: Optional[str] = None
    skills: Optional[str] = None
    yearsOfExperience: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase):
    id: int

    class Config:
        from_attributes = True
