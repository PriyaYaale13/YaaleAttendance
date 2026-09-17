from sqlalchemy import Column, Integer, String
from database import Base

class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    shift_name = Column(String, unique=True, index=True)
    start_time = Column(String)
    end_time = Column(String)
    break_hours = Column(String)
    grace_period = Column(String)
    weekly_offs = Column(String)
