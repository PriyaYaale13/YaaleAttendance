import re

filepath = r'd:\ATM-WMS\frontend\src\components\Navigation\Navigation.css'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
'''.firo-sidebar {
  width: 260px;
  height: 100%;
  border-right: 1px solid var(--firo-border);
  transition: all 0.3s ease-in-out;
  position: relative;
  z-index: 1040;
}''',
'''.firo-sidebar {
  width: 260px;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  border-right: 1px solid var(--firo-border);
  transition: all 0.3s ease-in-out;
  position: relative;
  z-index: 1040;
}''')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
