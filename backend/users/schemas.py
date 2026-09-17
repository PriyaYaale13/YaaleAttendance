from pydantic import BaseModel, EmailStr
from typing import Optional

class SystemUserBase(BaseModel):
    firstName: str
    midName: Optional[str] = None
    lastName: str
    gender: Optional[str] = None
    birthDate: Optional[str] = None
    userName: str
    email: EmailStr
    secondaryEmail: Optional[str] = None
    contactNo: Optional[str] = None
    secondaryContactNo: Optional[str] = None
    role: str = "admin"
    systemDateFormat: str = "DD/MM/YYYY"

class SystemUserCreate(SystemUserBase):
    password: str

class SystemUserUpdate(SystemUserBase):
    password: Optional[str] = None

class SystemUserResponse(SystemUserBase):
    id: int

    class Config:
        from_attributes = True
