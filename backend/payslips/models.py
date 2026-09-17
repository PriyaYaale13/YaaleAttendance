from sqlalchemy import Column, Integer, String, Float
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
