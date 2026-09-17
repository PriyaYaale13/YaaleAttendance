from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import SessionLocal
from leaves import models, schemas

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get('/', response_model=List[schemas.LeaveResponse])
def get_leaves(db: Session = Depends(get_db)):
    records = db.query(models.Leave).all()
    result = []
    for r in records:
        result.append(schemas.LeaveResponse(
            id=r.id, empId=r.emp_id, name=r.name, leaveType=r.leave_type,
            startDate=r.start_date, endDate=r.end_date, reason=r.reason,
            supportingDocs=r.supporting_docs, status=r.status,
            rejectionReason=r.rejection_reason
        ))
    return result

@router.post('/', response_model=schemas.LeaveResponse)
def create_leave(record: schemas.LeaveCreate, db: Session = Depends(get_db)):
    new_record = models.Leave(
        emp_id=record.empId, name=record.name, leave_type=record.leaveType,
        start_date=record.startDate, end_date=record.endDate, reason=record.reason,
        supporting_docs=record.supportingDocs, status=record.status,
        rejection_reason=record.rejectionReason
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return schemas.LeaveResponse(
        id=new_record.id, empId=new_record.emp_id, name=new_record.name,
        leaveType=new_record.leave_type, startDate=new_record.start_date,
        endDate=new_record.end_date, reason=new_record.reason,
        supportingDocs=new_record.supporting_docs, status=new_record.status,
        rejectionReason=new_record.rejection_reason
    )

from fastapi import HTTPException
from audit_logs.utils import create_audit_log

@router.put('/{leave_id}', response_model=schemas.LeaveResponse)
def update_leave(leave_id: int, record: schemas.LeaveCreate, db: Session = Depends(get_db)):
    db_leave = db.query(models.Leave).filter(models.Leave.id == leave_id).first()
    if not db_leave:
        raise HTTPException(status_code=404, detail="Leave not found")
        
    old_status = db_leave.status
    db_leave.status = record.status
    if record.rejectionReason is not None:
        db_leave.rejection_reason = record.rejectionReason
        
    db.commit()
    db.refresh(db_leave)
    
    if old_status != record.status:
        severity = "success" if record.status == "Approved" else "danger" if record.status == "Rejected" else "info"
        create_audit_log(db, "System User", f"Leave {record.status}", "Leave Management", f"{db_leave.emp_id} ({db_leave.name})", old_status, record.status, f"Status updated to {record.status}. Reason: {record.rejectionReason or '-'}", severity)
    
    return schemas.LeaveResponse(
        id=db_leave.id, empId=db_leave.emp_id, name=db_leave.name,
        leaveType=db_leave.leave_type, startDate=db_leave.start_date,
        endDate=db_leave.end_date, reason=db_leave.reason,
        supportingDocs=db_leave.supporting_docs, status=db_leave.status,
        rejectionReason=db_leave.rejection_reason
    )
