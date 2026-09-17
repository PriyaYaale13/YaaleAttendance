import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from audit_logs.utils import create_audit_log
from datetime import date
from fastapi.responses import FileResponse

from database import SessionLocal
from timecards import models, schemas
from employees import models as emp_models

router = APIRouter()

UPLOAD_DIR = "uploads/timecards"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.TimecardResponse)
async def upload_timecard(
    employeeId: str = Form(...),
    noOfWorkingDays: int = Form(...),
    timecardDate: date = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Verify employee exists to auto-populate fields
    db_emp = db.query(emp_models.Employee).filter(emp_models.Employee.employee_id == employeeId).first()
    if not db_emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    employeeName = db_emp.full_name
    designation = db_emp.designation or "N/A"
    salary = db_emp.salary_details or "0"

    # Validate file type and size is handled in frontend mostly, 
    # but let's ensure it's saved correctly
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in [".jpg", ".jpeg", ".png", ".pdf"]:
        raise HTTPException(status_code=400, detail="Only JPG, PNG and PDF files are allowed")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    safe_filename = f"timecard_{employeeId}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    new_tc = models.Timecard(
        employee_id=employeeId,
        employee_name=employeeName,
        designation=designation,
        no_of_working_days=noOfWorkingDays,
        salary=salary,
        timecard_date=timecardDate,
        file_name=file.filename,
        file_path=file_path
    )
    db.add(new_tc)
    create_audit_log(db, "System User", "Created Record: Upload Timecard", "Timecards", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    db.refresh(new_tc)
    
    return schemas.TimecardResponse(
        id=new_tc.id,
        employeeId=new_tc.employee_id,
        employeeName=new_tc.employee_name,
        designation=new_tc.designation,
        noOfWorkingDays=new_tc.no_of_working_days,
        salary=new_tc.salary,
        timecardDate=new_tc.timecard_date,
        fileName=new_tc.file_name,
        filePath=new_tc.file_path,
        uploadDate=new_tc.upload_date
    )

@router.get("/", response_model=List[schemas.TimecardResponse])
def read_timecards(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tcs = db.query(models.Timecard).order_by(models.Timecard.id.desc()).offset(skip).limit(limit).all()
    result = []
    for tc in tcs:
        result.append(schemas.TimecardResponse(
            id=tc.id,
            employeeId=tc.employee_id,
            employeeName=tc.employee_name,
            designation=tc.designation,
            noOfWorkingDays=tc.no_of_working_days,
            salary=tc.salary,
            timecardDate=tc.timecard_date,
            fileName=tc.file_name,
            filePath=tc.file_path,
            uploadDate=tc.upload_date
        ))
    return result

@router.get("/download/{tc_id}")
def download_timecard(tc_id: int, db: Session = Depends(get_db)):
    tc = db.query(models.Timecard).filter(models.Timecard.id == tc_id).first()
    if not tc:
        raise HTTPException(status_code=404, detail="Timecard not found")
    
    if not os.path.exists(tc.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
        
    return FileResponse(path=tc.file_path, filename=tc.file_name)

@router.get("/view/{tc_id}")
def view_timecard(tc_id: int, db: Session = Depends(get_db)):
    tc = db.query(models.Timecard).filter(models.Timecard.id == tc_id).first()
    if not tc:
        raise HTTPException(status_code=404, detail="Timecard not found")
    
    if not os.path.exists(tc.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
        
    return FileResponse(path=tc.file_path, content_disposition_type="inline", filename=tc.file_name)

@router.delete("/{tc_id}")
def delete_timecard(tc_id: int, db: Session = Depends(get_db)):
    tc = db.query(models.Timecard).filter(models.Timecard.id == tc_id).first()
    if not tc:
        raise HTTPException(status_code=404, detail="Timecard not found")
        
    if os.path.exists(tc.file_path):
        os.remove(tc.file_path)
        
    db.delete(tc)
    create_audit_log(db, "System User", "Deleted Record: Delete Timecard", "Timecards", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    return {"message": "Timecard deleted successfully"}
