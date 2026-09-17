import re

filepath = r'd:\ATM-WMS\frontend\src\index.css'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
'''#root {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  text-align: left;
  display: flex;
  flex-direction: column;
}''',
'''#root {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  text-align: left;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}''')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
