from sqlalchemy import Column, Integer, String
from database import Base

class EarlyDeparture(Base):
    __tablename__ = 'early_departures'

    id = Column(Integer, primary_key=True, index=True)
    emp_id = Column(String, index=True)
    name = Column(String)
    date = Column(String)
    departure_time = Column(String)
    reason = Column(String)
    supporting_info = Column(String, nullable=True)
    status = Column(String, default="Pending")
