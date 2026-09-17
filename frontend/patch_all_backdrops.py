import re

def update_backdrops(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # ShiftHours has 100vw/100vh
    old_backdrop_1 = r"width: '100vw', height: '100vh'"
    new_backdrop_1 = "right: 0, bottom: 0, width: '100%', height: '100%', transform: 'translateZ(0)'"
    content = re.sub(old_backdrop_1, new_backdrop_1, content)
    
    # EmployeeManagement has inset: 0
    old_backdrop_2 = r"inset: 0,\s*zIndex: 1050,\s*backgroundColor: 'rgba\(255, 255, 255, 0\.7\)',\s*backdropFilter: 'blur\(8px\)',\s*WebkitBackdropFilter: 'blur\(8px\)'"
    new_backdrop_2 = "top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', transform: 'translateZ(0)'"
    content = re.sub(old_backdrop_2, new_backdrop_2, content)

    old_backdrop_3 = r"inset: 0,\s*zIndex: 1060,\s*backgroundColor: 'rgba\(255, 255, 255, 0\.5\)'"
    new_backdrop_3 = "top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', transform: 'translateZ(0)'"
    content = re.sub(old_backdrop_3, new_backdrop_3, content)

    old_backdrop_4 = r"inset: 0,\s*zIndex: 1060,\s*backgroundColor: 'rgba\(255, 255, 255, 0\.8\)'"
    new_backdrop_4 = "top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', transform: 'translateZ(0)'"
    content = re.sub(old_backdrop_4, new_backdrop_4, content)

    # Make sure all zIndex for modals are 9999
    content = re.sub(r"zIndex: 1055", "zIndex: 9999", content)
    content = re.sub(r"zIndex: 1065", "zIndex: 9999", content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

update_backdrops(r'd:\ATM-WMS\frontend\src\components\ShiftHours\index.jsx')
update_backdrops(r'd:\ATM-WMS\frontend\src\components\EmployeeManagement\index.jsx')
