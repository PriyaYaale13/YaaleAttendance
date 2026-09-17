import re

with open(r'd:\ATM-WMS\frontend\src\components\ShiftHours\index.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("weeklyOffs: shift.weeklyOffs ? shift.weeklyOffs.split(', ') : []", "weeklyOffs: shift.weeklyOffs")

with open(r'd:\ATM-WMS\frontend\src\components\ShiftHours\index.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
