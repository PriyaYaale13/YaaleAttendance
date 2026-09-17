import re

filepath = r'd:\ATM-WMS\frontend\src\App.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Update import
content = content.replace("  Settings", "  Settings,\n  EarlyDepartureManagement")

# Update switch statement
switch_str = "case 'Attendance Management': return <AttendanceManagement />;"
content = content.replace(switch_str, "case 'Attendance Management': return <AttendanceManagement />;\n      case 'Early Departure Management': return <EarlyDepartureManagement />;")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
