from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("UPDATE timecards SET timecard_date = '2026-09-01' WHERE timecard_date IS NULL"))
    conn.commit()
print("Updated rows")
