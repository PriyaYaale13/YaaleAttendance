with open(r'd:\ATM-WMS\frontend\src\components\ShiftHours\index.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("await fetch(http://localhost:8000/shifts/, {", "await fetch(http://localhost:8000/shifts/, {")
content = content.replace("await fetch(http://localhost:8000/shifts/, {", "await fetch(http://localhost:8000/shifts/, {")
content = content.replace("const url = isEditing ? http://localhost:8000/shifts/ : 'http://localhost:8000/shifts/';", "const url = isEditing ? http://localhost:8000/shifts/ : 'http://localhost:8000/shifts/';")
content = content.replace("const url = isEditing ? http://localhost:8000/shifts/ : 'http://localhost:8000/shifts/';", "const url = isEditing ? http://localhost:8000/shifts/ : 'http://localhost:8000/shifts/';")

with open(r'd:\ATM-WMS\frontend\src\components\ShiftHours\index.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
