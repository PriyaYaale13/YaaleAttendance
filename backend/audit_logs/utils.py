from sqlalchemy.orm import Session
from audit_logs import models
from datetime import datetime

def create_audit_log(db: Session, user: str, action: str, module: str, record: str, prev_val: str, new_val: str, remarks: str, severity: str = "info"):
    db_log = models.AuditLog(
        timestamp=datetime.now(),
        user=user,
        action=action,
        module=module,
        record=record,
        details={"prev": prev_val, "new": new_val},
        remarks=remarks,
        severity=severity
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log
