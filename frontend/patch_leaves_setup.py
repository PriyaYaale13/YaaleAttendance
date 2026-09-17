# Update components/index.js
with open(r'd:\ATM-WMS\frontend\src\components\index.js', 'r', encoding='utf-8') as f:
    content = f.read()
if content.startswith('\ufeff'): content = content[1:]
lines = [l for l in content.split('\n') if 'LeaveManagement' not in l and l.strip()]
lines.append("export { default as LeaveManagement } from './LeaveManagement';")
with open(r'd:\ATM-WMS\frontend\src\components\index.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write('\n'.join(lines))

# Update App.jsx
with open(r'd:\ATM-WMS\frontend\src\App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()
if 'LeaveManagement' not in content:
    content = content.replace("  EarlyDepartureManagement", "  EarlyDepartureManagement,\n  LeaveManagement")
    content = content.replace("case 'Early Departure Management': return <EarlyDepartureManagement />;", "case 'Early Departure Management': return <EarlyDepartureManagement />;\n      case 'Leave Management': return <LeaveManagement />;")
    with open(r'd:\ATM-WMS\frontend\src\App.jsx', 'w', encoding='utf-8') as f:
        f.write(content)

# Update Sidebar.jsx
with open(r'd:\ATM-WMS\frontend\src\components\Navigation\Sidebar.jsx', 'r', encoding='utf-8') as f:
    content = f.read()
if 'Leave Management' not in content:
    # Need to add LogOut icon if not there, wait I'll use FileCheck for Leave, wait I didn't import it. I'll use ClipboardCheck or FileText. Let's use FileSpreadsheet
    content = content.replace("{ name: 'Early Departure Management', icon: LogOut },", "{ name: 'Early Departure Management', icon: LogOut },\n      { name: 'Leave Management', icon: CheckSquare },")
    with open(r'd:\ATM-WMS\frontend\src\components\Navigation\Sidebar.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
