from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    user = Column(String)
    action = Column(String)
    module = Column(String)
    record = Column(String)
    details = Column(JSON)
    remarks = Column(String)
    severity = Column(String)
