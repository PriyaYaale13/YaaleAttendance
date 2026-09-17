from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from audit_logs.utils import create_audit_log

from database import SessionLocal
from shifts import models, schemas

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.ShiftResponse)
def create_shift(shift: schemas.ShiftCreate, db: Session = Depends(get_db)):
    db_shift = db.query(models.Shift).filter(models.Shift.shift_name == shift.shiftName).first()
    if db_shift:
        raise HTTPException(status_code=400, detail="Shift name already exists")

    new_shift = models.Shift(
        shift_name=shift.shiftName,
        start_time=shift.startTime,
        end_time=shift.endTime,
        break_hours=shift.breakHours,
        grace_period=shift.gracePeriod,
        weekly_offs=shift.weeklyOffs
    )
    db.add(new_shift)
    create_audit_log(db, "System User", "Created Record: Create Shift", "Shifts", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    db.refresh(new_shift)
    return schemas.ShiftResponse(
        id=new_shift.id,
        shiftName=new_shift.shift_name,
        startTime=new_shift.start_time,
        endTime=new_shift.end_time,
        breakHours=new_shift.break_hours,
        gracePeriod=new_shift.grace_period,
        weeklyOffs=new_shift.weekly_offs
    )

@router.get("/", response_model=List[schemas.ShiftResponse])
def read_shifts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    shifts = db.query(models.Shift).offset(skip).limit(limit).all()
    result = []
    for s in shifts:
        result.append(schemas.ShiftResponse(
            id=s.id,
            shiftName=s.shift_name,
            startTime=s.start_time,
            endTime=s.end_time,
            breakHours=s.break_hours,
            gracePeriod=s.grace_period,
            weeklyOffs=s.weekly_offs
        ))
    return result
@router.put("/{shift_id}", response_model=schemas.ShiftResponse)
def update_shift(shift_id: int, shift: schemas.ShiftCreate, db: Session = Depends(get_db)):
    db_shift = db.query(models.Shift).filter(models.Shift.id == shift_id).first()
    if not db_shift:
        raise HTTPException(status_code=404, detail="Shift not found")
        
    db_name_check = db.query(models.Shift).filter(models.Shift.shift_name == shift.shiftName, models.Shift.id != shift_id).first()
    if db_name_check:
        raise HTTPException(status_code=400, detail="Shift name already exists")
        
    db_shift.shift_name = shift.shiftName
    db_shift.start_time = shift.startTime
    db_shift.end_time = shift.endTime
    db_shift.break_hours = shift.breakHours
    db_shift.grace_period = shift.gracePeriod
    db_shift.weekly_offs = shift.weeklyOffs
    
    create_audit_log(db, "System User", "Updated Record: Update Shift", "Shifts", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    db.refresh(db_shift)
    return schemas.ShiftResponse(
        id=db_shift.id, shiftName=db_shift.shift_name, startTime=db_shift.start_time,
        endTime=db_shift.end_time, breakHours=db_shift.break_hours,
        gracePeriod=db_shift.grace_period, weeklyOffs=db_shift.weekly_offs
    )

@router.delete("/{shift_id}")
def delete_shift(shift_id: int, db: Session = Depends(get_db)):
    db_shift = db.query(models.Shift).filter(models.Shift.id == shift_id).first()
    if not db_shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    db.delete(db_shift)
    create_audit_log(db, "System User", "Deleted Record: Delete Shift", "Shifts", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    return {"ok": True}
