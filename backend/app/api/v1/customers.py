from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel as PydanticBase

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.core.pagination import paginate
from app.core.phone import normalize_phone
from app.models.customer import Customer
from app.models.user import User

router = APIRouter(prefix="/customers", tags=["customers"])


class CustomerCreate(PydanticBase):
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None
    birth_year: Optional[int] = None
    address: Optional[str] = None
    note: Optional[str] = None


class CustomerUpdate(PydanticBase):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None
    birth_year: Optional[int] = None
    address: Optional[str] = None
    note: Optional[str] = None


def _customer_dict(c: Customer) -> dict:
    return {
        "id": c.id,
        "full_name": c.full_name,
        "phone": c.phone,
        "normalized_phone": c.normalized_phone,
        "email": c.email,
        "gender": c.gender,
        "birth_year": c.birth_year,
        "address": c.address,
        "note": c.note,
        "is_active": c.is_active,
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
    }


@router.post("", status_code=201)
def create_customer(
    payload: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    normalized = normalize_phone(payload.phone) if payload.phone else None
    customer = Customer(
        full_name=payload.full_name,
        phone=payload.phone,
        normalized_phone=normalized,
        email=payload.email,
        gender=payload.gender,
        birth_year=payload.birth_year,
        address=payload.address,
        note=payload.note,
        created_by=current_user.id,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return success_response(data=_customer_dict(customer), message="Customer created")


@router.get("")
def list_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    keyword: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Customer).filter(Customer.deleted_at.is_(None))
    if keyword:
        like = f"%{keyword}%"
        query = query.filter(
            (Customer.full_name.ilike(like)) | (Customer.phone.ilike(like)) | (Customer.normalized_phone.ilike(like))
        )
    query = query.order_by(Customer.created_at.desc())
    result = paginate(query, page=page, page_size=page_size)
    result["items"] = [_customer_dict(c) for c in result["items"]]
    return success_response(data=result, message="OK")


@router.get("/{customer_id}")
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    customer = db.query(Customer).filter(Customer.id == customer_id, Customer.deleted_at.is_(None)).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return success_response(data=_customer_dict(customer), message="OK")


@router.put("/{customer_id}")
def update_customer(
    customer_id: int,
    payload: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = db.query(Customer).filter(Customer.id == customer_id, Customer.deleted_at.is_(None)).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if payload.full_name is not None:
        customer.full_name = payload.full_name
    if payload.phone is not None:
        customer.phone = payload.phone
        customer.normalized_phone = normalize_phone(payload.phone)
    if payload.email is not None:
        customer.email = payload.email
    if payload.gender is not None:
        customer.gender = payload.gender
    if payload.birth_year is not None:
        customer.birth_year = payload.birth_year
    if payload.address is not None:
        customer.address = payload.address
    if payload.note is not None:
        customer.note = payload.note
    customer.updated_by = current_user.id

    db.commit()
    db.refresh(customer)
    return success_response(data=_customer_dict(customer), message="Customer updated")
