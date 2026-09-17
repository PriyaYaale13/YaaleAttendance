from database import engine, SessionLocal
from overtime.models import Base, Overtime

# Create table
Base.metadata.create_all(bind=engine)

# Add mock data
db = SessionLocal()
if db.query(Overtime).count() == 0:
    mocks = [
        Overtime(emp_id='EMP-001', name='John Doe', date='2026-08-26', actual_working_hours='12', potential_ot_hours='3', submitted_ot_hours='3', supervisor_reviewed_ot='3', admin_approved_ot='3', paid_ot_hours='0', outstanding_ot_balance='3', status='Approved'),
        Overtime(emp_id='EMP-002', name='Jane Roe', date='2026-08-26', actual_working_hours='10.5', potential_ot_hours='1.5', submitted_ot_hours='1.5', supervisor_reviewed_ot='1.5', admin_approved_ot='0', paid_ot_hours='0', outstanding_ot_balance='1.5', status='Pending Admin'),
        Overtime(emp_id='EMP-003', name='Bob Smith', date='2026-08-26', actual_working_hours='11', potential_ot_hours='2', submitted_ot_hours='2', supervisor_reviewed_ot='0', admin_approved_ot='0', paid_ot_hours='0', outstanding_ot_balance='2', status='Pending Supervisor'),
    ]
    db.add_all(mocks)
    db.commit()
db.close()
