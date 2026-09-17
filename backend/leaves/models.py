from sqlalchemy import Column, Integer, String
from database import Base

class Leave(Base):
    __tablename__ = 'leaves'

    id = Column(Integer, primary_key=True, index=True)
    emp_id = Column(String, index=True)
    name = Column(String)
    leave_type = Column(String)
    start_date = Column(String)
    end_date = Column(String)
    reason = Column(String)
    supporting_docs = Column(String, nullable=True)
    status = Column(String, default="Pending")
    rejection_reason = Column(String, nullable=True)
