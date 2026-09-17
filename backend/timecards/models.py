from sqlalchemy import Column, Integer, String, Float, Date
from sqlalchemy.sql import func
from database import Base

class Timecard(Base):
    __tablename__ = "timecards"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, index=True)
    employee_name = Column(String)
    designation = Column(String)
    no_of_working_days = Column(Integer)
    salary = Column(String)
    timecard_date = Column(Date)
    file_name = Column(String)
    file_path = Column(String)
    upload_date = Column(Date, server_default=func.current_date())
