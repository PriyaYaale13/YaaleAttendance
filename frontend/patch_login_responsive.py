import re

with open(r'd:\ATM-WMS\frontend\src\components\Login\index.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hardcoded width on left panel
left_panel_old = r'<div className="d-none d-lg-flex flex-column justify-content-between position-relative" \s*style=\{\{ width: \'50%\', height: \'100%\', backgroundColor: \'#134e7a\', padding: \'4rem 4rem 3rem 4rem\', overflow: \'hidden\' \}\}>'
left_panel_new = '<div className="d-none d-lg-flex flex-column justify-content-between position-relative w-50" \n           style={{ height: \'100%\', backgroundColor: \'#134e7a\', padding: \'4rem 4rem 3rem 4rem\', overflow: \'hidden\' }}>'
content = re.sub(left_panel_old, left_panel_new, content)

# Replace hardcoded width on right panel
right_panel_old = r'<div className="d-flex flex-column justify-content-center align-items-center bg-white position-relative" \s*style=\{\{ width: \'50%\', height: \'100%\', flex: \'1 1 50%\', padding: \'2rem\' \}\}>'
right_panel_new = '<div className="d-flex flex-column justify-content-center align-items-center bg-white position-relative flex-grow-1" \n           style={{ height: \'100%\', padding: \'2rem\' }}>'
content = re.sub(right_panel_old, right_panel_new, content)

with open(r'd:\ATM-WMS\frontend\src\components\Login\index.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
