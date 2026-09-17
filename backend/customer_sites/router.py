from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from audit_logs.utils import create_audit_log

from database import SessionLocal
from customer_sites import models, schemas

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.CustomerSiteResponse)
def create_customer_site(site: schemas.CustomerSiteCreate, db: Session = Depends(get_db)):
    new_site = models.CustomerSite(
        site_name=site.siteName,
        customer_name=site.customerName,
        site_location=site.siteLocation,
        assigned_supervisor=site.assignedSupervisor,
        assigned_employees=site.assignedEmployees,
        working_hours=site.workingHours,
        qr_code_config=site.qrCodeConfig,
        site_status=site.siteStatus
    )
    db.add(new_site)
    create_audit_log(db, "System User", "Created Record: Create Customer Site", "Customer Sites", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    db.refresh(new_site)
    return schemas.CustomerSiteResponse(
        id=new_site.id,
        siteName=new_site.site_name,
        customerName=new_site.customer_name,
        siteLocation=new_site.site_location,
        assignedSupervisor=new_site.assigned_supervisor,
        assignedEmployees=new_site.assigned_employees,
        workingHours=new_site.working_hours,
        qrCodeConfig=new_site.qr_code_config,
        siteStatus=new_site.site_status
    )

@router.get("/", response_model=List[schemas.CustomerSiteResponse])
def read_customer_sites(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    sites = db.query(models.CustomerSite).offset(skip).limit(limit).all()
    result = []
    for site in sites:
        result.append(schemas.CustomerSiteResponse(
            id=site.id,
            siteName=site.site_name,
            customerName=site.customer_name,
            siteLocation=site.site_location,
            assignedSupervisor=site.assigned_supervisor,
            assignedEmployees=site.assigned_employees,
            workingHours=site.working_hours,
            qrCodeConfig=site.qr_code_config,
            siteStatus=site.site_status
        ))
    return result

@router.put("/{site_id}", response_model=schemas.CustomerSiteResponse)
def update_customer_site(site_id: int, site: schemas.CustomerSiteCreate, db: Session = Depends(get_db)):
    db_site = db.query(models.CustomerSite).filter(models.CustomerSite.id == site_id).first()
    if not db_site:
        raise HTTPException(status_code=404, detail="Site not found")

    db_site.site_name = site.siteName
    db_site.customer_name = site.customerName
    db_site.site_location = site.siteLocation
    db_site.assigned_supervisor = site.assignedSupervisor
    db_site.assigned_employees = site.assignedEmployees
    db_site.working_hours = site.workingHours
    db_site.qr_code_config = site.qrCodeConfig
    db_site.site_status = site.siteStatus

    create_audit_log(db, "System User", "Updated Record: Update Customer Site", "Customer Sites", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    db.refresh(db_site)
    
    return schemas.CustomerSiteResponse(
        id=db_site.id,
        siteName=db_site.site_name,
        customerName=db_site.customer_name,
        siteLocation=db_site.site_location,
        assignedSupervisor=db_site.assigned_supervisor,
        assignedEmployees=db_site.assigned_employees,
        workingHours=db_site.working_hours,
        qrCodeConfig=db_site.qr_code_config,
        siteStatus=db_site.site_status
    )

@router.delete("/{site_id}")
def delete_customer_site(site_id: int, db: Session = Depends(get_db)):
    db_site = db.query(models.CustomerSite).filter(models.CustomerSite.id == site_id).first()
    if not db_site:
        raise HTTPException(status_code=404, detail="Site not found")
        
    db.delete(db_site)
    create_audit_log(db, "System User", "Deleted Record: Delete Customer Site", "Customer Sites", "Unknown", "-", "-", "Action performed via API", "info")
    db.commit()
    return {"message": "Site deleted successfully"}
