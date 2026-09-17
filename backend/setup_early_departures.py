import re

with open(r'd:\ATM-WMS\backend\main.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("from overtime import models as overtime_models", "from overtime import models as overtime_models\nfrom early_departures import models as early_departures_models")
content = content.replace("from overtime.router import router as overtime_router", "from overtime.router import router as overtime_router\nfrom early_departures.router import router as early_departures_router")
content = content.replace("app.include_router(overtime_router, prefix=\"/overtime\", tags=[\"overtime\"])", "app.include_router(overtime_router, prefix=\"/overtime\", tags=[\"overtime\"])\napp.include_router(early_departures_router, prefix=\"/early-departures\", tags=[\"early_departures\"])")

with open(r'd:\ATM-WMS\backend\main.py', 'w', encoding='utf-8') as f:
    f.write(content)

from database import engine, SessionLocal
from early_departures.models import Base
Base.metadata.create_all(bind=engine)
