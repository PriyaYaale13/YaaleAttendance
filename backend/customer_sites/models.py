from sqlalchemy import Column, Integer, String
from database import Base

class CustomerSite(Base):
    __tablename__ = "customer_sites"

    id = Column(Integer, primary_key=True, index=True)
    site_name = Column(String, nullable=False)
    customer_name = Column(String, nullable=False)
    site_location = Column(String, nullable=False)
    assigned_supervisor = Column(String, nullable=True)
    assigned_employees = Column(String, nullable=True)
    working_hours = Column(String, nullable=True)
    qr_code_config = Column(String, nullable=True)
    site_status = Column(String, default="Active")
