from database import engine, SessionLocal
from overtime.models import Base, Overtime

# Create table
Base.metadata.create_all(bind=engine)

# Add mock data
db = SessionLocal()
if db.query(Overtime).count() == 0:
    mocks = [
        Overtime(emp_id='EMP-001', name='John Doe', date='2026-08-26', shift_end='17:00', actual_out='19:30', ot_hours='2.5', rate='/hr', amount='.00', status='Approved'),
        Overtime(emp_id='EMP-002', name='Jane Roe', date='2026-08-26', shift_end='17:00', actual_out='18:15', ot_hours='1.25', rate='/hr', amount='.25', status='Pending'),
        Overtime(emp_id='EMP-003', name='Bob Smith', date='2026-08-26', shift_end='17:00', actual_out='17:15', ot_hours='0.25', rate='/hr', amount='.00', status='Rejected (Below Min)')
    ]
    db.add_all(mocks)
    db.commit()
db.close()
