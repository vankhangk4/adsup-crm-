from typing import Optional, List
from pydantic import BaseModel


class RoleCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None


class RoleResponse(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool

    model_config = {"from_attributes": True}


class AssignPermissionsRequest(BaseModel):
    permission_ids: Optional[List[int]] = None
    codes: Optional[List[str]] = None
