from audit_logs.utils import create_audit_log
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from . import models, schemas

router = APIRouter()

@router.post("/", response_model=schemas.Role)
def create_role(role: schemas.RoleCreate, db: Session = Depends(get_db)):
    db_role = db.query(models.Role).filter(models.Role.name == role.name).first()
    if db_role:
        raise HTTPException(status_code=400, detail="Role already exists")
    new_role = models.Role(name=role.name, privileges=role.privileges)
    db.add(new_role)
    create_audit_log(db, "System User", "Created Record: Create Role", "Roles", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    db.refresh(new_role)
    return new_role

@router.get("/", response_model=list[schemas.Role])
def read_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    roles = db.query(models.Role).offset(skip).limit(limit).all()
    return roles

@router.put("/{role_id}", response_model=schemas.Role)
def update_role(role_id: int, role: schemas.RoleUpdate, db: Session = Depends(get_db)):
    db_role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Check if name is taken by another role
    existing = db.query(models.Role).filter(models.Role.name == role.name, models.Role.id != role_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Role name already exists")
        
    db_role.name = role.name
    db_role.privileges = role.privileges
    create_audit_log(db, "System User", "Updated Record: Update Role", "Roles", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    db.refresh(db_role)
    return db_role

@router.delete("/{role_id}")
def delete_role(role_id: int, db: Session = Depends(get_db)):
    db_role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    db.delete(db_role)
    create_audit_log(db, "System User", "Deleted Record: Delete Role", "Roles", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    return {"ok": True}
