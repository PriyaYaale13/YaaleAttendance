import re

filepath = r'd:\ATM-WMS\frontend\src\components\QRAttendance\index.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace col-lg-4 with col-12 mb-4
content = content.replace('<div className="col-lg-4">', '<div className="col-12 mb-4">')

# Replace col-lg-8 with col-12
content = content.replace('<div className="col-lg-8">', '<div className="col-12">')

# We can also constrain the QR code to be centered and not take the whole screen width too awkwardly.
# Wait, let's just make it col-12, but inside the card we can center it. It's already d-flex flex-column align-items-center.
# Wait, let's limit the max-width of the form.
content = content.replace('<form onSubmit={simulateQRScan} className="w-100">', '<form onSubmit={simulateQRScan} className="w-100" style={{ maxWidth: "500px" }}>')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
