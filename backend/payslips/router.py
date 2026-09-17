from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from audit_logs.utils import create_audit_log

from database import SessionLocal
from payslips import models, schemas

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get('/', response_model=List[schemas.PayslipResponse])
def get_payslips(db: Session = Depends(get_db)):
    records = db.query(models.Payslip).all()
    return [
        schemas.PayslipResponse(
            id=r.id, empId=r.emp_id, name=r.name, department=r.department,
            designation=r.designation, period=r.period, basicSalary=r.basic_salary,
            workingDays=r.working_days, presentDays=r.present_days, otHours=r.ot_hours,
            otAmount=r.ot_amount, allowances=r.allowances, deductions=r.deductions,
            netSalary=r.net_salary, status=r.status, paymentDate=r.payment_date,
            accountNo=r.account_no, paymentMode=r.payment_mode
        ) for r in records
    ]

@router.post('/', response_model=schemas.PayslipResponse)
def create_payslip(record: schemas.PayslipCreate, db: Session = Depends(get_db)):
    new_record = models.Payslip(
        emp_id=record.empId, name=record.name, department=record.department,
        designation=record.designation, period=record.period, basic_salary=record.basicSalary,
        working_days=record.workingDays, present_days=record.presentDays, ot_hours=record.otHours,
        ot_amount=record.otAmount, allowances=record.allowances, deductions=record.deductions,
        net_salary=record.netSalary, status=record.status, payment_date=record.paymentDate,
        account_no=record.accountNo, payment_mode=record.paymentMode
    )
    db.add(new_record)
    create_audit_log(db, "System User", "Created Record: Create Payslip", "Payslips", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    db.refresh(new_record)
    return schemas.PayslipResponse(
        id=new_record.id, empId=new_record.emp_id, name=new_record.name, department=new_record.department,
        designation=new_record.designation, period=new_record.period, basicSalary=new_record.basic_salary,
        workingDays=new_record.working_days, presentDays=new_record.present_days, otHours=new_record.ot_hours,
        otAmount=new_record.ot_amount, allowances=new_record.allowances, deductions=new_record.deductions,
        netSalary=new_record.net_salary, status=new_record.status, paymentDate=new_record.payment_date,
        accountNo=new_record.account_no, paymentMode=new_record.payment_mode
    )

@router.put('/{payslip_id}')
def update_payslip(payslip_id: int, payload: dict, db: Session = Depends(get_db)):
    db_payslip = db.query(models.Payslip).filter(models.Payslip.id == payslip_id).first()
    if not db_payslip:
        raise HTTPException(status_code=404, detail="Payslip not found")
    
    if "status" in payload:
        db_payslip.status = payload["status"]
    if "paymentDate" in payload:
        db_payslip.payment_date = payload["paymentDate"]
    if "accountNo" in payload:
        db_payslip.account_no = payload["accountNo"]
    if "paymentMode" in payload:
        db_payslip.payment_mode = payload["paymentMode"]
        
    create_audit_log(db, "System User", "Updated Record: Update Payslip", "Payslips", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    db.refresh(db_payslip)
    return {"message": "Payslip updated successfully"}

@router.put('/{payslip_id}/status')
def update_payslip_status(payslip_id: int, db: Session = Depends(get_db)):
    db_payslip = db.query(models.Payslip).filter(models.Payslip.id == payslip_id).first()
    if not db_payslip:
        raise HTTPException(status_code=404, detail="Payslip not found")
    
    db_payslip.status = "Paid"
    create_audit_log(db, "System User", "Updated Record: Update Payslip Status", "Payslips", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    db.refresh(db_payslip)
    
    return {"status": "Paid"}
