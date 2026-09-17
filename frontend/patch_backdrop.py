import re

with open(r'd:\ATM-WMS\frontend\src\components\ShiftHours\index.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace showShiftModal backdrop
old_backdrop_1 = r'''<div className="modal-backdrop fade show" style=\{\{ position: 'fixed', inset: 0, zIndex: 1050, backgroundColor: 'rgba\(255, 255, 255, 0\.7\)', backdropFilter: 'blur\(8px\)', WebkitBackdropFilter: 'blur\(8px\)' \}\}></div>
          <div className="modal fade show d-block" tabIndex="-1" style=\{\{ zIndex: 1055 \}\}>'''
new_backdrop_1 = '''<div className="modal-backdrop fade show" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 9999 }}>'''
content = re.sub(old_backdrop_1, new_backdrop_1, content)

# Replace showDeleteModal backdrop
old_backdrop_2 = r'''<div className="modal-backdrop fade show" style=\{\{ position: 'fixed', inset: 0, zIndex: 1060, backgroundColor: 'rgba\(0, 0, 0, 0\.4\)' \}\}></div>
          <div className="modal fade show d-block" tabIndex="-1" style=\{\{ zIndex: 1065 \}\}>'''
new_backdrop_2 = '''<div className="modal-backdrop fade show" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 9999 }}>'''
content = re.sub(old_backdrop_2, new_backdrop_2, content)

with open(r'd:\ATM-WMS\frontend\src\components\ShiftHours\index.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
