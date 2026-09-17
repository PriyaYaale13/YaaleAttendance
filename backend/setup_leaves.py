import re

with open(r'd:\ATM-WMS\backend\main.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("from early_departures import models as early_departures_models", "from early_departures import models as early_departures_models\nfrom leaves import models as leaves_models")
content = content.replace("from early_departures.router import router as early_departures_router", "from early_departures.router import router as early_departures_router\nfrom leaves.router import router as leaves_router")
content = content.replace("app.include_router(early_departures_router, prefix=\"/early-departures\", tags=[\"early_departures\"])", "app.include_router(early_departures_router, prefix=\"/early-departures\", tags=[\"early_departures\"])\napp.include_router(leaves_router, prefix=\"/leaves\", tags=[\"leaves\"])")

with open(r'd:\ATM-WMS\backend\main.py', 'w', encoding='utf-8') as f:
    f.write(content)

from database import engine, SessionLocal
from leaves.models import Base, Leave
Base.metadata.create_all(bind=engine)

db = SessionLocal()
if db.query(Leave).count() == 0:
    db.add_all([
        Leave(emp_id='EMP-001', name='John Doe', leave_type='Annual Leave', start_date='2026-09-10', end_date='2026-09-12', reason='Vacation', status='Approved'),
        Leave(emp_id='EMP-002', name='Jane Roe', leave_type='Medical Leave', start_date='2026-09-02', end_date='2026-09-02', reason='Fever', status='Pending'),
    ])
    db.commit()
db.close()
