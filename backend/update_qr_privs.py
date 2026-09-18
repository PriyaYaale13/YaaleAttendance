import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from roles.models import Role
import json

db = SessionLocal()

roles = db.query(Role).all()

for role in roles:
    privs = role.privileges or {}
    if isinstance(privs, str):
        try:
            privs = json.loads(privs)
        except:
            privs = {}
            
    privs["QR Attendance_QR Code"] = True
    privs["QR Attendance_Table View"] = True
    role.privileges = privs
    
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(role, "privileges")

db.commit()
db.close()
print("Successfully updated database to give 'QR Attendance_QR Code' and 'QR Attendance_Table View' privilege to all roles.")
