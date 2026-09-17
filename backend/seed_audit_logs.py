from database import SessionLocal
from audit_logs.models import AuditLog
import json
from datetime import datetime

auditLogs = [
    {
      "timestamp": "2026-08-27 16:45:12",
      "user": "Fire Sharma (Admin)",
      "action": "Payslip Generated",
      "module": "Payroll",
      "record": "EMP-001 (John Doe)",
      "details": { "prev": "Draft", "new": "Generated" },
      "remarks": "Automated batch processing",
      "severity": "info"
    },
    {
      "timestamp": "2026-08-27 15:30:00",
      "user": "Jane Roe (Supervisor)",
      "action": "Overtime Approved",
      "module": "Approval Workflow",
      "record": "EMP-003 (Bob Smith)",
      "details": { "prev": "Pending", "new": "Approved (2.5 hrs)" },
      "remarks": "Approved after verification",
      "severity": "success"
    },
    {
      "timestamp": "2026-08-27 14:15:22",
      "user": "Fire Sharma (Admin)",
      "action": "Attendance Corrected",
      "module": "Attendance",
      "record": "EMP-002 (Jane Roe)",
      "details": { "prev": "Out: 17:00", "new": "Out: 19:30" },
      "remarks": "System glitch during checkout",
      "severity": "warning"
    },
    {
      "timestamp": "2026-08-27 09:10:05",
      "user": "Alice Cooper (HR)",
      "action": "Employee Created",
      "module": "Employee Management",
      "record": "EMP-045 (New Hire)",
      "details": { "prev": "-", "new": "Active" },
      "remarks": "Joined on 27 Aug 2026",
      "severity": "info"
    },
    {
      "timestamp": "2026-08-26 18:45:33",
      "user": "System",
      "action": "Failed Login Attempt",
      "module": "Authentication",
      "record": "Unknown User",
      "details": { "prev": "-", "new": "IP: 192.168.1.100" },
      "remarks": "Invalid password",
      "severity": "danger"
    }
]

db = SessionLocal()

for log in auditLogs:
    db_log = AuditLog(
        timestamp=datetime.strptime(log["timestamp"], "%Y-%m-%d %H:%M:%S"),
        user=log["user"],
        action=log["action"],
        module=log["module"],
        record=log["record"],
        details=log["details"],
        remarks=log["remarks"],
        severity=log["severity"]
    )
    db.add(db_log)

db.commit()
print("Seeded audit logs successfully!")
db.close()
