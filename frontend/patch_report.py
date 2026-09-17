import re

filepath = r'd:\ATM-WMS\frontend\src\components\AttendanceOTReport\index.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to replace mock data state
old_mock = r"  // Consolidated Mock Data\n  const \[reports, setReports\] = useState\(\[\n[\s\S]*?\]\);"

new_mock = """  const [reports, setReports] = useState([]);

  React.useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch('http://localhost:8000/attendance/');
        if (response.ok) {
          const data = await response.json();
          const reportData = data.map(att => {
            let totalHrs = 0;
            let regularHrs = 0;
            let otHrs = 0;
            let status = 'Absent';
            let workflow = 'Processed';

            const parseTime = (timeStr) => {
              if (!timeStr) return null;
              let h = 0, m = 0;
              if (timeStr.includes('AM') || timeStr.includes('PM')) {
                const parts = timeStr.split(' ');
                const timeParts = parts[0].split(':');
                h = parseInt(timeParts[0]);
                m = parseInt(timeParts[1]);
                if (parts[1] === 'PM' && h !== 12) h += 12;
                if (parts[1] === 'AM' && h === 12) h = 0;
              } else {
                const timeParts = timeStr.split(':');
                h = parseInt(timeParts[0]);
                m = parseInt(timeParts[1]);
              }
              return h * 60 + m;
            };

            const inMins = parseTime(att.inTime);
            const outMins = parseTime(att.outTime);

            if (inMins !== null && outMins !== null) {
              status = 'Present';
              const diffMins = outMins - inMins;
              totalHrs = diffMins / 60;
              const shiftEndMins = 17 * 60; // 5:00 PM
              
              if (outMins > shiftEndMins) {
                otHrs = (outMins - shiftEndMins) / 60;
                regularHrs = totalHrs - otHrs;
                workflow = 'Pending Approval';
              } else {
                regularHrs = totalHrs;
              }
            } else if (inMins !== null) {
              status = 'Missing Out';
            }

            const otAmount = otHrs > 0 ? (otHrs * 20).toFixed(2) : 0;

            return {
              id: RPT-,
              empId: att.employeeId,
              name: att.name,
              date: att.date,
              inTime: att.inTime || '-',
              outTime: att.outTime || '-',
              totalHrs: totalHrs > 0 ? totalHrs.toFixed(2) : '-',
              regularHrs: regularHrs > 0 ? regularHrs.toFixed(2) : '-',
              otHrs: otHrs > 0 ? otHrs.toFixed(2) : '0',
              otRate: otHrs > 0 ? '/hr' : '-',
              otAmount: otHrs > 0 ? $ : '-',
              status: status,
              workflow: workflow
            };
          });
          setReports(reportData);
        }
      } catch (err) {
        console.error('Error fetching report data:', err);
      }
    };
    fetchRecords();
  }, []);"""

content = re.sub(old_mock, new_mock, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
