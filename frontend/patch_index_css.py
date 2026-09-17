import re

filepath = r'd:\ATM-WMS\frontend\src\index.css'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('height: 100%;', 'height: 100vh;', 1)
content = content.replace('height: 100%;', 'height: 100vh;', 1)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
