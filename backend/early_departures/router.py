from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from audit_logs.utils import create_audit_log

from database import SessionLocal
from early_departures import models, schemas

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get('/', response_model=List[schemas.EarlyDepartureResponse])
def get_departures(db: Session = Depends(get_db)):
    records = db.query(models.EarlyDeparture).all()
    result = []
    for r in records:
        result.append(schemas.EarlyDepartureResponse(
            id=r.id, empId=r.emp_id, name=r.name, date=r.date,
            departureTime=r.departure_time, reason=r.reason,
            supportingInfo=r.supporting_info, status=r.status
        ))
    return result

@router.post('/', response_model=schemas.EarlyDepartureResponse)
def create_departure(record: schemas.EarlyDepartureCreate, db: Session = Depends(get_db)):
    new_record = models.EarlyDeparture(
        emp_id=record.empId, name=record.name, date=record.date,
        departure_time=record.departureTime, reason=record.reason,
        supporting_info=record.supportingInfo, status=record.status
    )
    db.add(new_record)
    create_audit_log(db, "System User", "Created Record: Create Departure", "Early Departures", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    db.refresh(new_record)
    return schemas.EarlyDepartureResponse(
        id=new_record.id, empId=new_record.emp_id, name=new_record.name, date=new_record.date,
        departureTime=new_record.departure_time, reason=new_record.reason,
        supportingInfo=new_record.supporting_info, status=new_record.status
    )

from fastapi import HTTPException

@router.put('/{departure_id}', response_model=schemas.EarlyDepartureResponse)
def update_departure(departure_id: int, record: schemas.EarlyDepartureCreate, db: Session = Depends(get_db)):
    db_departure = db.query(models.EarlyDeparture).filter(models.EarlyDeparture.id == departure_id).first()
    if not db_departure:
        raise HTTPException(status_code=404, detail="Early departure not found")
        
    db_departure.status = record.status
    create_audit_log(db, "System User", "Updated Record: Update Departure", "Early Departures", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    db.refresh(db_departure)
    
    return schemas.EarlyDepartureResponse(
        id=db_departure.id, empId=db_departure.emp_id, name=db_departure.name, date=db_departure.date,
        departureTime=db_departure.departure_time, reason=db_departure.reason,
        supportingInfo=db_departure.supporting_info, status=db_departure.status
    )
