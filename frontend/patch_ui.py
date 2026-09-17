import re

with open(r'd:\ATM-WMS\frontend\src\components\ShiftHours\index.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add states
state_old = r"  const \[errorMsg, setErrorMsg\] = useState\(''\);"
state_new = """  const [errorMsg, setErrorMsg] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');"""
content = re.sub(state_old, state_new, content)

# Change handleDeleteShift
del_old = r"""  const handleDeleteShift = async \(id\) => \{
    if \(!window\.confirm\('Are you sure you want to delete this shift\?'\)\) return;
    try \{
      const response = await fetch\(http://localhost:8000/shifts/\$\{id\}\, \{
        method: 'DELETE'
      \}\);
      if \(response\.ok\) \{
        await fetchShifts\(\);
      \} else \{
        alert\('Failed to delete shift'\);
      \}
    \} catch \(error\) \{
      console\.error\('Error deleting shift:', error\);
    \}
  \};"""

del_new = """  const handleDeleteShift = (id) => {
    setShiftToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteShift = async () => {
    if (!shiftToDelete) return;
    try {
      const response = await fetch(http://localhost:8000/shifts/, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchShifts();
        setShowDeleteModal(false);
        setShiftToDelete(null);
        setSuccessMessage('Shift deleted successfully!');
        setShowSuccessModal(true);
      } else {
        alert('Failed to delete shift');
      }
    } catch (error) {
      console.error('Error deleting shift:', error);
    }
  };"""
content = re.sub(del_old, del_new, content)

# Change handleSaveShift to trigger success modal
save_old = r"""      if \(response\.ok\) \{
        await fetchShifts\(\);
        closeModal\(\);
      \} else \{"""
save_new = """      if (response.ok) {
        await fetchShifts();
        closeModal();
        setSuccessMessage(isEditing ? 'Shift updated successfully!' : 'Shift created successfully!');
        setShowSuccessModal(true);
      } else {"""
content = re.sub(save_old, save_new, content)

with open(r'd:\ATM-WMS\frontend\src\components\ShiftHours\index.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
