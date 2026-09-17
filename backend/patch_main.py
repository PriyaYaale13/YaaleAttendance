import re

filepath = r'd:\ATM-WMS\backend\main.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(r'\n', '\n')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
