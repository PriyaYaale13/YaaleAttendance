from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from audit_logs.utils import create_audit_log
from datetime import datetime

from database import SessionLocal
from overtime import models, schemas
from attendance.models import Attendance
from employees.models import Employee

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def parse_time_to_minutes(time_str: str) -> int:
    """Parse '02:30 PM' or '14:30' format to total minutes since midnight."""
    if not time_str:
        return 0
    try:
        time_str = time_str.strip()
        if 'AM' in time_str or 'PM' in time_str:
            t = datetime.strptime(time_str, '%I:%M %p')
        else:
            t = datetime.strptime(time_str, '%H:%M')
        return t.hour * 60 + t.minute
    except:
        return 0

@router.get('/sync-from-attendance')
def sync_ot_from_attendance(db: Session = Depends(get_db)):
    """Auto-generate OT records from attendance data.
    An employee gets OT if they checked out after 5:00 PM (17:00).
    """
    SHIFT_END_MINUTES = 17 * 60  # 5:00 PM = 1020 minutes
    SHIFT_HOURS = 9  # Standard 9-hour workday

    attendance_records = db.query(Attendance).filter(
        Attendance.out_time != None
    ).all()

    created = 0
    for att in attendance_records:
        # Skip if OT record already exists for this employee+date
        existing = db.query(models.Overtime).filter(
            models.Overtime.emp_id == att.employee_id,
            models.Overtime.date == att.date
        ).first()
        if existing:
            continue

        out_minutes = parse_time_to_minutes(att.out_time)
        in_minutes = parse_time_to_minutes(att.in_time) if att.in_time else 0

        # Actual working hours
        actual_minutes = out_minutes - in_minutes if out_minutes > in_minutes else 0
        actual_hours = round(actual_minutes / 60, 2)

        # OT = time worked past 5PM
        ot_minutes = max(0, out_minutes - SHIFT_END_MINUTES)
        ot_hours = round(ot_minutes / 60, 2)

        # Get employee name
        emp = db.query(Employee).filter(Employee.employee_id == att.employee_id).first()
        emp_name = emp.full_name if emp else att.employee_id

        if ot_hours > 0:
            new_ot = models.Overtime(
                emp_id=att.employee_id,
                name=emp_name,
                date=att.date,
                actual_working_hours=str(actual_hours),
                potential_ot_hours=str(ot_hours),
                submitted_ot_hours=str(ot_hours),
                supervisor_reviewed_ot=None,
                admin_approved_ot=None,
                paid_ot_hours='0',
                outstanding_ot_balance=str(ot_hours),
                status='Pending Supervisor'
            )
            db.add(new_ot)
            created += 1

    db.commit()
    return {"synced": created, "message": f"Synced {created} new OT records from attendance data"}

@router.get('/', response_model=List[schemas.OvertimeResponse])
def get_overtime_records(db: Session = Depends(get_db)):
    records = db.query(models.Overtime).all()
    return [
        schemas.OvertimeResponse(
            id=r.id, empId=r.emp_id, name=r.name, date=r.date,
            actualWorkingHours=r.actual_working_hours, potentialOtHours=r.potential_ot_hours,
            submittedOtHours=r.submitted_ot_hours, supervisorReviewedOt=r.supervisor_reviewed_ot,
            adminApprovedOt=r.admin_approved_ot, paidOtHours=r.paid_ot_hours,
            outstandingOtBalance=r.outstanding_ot_balance, status=r.status
        ) for r in records
    ]

@router.post('/', response_model=schemas.OvertimeResponse)
def create_overtime_record(record: schemas.OvertimeCreate, db: Session = Depends(get_db)):
    new_record = models.Overtime(
        emp_id=record.empId, name=record.name, date=record.date,
        actual_working_hours=record.actualWorkingHours, potential_ot_hours=record.potentialOtHours,
        submitted_ot_hours=record.submittedOtHours, supervisor_reviewed_ot=record.supervisorReviewedOt,
        admin_approved_ot=record.adminApprovedOt, paid_ot_hours=record.paidOtHours,
        outstanding_ot_balance=record.outstandingOtBalance, status=record.status
    )
    db.add(new_record)
    create_audit_log(db, "System User", "Created Record: Create Overtime Record", "Overtime", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    db.refresh(new_record)
    return schemas.OvertimeResponse(
        id=new_record.id, empId=new_record.emp_id, name=new_record.name, date=new_record.date,
        actualWorkingHours=new_record.actual_working_hours, potentialOtHours=new_record.potential_ot_hours,
        submittedOtHours=new_record.submitted_ot_hours, supervisorReviewedOt=new_record.supervisor_reviewed_ot,
        adminApprovedOt=new_record.admin_approved_ot, paidOtHours=new_record.paid_ot_hours,
        outstandingOtBalance=new_record.outstanding_ot_balance, status=new_record.status
    )

@router.put('/{record_id}', response_model=schemas.OvertimeResponse)
def update_overtime_record(record_id: int, record: schemas.OvertimeCreate, db: Session = Depends(get_db)):
    db_record = db.query(models.Overtime).filter(models.Overtime.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Record not found")
        
    db_record.submitted_ot_hours = record.submittedOtHours
    db_record.supervisor_reviewed_ot = record.supervisorReviewedOt
    db_record.admin_approved_ot = record.adminApprovedOt
    db_record.paid_ot_hours = record.paidOtHours
    db_record.outstanding_ot_balance = record.outstandingOtBalance
    db_record.status = record.status
    
    create_audit_log(db, "System User", "Updated Record: Update Overtime Record", "Overtime", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    db.refresh(db_record)
    
    return schemas.OvertimeResponse(
        id=db_record.id, empId=db_record.emp_id, name=db_record.name, date=db_record.date,
        actualWorkingHours=db_record.actual_working_hours, potentialOtHours=db_record.potential_ot_hours,
        submittedOtHours=db_record.submitted_ot_hours, supervisorReviewedOt=db_record.supervisor_reviewed_ot,
        adminApprovedOt=db_record.admin_approved_ot, paidOtHours=db_record.paid_ot_hours,
        outstandingOtBalance=db_record.outstanding_ot_balance, status=db_record.status
    )

