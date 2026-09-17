import re

filepath = r'd:\ATM-WMS\frontend\src\components\Login\index.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace vw/vh with 100% and right/bottom
old_style = r"width: '100vw',\s*height: '100vh',\s*position: 'fixed',\s*top: 0,\s*left: 0,"
new_style = "width: '100%', height: '100%', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0, padding: 0,"

content = re.sub(old_style, new_style, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
