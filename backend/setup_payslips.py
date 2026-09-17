import os

os.makedirs('payslips', exist_ok=True)

with open('payslips/__init__.py', 'w') as f:
    pass

with open('payslips/models.py', 'w') as f:
    f.write('''from sqlalchemy import Column, Integer, String, Float
from database import Base

class Payslip(Base):
    __tablename__ = "payslips"

    id = Column(Integer, primary_key=True, index=True)
    emp_id = Column(String)
    name = Column(String)
    department = Column(String)
    designation = Column(String)
    period = Column(String)
    basic_salary = Column(Float)
    working_days = Column(Integer)
    present_days = Column(Integer)
    ot_hours = Column(Float)
    ot_amount = Column(Float)
    allowances = Column(Float)
    deductions = Column(Float)
    net_salary = Column(Float)
    status = Column(String)
    payment_date = Column(String)
    account_no = Column(String)
    payment_mode = Column(String)
''')

with open('payslips/schemas.py', 'w') as f:
    f.write('''from pydantic import BaseModel
from typing import Optional

class PayslipBase(BaseModel):
    empId: str
    name: str
    department: str
    designation: str
    period: str
    basicSalary: float
    workingDays: int
    presentDays: int
    otHours: float
    otAmount: float
    allowances: float
    deductions: float
    netSalary: float
    status: str
    paymentDate: Optional[str] = None
    accountNo: Optional[str] = None
    paymentMode: Optional[str] = None

class PayslipCreate(PayslipBase):
    pass

class PayslipResponse(PayslipBase):
    id: int

    class Config:
        from_attributes = True
''')

with open('payslips/router.py', 'w') as f:
    f.write('''from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

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
''')

# Update main.py
with open('main.py', 'r', encoding='utf-8') as f:
    main_content = f.read()

if 'from payslips import models as payslips_models' not in main_content:
    main_content = main_content.replace('from leaves import models as leaves_models', 'from leaves import models as leaves_models\\nfrom payslips import models as payslips_models')
    
if 'from payslips.router import router as payslips_router' not in main_content:
    main_content = main_content.replace('from leaves.router import router as leaves_router', 'from leaves.router import router as leaves_router\\nfrom payslips.router import router as payslips_router')

if 'app.include_router(payslips_router' not in main_content:
    main_content = main_content.replace('app.include_router(leaves_router, prefix="/leaves", tags=["leaves"])', 'app.include_router(leaves_router, prefix="/leaves", tags=["leaves"])\\napp.include_router(payslips_router, prefix="/payslips", tags=["payslips"])')

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(main_content)

print("Backend payslips module created and main.py updated.")
