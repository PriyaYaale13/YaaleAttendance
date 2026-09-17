from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class AuditLogCreate(BaseModel):
    user: str
    action: str
    module: str
    record: str
    details: Dict[str, Any]
    remarks: str
    severity: str

class AuditLogResponse(BaseModel):
    id: int
    timestamp: datetime
    user: str
    action: str
    module: str
    record: str
    details: Dict[str, Any]
    remarks: str
    severity: str

    class Config:
        from_attributes = True
