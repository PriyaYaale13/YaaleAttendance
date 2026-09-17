from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from audit_logs.utils import create_audit_log

from database import SessionLocal
from employees import models, schemas

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.EmployeeResponse)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    db_emp = db.query(models.Employee).filter(models.Employee.employee_id == employee.employeeId).first()
    if db_emp:
        raise HTTPException(status_code=400, detail="Employee ID already exists")

    new_emp = models.Employee(
        employee_id=employee.employeeId,
        full_name=employee.fullName,
        department=employee.department,
        designation=employee.designation,
        joining_date=employee.joiningDate,
        salary_details=employee.salaryDetails,
        supervisor_assignment=employee.supervisorAssignment,
        contact_information=employee.contactInformation,
        employment_status=employee.employmentStatus,
        username=employee.username,
        password=employee.password,
        role=employee.role,
        pay_mode=employee.payMode,
        upi_no=employee.upiNo,
        account_number=employee.accountNumber,
        educational_qualification=employee.educationalQualification,
        skills=employee.skills,
        years_of_experience=employee.yearsOfExperience
    )
    db.add(new_emp)
    create_audit_log(db, "System User", "Created Record: Create Employee", "Employees", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    db.refresh(new_emp)
    return schemas.EmployeeResponse(
        id=new_emp.id,
        employeeId=new_emp.employee_id,
        fullName=new_emp.full_name,
        department=new_emp.department,
        designation=new_emp.designation,
        joiningDate=new_emp.joining_date,
        salaryDetails=new_emp.salary_details,
        supervisorAssignment=new_emp.supervisor_assignment,
        contactInformation=new_emp.contact_information,
        employmentStatus=new_emp.employment_status,
        username=new_emp.username,
        password=new_emp.password,
        role=new_emp.role,
        payMode=new_emp.pay_mode,
        upiNo=new_emp.upi_no,
        accountNumber=new_emp.account_number,
        educationalQualification=new_emp.educational_qualification,
        skills=new_emp.skills,
        yearsOfExperience=new_emp.years_of_experience
    )

@router.get("/", response_model=List[schemas.EmployeeResponse])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    employees = db.query(models.Employee).offset(skip).limit(limit).all()
    result = []
    for emp in employees:
        result.append(schemas.EmployeeResponse(
            id=emp.id,
            employeeId=emp.employee_id,
            fullName=emp.full_name,
            department=emp.department,
            designation=emp.designation,
            joiningDate=emp.joining_date,
            salaryDetails=emp.salary_details,
            supervisorAssignment=emp.supervisor_assignment,
            contactInformation=emp.contact_information,
            employmentStatus=emp.employment_status,
            username=emp.username,
            password=emp.password,
            role=emp.role,
            payMode=emp.pay_mode,
            upiNo=emp.upi_no,
            accountNumber=emp.account_number,
            educationalQualification=emp.educational_qualification,
            skills=emp.skills,
            yearsOfExperience=emp.years_of_experience
        ))
    return result

@router.put("/{emp_id}", response_model=schemas.EmployeeResponse)
def update_employee(emp_id: str, employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    db_emp = db.query(models.Employee).filter(models.Employee.employee_id == emp_id).first()
    if not db_emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    db_emp.full_name = employee.fullName
    db_emp.department = employee.department
    db_emp.designation = employee.designation
    db_emp.joining_date = employee.joiningDate
    db_emp.salary_details = employee.salaryDetails
    db_emp.supervisor_assignment = employee.supervisorAssignment
    db_emp.contact_information = employee.contactInformation
    db_emp.employment_status = employee.employmentStatus
    db_emp.username = employee.username
    db_emp.password = employee.password
    db_emp.role = employee.role
    db_emp.pay_mode = employee.payMode
    db_emp.upi_no = employee.upiNo
    db_emp.account_number = employee.accountNumber
    db_emp.educational_qualification = employee.educationalQualification
    db_emp.skills = employee.skills
    db_emp.years_of_experience = employee.yearsOfExperience

    create_audit_log(db, "System User", "Updated Record: Update Employee", "Employees", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    db.refresh(db_emp)
    
    return schemas.EmployeeResponse(
        id=db_emp.id,
        employeeId=db_emp.employee_id,
        fullName=db_emp.full_name,
        department=db_emp.department,
        designation=db_emp.designation,
        joiningDate=db_emp.joining_date,
        salaryDetails=db_emp.salary_details,
        supervisorAssignment=db_emp.supervisor_assignment,
        contactInformation=db_emp.contact_information,
        employmentStatus=db_emp.employment_status,
        username=db_emp.username,
        password=db_emp.password,
        role=db_emp.role,
        payMode=db_emp.pay_mode,
        upiNo=db_emp.upi_no,
        accountNumber=db_emp.account_number,
        educationalQualification=db_emp.educational_qualification,
        skills=db_emp.skills,
        yearsOfExperience=db_emp.years_of_experience
    )

@router.put("/{emp_id}/status")
def toggle_status(emp_id: str, db: Session = Depends(get_db)):
    db_emp = db.query(models.Employee).filter(models.Employee.employee_id == emp_id).first()
    if not db_emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    db_emp.employment_status = "Inactive" if db_emp.employment_status == "Active" else "Active"
    
    create_audit_log(db, "System User", "Updated Record: Toggle Status", "Employees", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    db.refresh(db_emp)
    
    return {"status": db_emp.employment_status}
