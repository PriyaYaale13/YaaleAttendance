from pydantic import BaseModel
from typing import Dict, Any

class RoleBase(BaseModel):
    name: str
    privileges: Dict[str, Any] = {}

class RoleCreate(RoleBase):
    pass

class RoleUpdate(RoleBase):
    pass

class Role(RoleBase):
    id: int

    class Config:
        from_attributes = True
