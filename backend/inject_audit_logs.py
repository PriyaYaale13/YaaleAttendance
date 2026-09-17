import os
import glob

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Skip if already imported
    if "from audit_logs.utils import create_audit_log" not in content:
        # Add import at the top after from typing import List
        if "from typing import List\n" in content:
            content = content.replace("from typing import List\n", "from typing import List\nfrom audit_logs.utils import create_audit_log\n", 1)
        else:
            content = "from audit_logs.utils import create_audit_log\n" + content
    
    # We want to replace db.commit() with audit log injection
    
    # Simple heuristic: we replace every db.commit() with an audit log line + db.commit()
    # BUT wait, the audit log takes arguments based on the context.
    # It's better to just log a generic message for all routes.
    
    lines = content.split('\n')
    new_lines = []
    
    current_route_name = ""
    current_method = ""
    
    for line in lines:
        if "@router.post" in line or "@router.put" in line or "@router.delete" in line:
            current_method = "Created" if "post" in line else "Updated" if "put" in line else "Deleted"
        if "def " in line and current_method:
            current_route_name = line.split("def ")[1].split("(")[0].replace("_", " ").title()
            
        if "db.commit()" in line.strip() and current_method and current_route_name:
            indent = line[:len(line) - len(line.lstrip())]
            module_name = os.path.basename(os.path.dirname(filepath)).replace("_", " ").title()
            
            log_call = f'{indent}create_audit_log(db, "System User", "{current_method} Record: {current_route_name}", "{module_name}", "Unknown", "-", "-", "Action performed via API", "info")'
            
            # Don't add if we already added it (e.g. if script run twice)
            if log_call not in new_lines[-1] and "create_audit_log" not in new_lines[-1]:
                new_lines.append(log_call)
                
            new_lines.append(line)
            # Reset so we don't log multiple times in same func if there are multiple commits, though usually there's one.
            # Actually, keeping it is fine.
        else:
            new_lines.append(line)
            
    with open(filepath, 'w') as f:
        f.write('\n'.join(new_lines))

backend_dir = r"d:\ATM-WMS\backend"
for filepath in glob.glob(os.path.join(backend_dir, "*", "router.py")):
    # skip audit logs and system users (since we did system users manually)
    if "audit_logs" in filepath or "system_users" in filepath or "leaves" in filepath:
        continue
    process_file(filepath)
    print(f"Processed {filepath}")
