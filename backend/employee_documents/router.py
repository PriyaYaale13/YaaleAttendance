from audit_logs.utils import create_audit_log
import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from fastapi.responses import FileResponse

from database import SessionLocal
from employee_documents import models, schemas
from employees import models as emp_models

router = APIRouter()

UPLOAD_DIR = "uploads/documents"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.EmployeeDocumentResponse)
async def upload_document(
    employeeId: str = Form(...),
    documentCategory: str = Form(...),
    documentStatus: str = Form("Active"),
    expiryDate: Optional[date] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Verify employee exists
    db_emp = db.query(emp_models.Employee).filter(emp_models.Employee.employee_id == employeeId).first()
    if not db_emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    employeeName = db_emp.full_name

    # Create safe filename
    file_extension = os.path.splitext(file.filename)[1]
    safe_filename = f"{employeeId}_{documentCategory.replace(' ', '_')}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    new_doc = models.EmployeeDocument(
        employee_id=employeeId,
        employee_name=employeeName,
        document_category=documentCategory,
        file_name=file.filename,
        file_path=file_path,
        document_status=documentStatus,
        expiry_date=expiryDate
    )
    db.add(new_doc)
    create_audit_log(db, "System User", "Created Record: Upload Document", "Employee Documents", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    db.refresh(new_doc)
    
    return schemas.EmployeeDocumentResponse(
        id=new_doc.id,
        employeeId=new_doc.employee_id,
        employeeName=new_doc.employee_name,
        documentCategory=new_doc.document_category,
        fileName=new_doc.file_name,
        filePath=new_doc.file_path,
        documentStatus=new_doc.document_status,
        expiryDate=new_doc.expiry_date
    )

@router.get("/", response_model=List[schemas.EmployeeDocumentResponse])
def read_documents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    docs = db.query(models.EmployeeDocument).offset(skip).limit(limit).all()
    result = []
    for doc in docs:
        result.append(schemas.EmployeeDocumentResponse(
            id=doc.id,
            employeeId=doc.employee_id,
            employeeName=doc.employee_name,
            documentCategory=doc.document_category,
            fileName=doc.file_name,
            filePath=doc.file_path,
            documentStatus=doc.document_status,
            expiryDate=doc.expiry_date
        ))
    return result

@router.get("/download/{doc_id}")
def download_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(models.EmployeeDocument).filter(models.EmployeeDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
        
    return FileResponse(path=doc.file_path, filename=doc.file_name)

@router.put("/{doc_id}/status")
def update_status(doc_id: int, status: str = Form(...), db: Session = Depends(get_db)):
    doc = db.query(models.EmployeeDocument).filter(models.EmployeeDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    doc.document_status = status
    create_audit_log(db, "System User", "Updated Record: Update Status", "Employee Documents", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    db.refresh(doc)
    return {"message": "Status updated successfully", "status": doc.document_status}

@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(models.EmployeeDocument).filter(models.EmployeeDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
        
    db.delete(doc)
    create_audit_log(db, "System User", "Deleted Record: Delete Document", "Employee Documents", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    return {"message": "Document deleted successfully"}
