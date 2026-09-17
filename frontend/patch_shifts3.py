import re

with open(r'd:\ATM-WMS\frontend\src\components\ShiftHours\index.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add edit state
state_block = r"""  const \[activeTab, setActiveTab\] = useState\('shifts'\);
  const \[showShiftModal, setShowShiftModal\] = useState\(false\);
  const \[searchTerm, setSearchTerm\] = useState\(''\);"""
new_state_block = """  const [activeTab, setActiveTab] = useState('shifts');
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);"""

content = re.sub(state_block, new_state_block, content)

# Change openModal
open_modal = r"""  const openModal = \(\) => \{
    setFormData\(initialForm\);
    setShowShiftModal\(true\);
    document\.body\.style\.overflow = 'hidden';
  \};"""
new_open_modal = """  const openModal = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setEditId(null);
    setErrorMsg('');
    setShowShiftModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleEditClick = (shift) => {
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakHours: shift.breakHours,
      gracePeriod: shift.gracePeriod,
      weeklyOffs: shift.weeklyOffs ? shift.weeklyOffs.split(', ') : []
    });
    setIsEditing(true);
    setEditId(shift.id);
    setErrorMsg('');
    setShowShiftModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleDeleteShift = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shift?')) return;
    try {
      const response = await fetch(http://localhost:8000/shifts/, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchShifts();
      } else {
        alert('Failed to delete shift');
      }
    } catch (error) {
      console.error('Error deleting shift:', error);
    }
  };"""

content = re.sub(open_modal, new_open_modal, content)

# Change handleSaveShift
old_save = r"""  const handleSaveShift = async \(\) => \{.*?
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

      const url = isEditing ? http://localhost:8000/shifts/ : 'http://localhost:8000/shifts/';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchShifts();
        closeModal();
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.detail || 'Error saving shift');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg('Error connecting to server');
    }
  };"""

content = re.sub(old_save, new_save, content, flags=re.DOTALL)

# In the table, hook up buttons
old_buttons = r"""                        <button className="btn btn-sm btn-light text-firo-primary rounded-circle p-2 me-2" title="Edit Shift">
                          <Edit size=\{16\} />
                        </button>
                        <button className="btn btn-sm btn-light text-danger rounded-circle p-2" title="Delete Shift">"""
new_buttons = """                        <button className="btn btn-sm btn-light text-firo-primary rounded-circle p-2 me-2" title="Edit Shift" onClick={() => handleEditClick(shift)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-sm btn-light text-danger rounded-circle p-2" title="Delete Shift" onClick={() => handleDeleteShift(shift.id)}>"""

content = content.replace(old_buttons, new_buttons)

# Update modal title
old_modal_title = r"""<h5 className="modal-title fw-bold text-firo-dark fs-4">Create New Shift</h5>"""
new_modal_title = """<h5 className="modal-title fw-bold text-firo-dark fs-4">{isEditing ? 'Edit Shift' : 'Create New Shift'}</h5>"""
content = content.replace(old_modal_title, new_modal_title)

with open(r'd:\ATM-WMS\frontend\src\components\ShiftHours\index.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
