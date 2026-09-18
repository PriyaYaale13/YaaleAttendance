import sys
import os

# Add the current directory to sys.path so we can import from database and models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from roles.models import Role
import json

db = SessionLocal()

roles = db.query(Role).all()

for role in roles:
    privs = role.privileges or {}
    # if it's a string, parse it
    if isinstance(privs, str):
        try:
            privs = json.loads(privs)
        except:
            privs = {}
            
    privs["Employee Scan Module_View"] = True
    role.privileges = privs
    
    # Required if JSON mutations aren't tracked automatically
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(role, "privileges")

db.commit()
db.close()
print("Successfully updated database to give 'Employee Scan Module_View' privilege to all roles.")
