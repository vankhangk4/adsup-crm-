from typing import Optional, List
from pydantic import BaseModel


class UserCreate(BaseModel):
    full_name: str
    email: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    password: str
    department_id: Optional[int] = None
    status: str = "active"


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department_id: Optional[int] = None


class UserStatusUpdate(BaseModel):
    status: str  # active / inactive / locked


class UserPasswordUpdate(BaseModel):
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    department_id: Optional[int] = None
    status: str
    is_active: bool
    online_status: str

    model_config = {"from_attributes": True}


class AssignRolesRequest(BaseModel):
    role_ids: List[int]
