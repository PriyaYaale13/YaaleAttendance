from sqlalchemy import Column, Integer, String
from database import Base

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, index=True)
    date = Column(String, index=True)
    in_time = Column(String, nullable=True)
    out_time = Column(String, nullable=True)
    working_hours = Column(String, nullable=True)
    location = Column(String, nullable=True)
