from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from passlib.context import CryptContext
import system_users.models as models
import system_users.schemas as schemas

from audit_logs.utils import create_audit_log

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/login/")
def login_system_user(user: schemas.SystemUserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.SystemUser).filter(models.SystemUser.user_name == user.userName).first()
    if not db_user:
        create_audit_log(db, "System", "Failed Login Attempt", "Authentication", user.userName, "-", "Failed", "User not found", "danger")
        raise HTTPException(status_code=404, detail="User not found")
    safe_password = user.password[:72]
    if not pwd_context.verify(safe_password, db_user.hashed_password):
        create_audit_log(db, "System", "Failed Login Attempt", "Authentication", user.userName, "-", "Failed", "Incorrect password", "danger")
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    # Successful login
    create_audit_log(db, f"{db_user.first_name} {db_user.last_name} ({db_user.role})", "Successful Login", "Authentication", user.userName, "-", "Logged In", "User logged in", "success")
    
    return schemas.SystemUserResponse(
        id=db_user.id, firstName=db_user.first_name, midName=db_user.mid_name, lastName=db_user.last_name,
        gender=db_user.gender, birthDate=db_user.birth_date, userName=db_user.user_name,
        email=db_user.email, secondaryEmail=db_user.secondary_email, contactNo=db_user.contact_no,
        secondaryContactNo=db_user.secondary_contact_no, role=db_user.role, systemDateFormat=db_user.system_date_format
    )

@router.post("/", response_model=schemas.SystemUserResponse)
def create_user(user: schemas.SystemUserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.SystemUser).filter(models.SystemUser.user_name == user.userName).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    db_email = db.query(models.SystemUser).filter(models.SystemUser.email == user.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # bcrypt has a 72 byte limit
    safe_password = user.password[:72]
    hashed_password = pwd_context.hash(safe_password)
    db_user = models.SystemUser(
        first_name=user.firstName, mid_name=user.midName, last_name=user.lastName,
        gender=user.gender, birth_date=user.birthDate, user_name=user.userName,
        hashed_password=hashed_password, email=user.email, secondary_email=user.secondaryEmail,
        contact_no=user.contactNo, secondary_contact_no=user.secondaryContactNo,
        role=user.role, system_date_format=user.systemDateFormat
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return schemas.SystemUserResponse(
        id=db_user.id, firstName=db_user.first_name, midName=db_user.mid_name, lastName=db_user.last_name,
        gender=db_user.gender, birthDate=db_user.birth_date, userName=db_user.user_name,
        email=db_user.email, secondaryEmail=db_user.secondary_email, contactNo=db_user.contact_no,
        secondaryContactNo=db_user.secondary_contact_no, role=db_user.role, systemDateFormat=db_user.system_date_format
    )

@router.get("/", response_model=List[schemas.SystemUserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.SystemUser).offset(skip).limit(limit).all()
    result = []
    for user in users:
        result.append(schemas.SystemUserResponse(
            id=user.id, firstName=user.first_name, midName=user.mid_name, lastName=user.last_name,
            gender=user.gender, birthDate=user.birth_date, userName=user.user_name,
            email=user.email, secondaryEmail=user.secondary_email, contactNo=user.contact_no,
            secondaryContactNo=user.secondary_contact_no, role=user.role, systemDateFormat=user.system_date_format
        ))
    return result

@router.get("/{user_id}", response_model=schemas.SystemUserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.SystemUser).filter(models.SystemUser.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return schemas.SystemUserResponse(
        id=db_user.id, firstName=db_user.first_name, midName=db_user.mid_name, lastName=db_user.last_name,
        gender=db_user.gender, birthDate=db_user.birth_date, userName=db_user.user_name,
        email=db_user.email, secondaryEmail=db_user.secondary_email, contactNo=db_user.contact_no,
        secondaryContactNo=db_user.secondary_contact_no, role=db_user.role, systemDateFormat=db_user.system_date_format
    )

@router.put("/{user_id}", response_model=schemas.SystemUserResponse)
def update_user(user_id: int, user: schemas.SystemUserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(models.SystemUser).filter(models.SystemUser.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    db_username = db.query(models.SystemUser).filter(models.SystemUser.user_name == user.userName, models.SystemUser.id != user_id).first()
    if db_username:
        raise HTTPException(status_code=400, detail="Username already registered by another user")

    db_email = db.query(models.SystemUser).filter(models.SystemUser.email == user.email, models.SystemUser.id != user_id).first()
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered by another user")
    
    if user.password:
        safe_password = user.password[:72]
        db_user.hashed_password = pwd_context.hash(safe_password)
        
    db_user.first_name = user.firstName
    db_user.mid_name = user.midName
    db_user.last_name = user.lastName
    db_user.gender = user.gender
    db_user.birth_date = user.birthDate
    db_user.user_name = user.userName
    db_user.email = user.email
    db_user.secondary_email = user.secondaryEmail
    db_user.contact_no = user.contactNo
    db_user.secondary_contact_no = user.secondaryContactNo
    db_user.role = user.role
    db_user.system_date_format = user.systemDateFormat
    
    db.commit()
    db.refresh(db_user)
    return schemas.SystemUserResponse(
        id=db_user.id, firstName=db_user.first_name, midName=db_user.mid_name, lastName=db_user.last_name,
        gender=db_user.gender, birthDate=db_user.birth_date, userName=db_user.user_name,
        email=db_user.email, secondaryEmail=db_user.secondary_email, contactNo=db_user.contact_no,
        secondaryContactNo=db_user.secondary_contact_no, role=db_user.role, systemDateFormat=db_user.system_date_format
    )

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.SystemUser).filter(models.SystemUser.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"ok": True}
