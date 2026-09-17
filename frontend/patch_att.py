import re

with open(r'd:\ATM-WMS\frontend\src\components\AttendanceManagement\index.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace mock state
old_mock = r"  // Mock Attendance Data\n  const \[records, setRecords\] = useState\(\[\n[\s\S]*?\]\);"
new_mock = """  const [records, setRecords] = useState([]);
  
  const fetchRecords = async () => {
    try {
      const response = await fetch('http://localhost:8000/attendance/');
      if (response.ok) {
        const data = await response.json();
        const mapped = data.map(r => ({
          id: r.id,
          empId: r.employeeId,
          name: r.name,
          date: r.date,
          inTime: r.inTime || null,
          outTime: r.outTime || null,
          status: (r.inTime && r.outTime) ? 'Present' : (r.inTime && !r.outTime) ? 'Missing Out' : 'Absent',
          totalHours: r.workingHours || '-',
          auditTrail: []
        }));
        setRecords(mapped);
      }
    } catch (err) { console.error('Error fetching attendance:', err); }
  };

  React.useEffect(() => {
    fetchRecords();
  }, []);"""

content = re.sub(old_mock, new_mock, content)

# Update handleSaveCorrection
old_save = r"  const handleSaveCorrection = \(\) => \{\n[\s\S]*?    \}\);\n    closeEditModal\(\);\n  \};"

new_save = """  const handleSaveCorrection = async () => {
    if (!editForm.reason) {
      alert("Please provide a reason for the attendance correction (Audit purposes).");
      return;
    }

    const updatedTotalHours = calculateHours(editForm.inTime, editForm.outTime);

    try {
      const payload = {
        employeeId: editingRecord.empId,
        date: editingRecord.date,
        inTime: editForm.inTime || null,
        outTime: editForm.outTime || null,
        workingHours: updatedTotalHours !== '-' ? updatedTotalHours + ' hrs' : null
      };

      const response = await fetch(http://localhost:8000/attendance/, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        await fetchRecords();
        closeEditModal();
      } else {
        alert('Failed to update record');
      }
    } catch (err) {
      console.error('Error updating record:', err);
    }
  };"""
content = re.sub(old_save, new_save, content)

with open(r'd:\ATM-WMS\frontend\src\components\AttendanceManagement\index.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
