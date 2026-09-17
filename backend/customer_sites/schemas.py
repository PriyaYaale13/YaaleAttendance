from pydantic import BaseModel
from typing import Optional

class CustomerSiteBase(BaseModel):
    siteName: str
    customerName: str
    siteLocation: str
    assignedSupervisor: Optional[str] = None
    assignedEmployees: Optional[str] = None
    workingHours: Optional[str] = None
    qrCodeConfig: Optional[str] = None
    siteStatus: Optional[str] = "Active"

class CustomerSiteCreate(CustomerSiteBase):
    pass

class CustomerSiteResponse(CustomerSiteBase):
    id: int

    class Config:
        from_attributes = True
