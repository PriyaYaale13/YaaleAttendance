from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text('ALTER TABLE timecards ADD COLUMN timecard_date DATE'))
    conn.commit()
print("Added column")
