from sqlalchemy import Column, Integer, String, Date
from database import Base

class EmployeeDocument(Base):
    __tablename__ = "employee_documents"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, index=True)
    employee_name = Column(String)
    document_category = Column(String)
    file_name = Column(String)
    file_path = Column(String)
    document_status = Column(String, default="Active")
    expiry_date = Column(Date, nullable=True)
