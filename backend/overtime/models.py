from sqlalchemy import Column, Integer, String
from database import Base

class Overtime(Base):
    __tablename__ = 'overtime_enhanced'

    id = Column(Integer, primary_key=True, index=True)
    emp_id = Column(String, index=True)
    name = Column(String)
    date = Column(String)
    actual_working_hours = Column(String, nullable=True)
    potential_ot_hours = Column(String, nullable=True)
    submitted_ot_hours = Column(String, nullable=True)
    supervisor_reviewed_ot = Column(String, nullable=True)
    admin_approved_ot = Column(String, nullable=True)
    paid_ot_hours = Column(String, nullable=True)
    outstanding_ot_balance = Column(String, nullable=True)
    status = Column(String, default="Pending Submission")
