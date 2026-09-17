import re

filepath = r'd:\ATM-WMS\frontend\src\components\Login\index.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace fixed positioning with flex grow
old_style = r"width: '100%', height: '100%', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0, padding: 0,"
new_style = "width: '100%', minHeight: '100vh', flex: 1, margin: 0, padding: 0, position: 'relative',"

content = re.sub(old_style, new_style, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
