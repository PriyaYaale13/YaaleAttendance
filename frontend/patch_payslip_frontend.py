import re

filepath = r'd:\ATM-WMS\frontend\src\components\PayslipModule\index.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace the const [payslips] = useState([ ... mock data ... ]); with actual fetch logic.
# Let's find where the mock data starts and ends.
start_idx = content.find('const [payslips] = useState([')
end_idx = content.find('  const filteredPayslips', start_idx)

if start_idx != -1 and end_idx != -1:
    new_state = """const [payslips, setPayslips] = useState([]);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      const response = await fetch('http://localhost:8000/payslips/');
      if (response.ok) {
        const data = await response.json();
        setPayslips(data);
      }
    } catch (err) {
      console.error('Error fetching payslips:', err);
    }
  };
"""
    content = content[:start_idx] + new_state + "\n  " + content[end_idx:]
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
else:
    print("Could not find the mock data block.")
