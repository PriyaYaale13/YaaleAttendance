from pydantic import BaseModel
from typing import Optional
from datetime import date

class EmployeeDocumentBase(BaseModel):
    employeeId: str
    employeeName: str
    documentCategory: str
    documentStatus: Optional[str] = "Active"
    expiryDate: Optional[date] = None

class EmployeeDocumentCreate(EmployeeDocumentBase):
    pass

class EmployeeDocumentResponse(EmployeeDocumentBase):
    id: int
    fileName: str
    filePath: str

    class Config:
        from_attributes = True
