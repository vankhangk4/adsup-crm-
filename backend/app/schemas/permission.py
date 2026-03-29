from typing import Optional
from pydantic import BaseModel


class PermissionCreate(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    module: Optional[str] = None


class PermissionResponse(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str] = None
    module: Optional[str] = None
    is_active: bool

    model_config = {"from_attributes": True}
