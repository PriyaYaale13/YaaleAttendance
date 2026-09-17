from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

# Import all models to ensure they are registered with Base before create_all
from employees import models as employees_models
from attendance import models as attendance_models
from shifts import models as shifts_models
from overtime import models as overtime_models
from early_departures import models as early_departures_models

from leaves import models as leaves_models
from payslips import models as payslips_models
from roles import models as roles_models
from system_users import models as system_users_models
from customer_sites import models as customer_sites_models
from employee_documents import models as employee_documents_models
from timecards import models as timecards_models
from audit_logs import models as audit_logs_models

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from employees.router import router as employees_router
from attendance.router import router as attendance_router
from shifts.router import router as shifts_router
from overtime.router import router as overtime_router
from early_departures.router import router as early_departures_router
from leaves.router import router as leaves_router
from payslips.router import router as payslips_router
from roles.router import router as roles_router
from system_users.router import router as system_users_router
from customer_sites.router import router as customer_sites_router
from employee_documents.router import router as employee_documents_router
from timecards.router import router as timecards_router
from audit_logs.router import router as audit_logs_router

app.include_router(employees_router, prefix="/employees", tags=["employees"])
app.include_router(attendance_router, prefix="/attendance", tags=["attendance"])
app.include_router(shifts_router, prefix="/shifts", tags=["shifts"])
app.include_router(overtime_router, prefix="/overtime", tags=["overtime"])
app.include_router(early_departures_router, prefix="/early-departures", tags=["early_departures"])
app.include_router(leaves_router, prefix="/leaves", tags=["leaves"])
app.include_router(payslips_router, prefix="/payslips", tags=["payslips"])
app.include_router(roles_router, prefix="/roles", tags=["roles"])
app.include_router(system_users_router, prefix="/system-users", tags=["system_users"])
app.include_router(customer_sites_router, prefix="/customer-sites", tags=["customer_sites"])
app.include_router(employee_documents_router, prefix="/employee-documents", tags=["employee_documents"])
app.include_router(timecards_router, prefix="/timecards", tags=["timecards"])
app.include_router(audit_logs_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Backend API"}
