from sqlalchemy import Column, Integer, String
from database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True)
    full_name = Column(String)
    department = Column(String)
    designation = Column(String)
    joining_date = Column(String)
    salary_details = Column(String)
    supervisor_assignment = Column(String, nullable=True)
    contact_information = Column(String)
    employment_status = Column(String, default="Active")
    username = Column(String, nullable=True)
    password = Column(String, nullable=True)
    role = Column(String, nullable=True)
    pay_mode = Column(String, nullable=True)
    upi_no = Column(String, nullable=True)
    account_number = Column(String, nullable=True)
    educational_qualification = Column(String, nullable=True)
    skills = Column(String, nullable=True)
    years_of_experience = Column(String, nullable=True)
