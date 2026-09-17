import re

filepath = r'd:\ATM-WMS\frontend\src\components\OvertimeManagement\index.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_mock = r"  // Mock OT Records Data\n  const \[records\] = useState\(\[\n[\s\S]*?\]\);"
new_mock = """  const [records, setRecords] = useState([]);

  React.useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch('http://localhost:8000/overtime/');
        if (response.ok) {
          const data = await response.json();
          setRecords(data);
        }
      } catch (err) {
        console.error('Error fetching overtime records:', err);
      }
    };
    fetchRecords();
  }, []);"""

content = re.sub(old_mock, new_mock, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
