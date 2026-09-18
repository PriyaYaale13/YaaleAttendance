from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from audit_logs.utils import create_audit_log
from datetime import datetime

from database import SessionLocal
from attendance import models, schemas
from employees.models import Employee

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post('/scan/', response_model=schemas.AttendanceResponse)
def scan_attendance(scan: schemas.AttendanceScan, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == scan.employeeId).first()
    if not emp: raise HTTPException(status_code=404, detail='Employee not found')
    today_str = datetime.now().strftime('%Y-%m-%d')
    time_str = datetime.now().strftime('%I:%M %p')
    now_time = datetime.now().time()
    
    att = db.query(models.Attendance).filter(models.Attendance.employee_id == scan.employeeId, models.Attendance.date == today_str).first()
    if not att:
        # Check-in time validation (Temporarily disabled for testing)
        # if now_time.hour >= 17:
        #     raise HTTPException(status_code=400, detail='Your working time ended')
        # if now_time.hour < 8:
        #     raise HTTPException(status_code=400, detail='Check-in is only available from 8:00 AM')
            
        new_att = models.Attendance(employee_id=scan.employeeId, date=today_str, in_time=time_str, out_time=None, location=scan.location)
        create_audit_log(db, "System User", "Created Record: Scan Attendance", "Attendance", "Unknown", "-", "-", "Action performed via API", "info")
        db.add(new_att); db.commit(); db.refresh(new_att)
        return schemas.AttendanceResponse(id=new_att.id, employeeId=new_att.employee_id, date=new_att.date, inTime=new_att.in_time, outTime=new_att.out_time, workingHours=new_att.working_hours, location=new_att.location, name=emp.full_name)
    else:
        if att.out_time: raise HTTPException(status_code=400, detail=f'{scan.employeeId} has already clocked out for today.')
        att.out_time = time_str
        try:
            in_t = datetime.strptime(att.in_time, '%I:%M %p')
            out_t = datetime.strptime(time_str, '%I:%M %p')
            hours = (out_t - in_t).total_seconds() / 3600
            att.working_hours = f'{hours:.2f} hrs'
        except:
            att.working_hours = 'N/A'
        create_audit_log(db, "System User", "Created Record: Scan Attendance", "Attendance", "Unknown", "-", "-", "Action performed via API", "info")
        db.commit(); db.refresh(att)
        return schemas.AttendanceResponse(id=att.id, employeeId=att.employee_id, date=att.date, inTime=att.in_time, outTime=att.out_time, workingHours=att.working_hours, location=att.location, name=emp.full_name)

@router.get('/', response_model=List[schemas.AttendanceResponse])
def get_attendance(db: Session = Depends(get_db)):
    records = db.query(models.Attendance).all()
    result = []
    for r in records:
        emp = db.query(Employee).filter(Employee.employee_id == r.employee_id).first()
        result.append(schemas.AttendanceResponse(id=r.id, employeeId=r.employee_id, date=r.date, inTime=r.in_time, outTime=r.out_time, workingHours=r.working_hours, location=r.location, name=emp.full_name if emp else 'Unknown'))
    return result
@router.put('/{record_id}', response_model=schemas.AttendanceResponse)
def update_attendance(record_id: int, record: schemas.AttendanceBase, db: Session = Depends(get_db)):
    db_record = db.query(models.Attendance).filter(models.Attendance.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Record not found")
        
    db_record.in_time = record.inTime
    db_record.out_time = record.outTime
    db_record.working_hours = record.workingHours
    db_record.location = record.location
    create_audit_log(db, "System User", "Updated Record: Update Attendance", "Attendance", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    db.refresh(db_record)
    
    emp = db.query(Employee).filter(Employee.employee_id == db_record.employee_id).first()
    return schemas.AttendanceResponse(
        id=db_record.id, employeeId=db_record.employee_id, date=db_record.date, 
        inTime=db_record.in_time, outTime=db_record.out_time, 
        workingHours=db_record.working_hours, location=db_record.location, name=emp.full_name if emp else 'Unknown'
    )
