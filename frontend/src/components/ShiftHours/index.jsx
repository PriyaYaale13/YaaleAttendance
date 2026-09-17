import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock, Plus, Search, Edit, Trash2, Users, CalendarDays, X } from 'lucide-react';
import classNames from 'classnames';


const TimePicker = ({ value, onChange }) => {
  const parts = value ? value.match(/(\d+):(\d+)\s(AM|PM)/) : null;
  const h = parts ? parts[1] : "09";
  const m = parts ? parts[2] : "00";
  const p = parts ? parts[3] : "AM";

  const update = (nh, nm, np) => {
    onChange(`${nh}:${nm} ${np}`);
  };

  const hours = Array.from({length: 12}, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({length: 12}, (_, i) => String(i * 5).padStart(2, '0'));

  return (
    <div className="d-flex gap-2">
      <select className="form-select bg-firo-bg border-0 rounded-3 text-center" value={h} onChange={(e) => update(e.target.value, m, p)}>
        {hours.map(x => <option key={x} value={x}>{x}</option>)}
      </select>
      <span className="align-self-center fw-bold text-muted">:</span>
      <select className="form-select bg-firo-bg border-0 rounded-3 text-center" value={m} onChange={(e) => update(h, e.target.value, p)}>
        {minutes.map(x => <option key={x} value={x}>{x}</option>)}
      </select>
      <select className="form-select bg-firo-bg border-0 rounded-3 text-center" value={p} onChange={(e) => update(h, m, e.target.value)}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};

const ShiftHours = () => {
  const [activeTab, setActiveTab] = useState('shifts');
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [shifts, setShifts] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
          weeklyOffs: shift.weeklyOffs
        }));
        setShifts(mappedData);
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  };

  React.useEffect(() => {
    fetchShifts();
  }, []);

  // Form State
  const initialForm = {
    name: '',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    breakHours: '',
    gracePeriod: '',
    weeklyOffs: []
  };
  const [formData, setFormData] = useState(initialForm);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (day) => {
    setFormData(prev => {
      const offs = prev.weeklyOffs.includes(day)
        ? prev.weeklyOffs.filter(d => d !== day)
        : [...prev.weeklyOffs, day];
      return { ...prev, weeklyOffs: offs };
    });
  };

  const openModal = () => {
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

  const handleDeleteShift = (id) => {
    setShiftToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteShift = async () => {
    if (!shiftToDelete) return;
    try {
      const response = await fetch(`http://localhost:8000/shifts/${shiftToDelete}`, {
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
  };

  const closeModal = () => {
    setShowShiftModal(false);
    document.body.style.overflow = 'unset';
  };

  const handleSaveShift = async () => {
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

      const url = isEditing ? `http://localhost:8000/shifts/${editId}` : 'http://localhost:8000/shifts/';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchShifts();
        closeModal();
        setSuccessMessage(isEditing ? 'Shift updated successfully!' : 'Shift created successfully!');
        setShowSuccessModal(true);
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.detail || 'Error saving shift');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg('Error connecting to server');
    }
  };

  const filteredShifts = shifts.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">Shift & Working Hours</h1>
          <p className="text-firo-muted m-0 small">Define work schedules, grace periods, breaks, and shift assignments.</p>
        </div>
        <button className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm" onClick={openModal}>
          <Plus size={18} /> Add New Shift
        </button>
      </div>

      <div className="mb-4 border-bottom">
        <ul className="nav nav-tabs border-0 gap-3">
          <li className="nav-item">
            <button 
              className={classNames('nav-link border-0 text-firo-dark bg-transparent pb-3 fw-medium', { 'border-bottom border-primary border-3 text-primary': activeTab === 'shifts' })}
              style={{ borderColor: activeTab === 'shifts' ? 'var(--firo-primary) !important' : 'transparent', color: activeTab === 'shifts' ? 'var(--firo-primary) !important' : '' }}
              onClick={() => setActiveTab('shifts')}
            >
              <Clock size={16} className="me-2 mb-1" />
              Configurations
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={classNames('nav-link border-0 text-firo-dark bg-transparent pb-3 fw-medium', { 'border-bottom border-primary border-3 text-primary': activeTab === 'assignments' })}
              style={{ borderColor: activeTab === 'assignments' ? 'var(--firo-primary) !important' : 'transparent', color: activeTab === 'assignments' ? 'var(--firo-primary) !important' : '' }}
              onClick={() => setActiveTab('assignments')}
            >
              <Users size={16} className="me-2 mb-1" />
              Assignments
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={classNames('nav-link border-0 text-firo-dark bg-transparent pb-3 fw-medium', { 'border-bottom border-primary border-3 text-primary': activeTab === 'holidays' })}
              style={{ borderColor: activeTab === 'holidays' ? 'var(--firo-primary) !important' : 'transparent', color: activeTab === 'holidays' ? 'var(--firo-primary) !important' : '' }}
              onClick={() => setActiveTab('holidays')}
            >
              <CalendarDays size={16} className="me-2 mb-1" />
              Holidays
            </button>
          </li>
        </ul>
      </div>

      {activeTab === 'shifts' && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="p-4 border-bottom bg-white d-flex align-items-center justify-content-between flex-wrap gap-3">
            <h5 className="m-0 fw-bold text-firo-dark">Active Shifts</h5>
            <div className="position-relative" style={{ width: '250px' }}>
              <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-firo-muted" />
              <input 
                type="text" 
                className="form-control rounded-pill ps-5 bg-firo-bg border-0" 
                placeholder="Search shifts..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="text-firo-muted small text-uppercase fw-semibold py-3 px-4">Shift Name</th>
                  <th className="text-firo-muted small text-uppercase fw-semibold py-3">Timing</th>
                  <th className="text-firo-muted small text-uppercase fw-semibold py-3">Break / Grace</th>
                  <th className="text-firo-muted small text-uppercase fw-semibold py-3">Weekly Offs</th>
                  <th className="text-firo-muted small text-uppercase fw-semibold py-3 text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {filteredShifts.map((shift) => (
                  <tr key={shift.id}>
                    <td className="px-4 fw-bold text-firo-dark">{shift.name}</td>
                    <td>
                      <div className="fw-medium text-firo-primary">{shift.startTime} - {shift.endTime}</div>
                      <div className="small text-firo-muted">Standard 9 hrs (incl. break)</div>
                    </td>
                    <td>
                      <div className="text-firo-dark small">Break: <span className="fw-medium">{shift.breakHours} hr</span></div>
                      <div className="text-firo-muted small">Grace: {shift.gracePeriod}</div>
                    </td>
                    <td>
                      <span className="badge bg-light border text-firo-dark rounded-pill px-3 py-2 fw-medium">
                        {shift.weeklyOffs || 'None'}
                      </span>
                    </td>
                    <td className="text-end px-4">
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        <button className="btn btn-sm btn-light text-firo-primary rounded-circle p-2" title="Edit Shift" onClick={() => handleEditClick(shift)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn btn-sm btn-light text-danger rounded-circle p-2" title="Delete Shift" onClick={() => handleDeleteShift(shift.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <Users size={48} className="text-firo-muted mx-auto mb-3 opacity-50" />
          <h4 className="fw-bold text-firo-dark mb-2">Shift Assignments</h4>
          <p className="text-firo-muted mb-4">Map employees to their respective shift schedules here.</p>
          <button className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 mx-auto">Assign Shifts</button>
        </div>
      )}

      {activeTab === 'holidays' && (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
          <CalendarDays size={48} className="text-firo-muted mx-auto mb-3 opacity-50" />
          <h4 className="fw-bold text-firo-dark mb-2">Holiday Calendar</h4>
          <p className="text-firo-muted mb-4">Define organizational holidays that affect attendance calculation.</p>
          <button className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 mx-auto">Manage Holidays</button>
        </div>
      )}

      {/* Add Shift Modal */}
      {showShiftModal && createPortal(
        <>
          <div className="modal-backdrop fade show" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', transform: 'translateZ(0)', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                <div className="modal-header border-bottom-0 pb-0 mt-2 mx-2">
                  <h5 className="modal-title fw-bold text-firo-dark fs-4">{isEditing ? 'Edit Shift' : 'Create New Shift'}</h5>
                  <button type="button" className="btn btn-link text-firo-muted p-0" onClick={closeModal}>
                    <X size={24} />
                  </button>
                </div>
                <div className="modal-body py-4 px-4">
                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="mb-4">
                      <label className="form-label text-firo-muted small fw-semibold text-uppercase">Shift Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. Morning Shift" autoFocus />
                    </div>
                    
                    <div className="row mb-4">
                      <div className="col-md-6 mb-3 mb-md-0">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Start Time</label>
                        <TimePicker value={formData.startTime} onChange={(val) => setFormData({...formData, startTime: val})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">End Time</label>
                        <TimePicker value={formData.endTime} onChange={(val) => setFormData({...formData, endTime: val})} />
                      </div>
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-6 mb-3 mb-md-0">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Break Hours</label>
                        <input type="text" name="breakHours" value={formData.breakHours} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. 1" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Grace Period</label>
                        <input type="text" name="gracePeriod" value={formData.gracePeriod} onChange={handleInputChange} className="form-control rounded-3 py-2 bg-firo-bg border-0" placeholder="e.g. 15 mins" />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label text-firo-muted small fw-semibold text-uppercase d-block mb-3">Weekly Offs</label>
                      <div className="d-flex flex-wrap gap-2">
                        {daysOfWeek.map(day => (
                          <div key={day} className="form-check form-check-inline border rounded-pill px-3 py-2 m-0 bg-firo-bg" style={{ borderColor: formData.weeklyOffs.includes(day) ? 'var(--firo-primary) !important' : 'var(--firo-border)' }}>
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id={`day-${day}`}
                              checked={formData.weeklyOffs.includes(day)}
                              onChange={() => handleCheckboxChange(day)}
                            />
                            <label className="form-check-label ms-1 small fw-medium text-firo-dark" htmlFor={`day-${day}`}>
                              {day}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer border-top-0 pt-0 pb-4 px-4 d-flex gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4 flex-grow-1" onClick={closeModal}>Cancel</button>
                  <button type="button" className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 flex-grow-1" onClick={handleSaveShift}>Save Shift</button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {showDeleteModal && createPortal(
        <>
          <div className="modal-backdrop fade show" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', transform: 'translateZ(0)', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered modal-sm" style={{ maxWidth: '350px' }}>
              <div className="modal-content rounded-4 border-0 shadow-lg p-4 text-center">
                <div className="mb-3">
                  <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex p-3">
                    <Trash2 size={24} />
                  </div>
                </div>
                <h5 className="fw-bold text-dark mb-3">Delete Shift</h5>
                <p className="text-muted small mb-4">Are you sure you want to delete this shift? This action cannot be undone.</p>
                <div className="d-flex justify-content-center gap-3">
                  <button type="button" className="btn btn-light rounded-pill px-4 flex-grow-1" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                  <button type="button" className="btn btn-danger rounded-pill px-4 flex-grow-1" onClick={confirmDeleteShift}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {showSuccessModal && createPortal(
        <>
          <div className="modal-backdrop fade show" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', transform: 'translateZ(0)', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered modal-sm" style={{ maxWidth: '350px' }}>
              <div className="modal-content rounded-4 border-0 shadow-lg p-4 text-center">
                <h5 className="fw-bold text-success mb-3">Success!</h5>
                <p className="text-muted small mb-4">{successMessage}</p>
                <button type="button" className="btn btn-success rounded-pill px-4 w-100" onClick={() => setShowSuccessModal(false)}>Continue</button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default ShiftHours;
