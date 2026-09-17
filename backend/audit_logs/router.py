from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from audit_logs import models, schemas

router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"]
)

@router.get("/", response_model=List[schemas.AuditLogResponse])
def get_audit_logs(db: Session = Depends(get_db)):
    # Return all audit logs ordered by newest first
    logs = db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).all()
    return logs

@router.post("/", response_model=schemas.AuditLogResponse)
def create_audit_log(log: schemas.AuditLogCreate, db: Session = Depends(get_db)):
    db_log = models.AuditLog(**log.model_dump())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log
