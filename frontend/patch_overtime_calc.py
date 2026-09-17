import re

filepath = r'd:\ATM-WMS\frontend\src\components\OvertimeManagement\index.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_fetch = r"        const response = await fetch\('http://localhost:8000/overtime/'\);\n        if \(response\.ok\) \{\n          const data = await response\.json\(\);\n          setRecords\(data\);\n        \}"
new_fetch = """        const response = await fetch('http://localhost:8000/attendance/');
        if (response.ok) {
          const data = await response.json();
          const otRecords = [];
          data.forEach(att => {
            if (att.outTime) {
              let outH = 0, outM = 0;
              if (att.outTime.includes('AM') || att.outTime.includes('PM')) {
                const parts = att.outTime.split(' ');
                const timeParts = parts[0].split(':');
                outH = parseInt(timeParts[0]);
                outM = parseInt(timeParts[1]);
                if (parts[1] === 'PM' && outH !== 12) outH += 12;
                if (parts[1] === 'AM' && outH === 12) outH = 0;
              } else {
                const timeParts = att.outTime.split(':');
                outH = parseInt(timeParts[0]);
                outM = parseInt(timeParts[1]);
              }
              
              const outMinutes = outH * 60 + outM;
              const shiftEndMinutes = 17 * 60; // 5:00 PM
              
              if (outMinutes > shiftEndMinutes) {
                const otHrs = ((outMinutes - shiftEndMinutes) / 60).toFixed(2);
                if (parseFloat(otHrs) > 0.1) {
                  const rate = 20;
                  const amount = (otHrs * rate).toFixed(2);
                  otRecords.push({
                    id: OT-,
                    empId: att.employeeId,
                    name: att.name,
                    date: att.date,
                    shiftEnd: '05:00 PM',
                    actualOut: att.outTime,
                    otHours: otHrs,
                    rate: $/hr,
                    amount: $,
                    status: 'Pending'
                  });
                }
              }
            }
          });
          setRecords(otRecords);
        }"""

content = re.sub(old_fetch, new_fetch, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
