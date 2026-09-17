import re

filepath = r'd:\ATM-WMS\frontend\src\index.css'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
'''html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  background-color: var(--firo-bg);
}''',
'''html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: var(--firo-bg);
}''')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
