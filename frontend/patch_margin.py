import re

with open(r'd:\ATM-WMS\frontend\src\components\Login\index.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_right = r'<div className="d-flex flex-column h-100 bg-white shadow-lg" style=\{\{ width: \'100%\', maxWidth: \'500px\', marginRight: \'8rem\' \}\}>'
new_right = '<div className="d-flex flex-column h-100 bg-white shadow-lg ms-auto" style={{ width: \'100%\', maxWidth: \'500px\', marginRight: \'10vw\' }}>'
content = re.sub(old_right, new_right, content)

with open(r'd:\ATM-WMS\frontend\src\components\Login\index.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
