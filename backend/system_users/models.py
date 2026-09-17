from sqlalchemy import Column, Integer, String
from database import Base

class SystemUser(Base):
    __tablename__ = "system_users"
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    mid_name = Column(String, nullable=True)
    last_name = Column(String, index=True)
    gender = Column(String, nullable=True)
    birth_date = Column(String, nullable=True)
    user_name = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    email = Column(String, unique=True, index=True)
    secondary_email = Column(String, nullable=True)
    contact_no = Column(String, nullable=True)
    secondary_contact_no = Column(String, nullable=True)
    role = Column(String, default="admin")
    system_date_format = Column(String, default="DD/MM/YYYY")
