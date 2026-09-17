import re

filepath = r'd:\ATM-WMS\frontend\src\components\Navigation\Sidebar.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_menu = "{ name: 'Attendance Management', icon: ClipboardCheck },"
new_menu = "{ name: 'Attendance Management', icon: ClipboardCheck },\n      { name: 'Early Departure Management', icon: LogOut },"
content = content.replace(old_menu, new_menu)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
