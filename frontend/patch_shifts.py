import re

with open(r'd:\ATM-WMS\frontend\src\components\ShiftHours\index.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace mock state with fetch logic
mock_state = r"""  // Mock Shifts Data
  const \[shifts, setShifts\] = useState\(\[
.*?
  \]\);"""

new_state = """  const [shifts, setShifts] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchShifts = async () => {
    try {
      const response = await fetch('http://localhost:8000/shifts/');
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map(shift => ({
          id: shift.id,
          name: shift.shiftName,
          startTime: shift.startTime,
          endTime: shift.endTime,
          breakHours: shift.breakHours,
          gracePeriod: shift.gracePeriod,
          weeklyOffs: shift.weeklyOffs ? shift.weeklyOffs.split(', ') : []
        }));
        setShifts(mappedData);
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  };

  React.useEffect(() => {
    fetchShifts();
  }, []);"""

content = re.sub(mock_state, new_state, content, flags=re.DOTALL)

# Replace handleSaveShift
old_save = r"""  const handleSaveShift = \(\) => \{.*?
  \};"""

new_save = """  const handleSaveShift = async () => {
    if (!formData.name) return;
    
    try {
      const payload = {
        shiftName: formData.name,
        startTime: formData.startTime,
        endTime: formData.endTime,
        breakHours: formData.breakHours,
        gracePeriod: formData.gracePeriod,
        weeklyOffs: formData.weeklyOffs.join(', ')
      };

      const response = await fetch('http://localhost:8000/shifts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchShifts();
        closeModal();
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.detail || 'Error creating shift');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg('Error connecting to server');
    }
  };"""

content = re.sub(old_save, new_save, content, flags=re.DOTALL)

# Insert error message in modal
old_modal_start = r"""                <div className="modal-body py-4 px-4">
                  <form onSubmit=\{\(e\) => e.preventDefault\(\)\}>"""

new_modal_start = """                <div className="modal-body py-4 px-4">
                  {errorMsg && (
                    <div className="alert alert-danger py-2 border-0 rounded-3 small fw-medium mb-4">
                      {errorMsg}
                    </div>
                  )}
                  <form onSubmit={(e) => e.preventDefault()}>"""

content = content.replace(old_modal_start, new_modal_start)

# In table render, weeklyOffs is an array now or string? 
# In fetchShifts, we parse it to array if it was string.
# Let's check how it's rendered.
# "weeklyOffs: shift.weeklyOffs" -> array.
# The render uses shift.weeklyOffs. Wait, in mock data it was a string "Saturday, Sunday".
# Let's fix fetchShifts to just keep it as a string to match existing code, or update render.
# Wait, handleCheckboxChange treats prev.weeklyOffs as an array. Let's look at mock data...
# Ah! In mock data: weeklyOffs: 'Saturday, Sunday'. But in formData it's an array: weeklyOffs: [].
# When rendering, it's a string. So in fetchShifts mappedData: weeklyOffs: shift.weeklyOffs. That's already a string from DB.

with open(r'd:\ATM-WMS\frontend\src\components\ShiftHours\index.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
