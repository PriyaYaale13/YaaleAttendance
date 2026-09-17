import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ClipboardCheck, Search, Edit2, Calendar as CalendarIcon, Filter, X, History } from 'lucide-react';
import classNames from 'classnames';

const getLocalYMD = (d = new Date()) => {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

const AttendanceManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState(getLocalYMD());
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [records, setRecords] = useState({ attendance: [], employees: [] });
  
  const fetchRecords = async () => {
    try {
      const [attRes, empRes] = await Promise.all([
        fetch('http://localhost:8000/attendance/'),
        fetch('http://localhost:8000/employees/')
      ]);
      
      let attData = [];
      let empData = [];
      if (attRes.ok) attData = await attRes.json();
      if (empRes.ok) empData = await empRes.json();
      
      setRecords({ attendance: attData, employees: empData });
    } catch (err) { console.error('Error fetching data:', err); }
  };

  React.useEffect(() => {
    fetchRecords();
  }, []);

  const [editForm, setEditForm] = useState({ inTime: '', outTime: '', reason: '' });

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Present': return 'bg-success bg-opacity-10 text-success';
      case 'Late': return 'bg-warning bg-opacity-10 text-warning';
      case 'Half Day': return 'bg-info bg-opacity-10 text-info';
      case 'Missing Out': return 'bg-danger bg-opacity-10 text-danger';
      case 'Absent': return 'bg-secondary bg-opacity-10 text-secondary';
      case 'Pending': return 'bg-light text-muted border';
      case 'Early Leave': return 'bg-warning bg-opacity-10 text-warning';
      default: return 'bg-light text-dark';
    }
  };

  const calculateHours = (inTime, outTime) => {
    if (!inTime || !outTime) return '-';
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);
    let diff = (outH * 60 + outM) - (inH * 60 + inM);
    if (diff < 0) diff += 24 * 60; // overnight
    return (diff / 60).toFixed(2);
  };

  const handleEditClick = (record) => {
    setEditingRecord(record);
    setEditForm({ 
      inTime: record.inTime || '', 
      outTime: record.outTime || '', 
      reason: '' 
    });
    setShowEditModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingRecord(null);
    document.body.style.overflow = 'unset';
  };

  const handleSaveCorrection = async () => {
    if (!editForm.reason) {
      alert("Please provide a reason for the attendance correction (Audit purposes).");
      return;
    }

    const updatedTotalHours = calculateHours(editForm.inTime, editForm.outTime);
    let payload = {
      inTime: editForm.inTime,
      outTime: editForm.outTime,
      workingHours: updatedTotalHours
    };

    if (editingRecord.id) {
      // update existing
      try {
        await fetch(`http://localhost:8000/attendance/${editingRecord.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch(err) { console.error(err); }
    } else {
      // create new manual record if absent
      alert("Creating new records manually is not fully implemented in this prototype.");
    }

    await fetchRecords();
    closeEditModal();
  };

  const computedDailyRecords = React.useMemo(() => {
    const { attendance, employees } = records;
    if (!employees.length) return [];

    const now = new Date();
    const currentDateStr = getLocalYMD(now);
    const isPast5PM = now.getHours() >= 17;
    const isFilterDateInPast = filterDate < currentDateStr;
    const isFilterDateToday = filterDate === currentDateStr;

    return employees.map(emp => {
      // Calculate Total Present and Total Absent from date 1 to till now
      let totalPresent = 0;
      let totalAbsent = 0;
      let locationCounts = {};
      
      // Count for all past days and today
      const startDay = 1;
      const todayNum = new Date().getDate();
      
      for (let d = startDay; d <= todayNum; d++) {
        const checkDate = new Date(now.getFullYear(), now.getMonth(), d);
        const dateStr = getLocalYMD(checkDate);
        
        const pastAtt = attendance.find(a => a.employeeId === emp.employeeId && a.date === dateStr);
        
        const isCheckPast5PM = now.getHours() >= 17;
        const isCheckDateInPast = dateStr < currentDateStr;
        const isCheckDateToday = dateStr === currentDateStr;
        
        if (pastAtt) {
           if (pastAtt.inTime && pastAtt.outTime) {
              totalPresent++;
              const loc = pastAtt.location || 'Unknown';
              locationCounts[loc] = (locationCounts[loc] || 0) + 1;
           } else if (pastAtt.inTime && !pastAtt.outTime) {
              const loc = pastAtt.location || 'Unknown';
              locationCounts[loc] = (locationCounts[loc] || 0) + 1;
           }
        } else {
           if (isCheckDateInPast) {
              totalAbsent++;
           } else if (isCheckDateToday && isCheckPast5PM) {
              totalAbsent++;
           }
        }
      }

      // Find if employee has attendance on the selected filter date
      const att = attendance.find(a => a.employeeId === emp.employeeId && a.date === filterDate);
      
      let status = 'Pending';
      let inTime = null;
      let outTime = null;
      let totalHours = '-';
      let id = null;
      let location = null;

      if (att) {
        id = att.id;
        inTime = att.inTime;
        outTime = att.outTime;
        totalHours = att.workingHours || '-';
        location = att.location || null;
        if (inTime && outTime) status = 'Present';
        else if (inTime && !outTime) status = 'Missing Out';
      } else {
        // No scan
        if (isFilterDateInPast) {
          status = 'Absent';
        } else if (isFilterDateToday) {
          if (isPast5PM) status = 'Absent';
          else status = 'Pending';
        } else {
          status = 'Pending'; // future date
        }
      }
      
      const locationSummary = Object.entries(locationCounts)
        .map(([loc, count]) => `${count} days ${loc}`)
        .join(', ');

      return {
        id,
        empId: emp.employeeId,
        name: emp.fullName,
        date: filterDate,
        inTime,
        outTime,
        status,
        totalHours,
        totalPresent,
        totalAbsent,
        location,
        locationSummary,
        auditTrail: []
      };
    });
  }, [records, filterDate]);

  const filteredRecords = computedDailyRecords.filter(rec => 
    rec.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    rec.empId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">Attendance Management</h1>
          <p className="text-firo-muted m-0 small">Review, track, and correct daily employee attendance records.</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="p-4 border-bottom bg-white d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="position-relative">
              <CalendarIcon size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-firo-muted" />
              <input 
                type="date" 
                className="form-control rounded-pill ps-5 bg-firo-bg border-0 fw-medium text-firo-dark" 
                value={filterDate}
                max={getLocalYMD()}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <div className="position-relative" style={{ width: '250px' }}>
              <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-firo-muted" />
              <input 
                type="text" 
                className="form-control rounded-pill ps-5 bg-firo-bg border-0" 
                placeholder="Search employees..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-light rounded-pill border d-flex align-items-center gap-2">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 px-4">Employee</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Check-In</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Check-Out</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Working Hrs</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Total Present</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Total Absent</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3" style={{ minWidth: '180px' }}>Locations (Month)</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Status</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {filteredRecords.map((rec) => (
                <tr key={rec.empId}>
                  <td className="px-4">
                    <div className="fw-bold text-firo-dark">{rec.name}</div>
                    <div className="small text-firo-muted">{rec.empId}</div>
                  </td>
                  <td>
                    <span className="fw-medium text-firo-dark">{rec.inTime || '--:--'}</span>
                  </td>
                  <td>
                    <span className="fw-medium text-firo-dark">{rec.outTime || '--:--'}</span>
                  </td>
                  <td>
                    <span className="fw-bold text-firo-primary">{rec.totalHours}</span>
                  </td>
                  <td>
                    <span className="fw-bold text-success">{rec.totalPresent}</span>
                  </td>
                  <td>
                    <span className="fw-bold text-danger">{rec.totalAbsent}</span>
                  </td>
                  <td>
                    <span className="small text-muted">{rec.locationSummary || 'None'}</span>
                    {rec.location && <div className="small fw-medium text-firo-dark mt-1">Today: {rec.location}</div>}
                  </td>
                  <td>
                    <span className={classNames('badge rounded-pill px-3 py-2 fw-medium', getStatusBadgeClass(rec.status))}>
                      {rec.status}
                    </span>
                    {rec.auditTrail.length > 0 && (
                      <span className="ms-2 text-warning" title="Manually Corrected">
                        <History size={14} />
                      </span>
                    )}
                  </td>
                  <td className="text-end px-4">
                    <button 
                      className="btn btn-sm btn-light text-firo-primary rounded-circle p-2" 
                      title="Correct Attendance"
                      onClick={() => handleEditClick(rec)}
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-firo-muted">
                    No attendance records found for {filterDate}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Correction Modal */}
      {showEditModal && editingRecord && createPortal(
        <>
          <div className="modal-backdrop fade show" style={{ position: 'fixed', inset: 0, zIndex: 1050, backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                <div className="modal-header border-bottom-0 pb-0 mt-2 mx-2">
                  <h5 className="modal-title fw-bold text-firo-dark fs-4">Attendance Correction</h5>
                  <button type="button" className="btn btn-link text-firo-muted p-0" onClick={closeEditModal}>
                    <X size={24} />
                  </button>
                </div>
                <div className="modal-body py-4 px-4">
                  <div className="mb-4 bg-primary-subtle rounded-3 p-3 text-primary">
                    <div className="fw-bold">{editingRecord.name} ({editingRecord.empId})</div>
                    <div className="small opacity-75">Date: {editingRecord.date}</div>
                  </div>

                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="row mb-3">
                      <div className="col-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Check-In Time</label>
                        <input 
                          type="time" 
                          className="form-control rounded-3 py-2 bg-firo-bg border-0" 
                          value={editForm.inTime} 
                          onChange={(e) => setEditForm({...editForm, inTime: e.target.value})} 
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Check-Out Time</label>
                        <input 
                          type="time" 
                          className="form-control rounded-3 py-2 bg-firo-bg border-0" 
                          value={editForm.outTime} 
                          onChange={(e) => setEditForm({...editForm, outTime: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-firo-muted small fw-semibold text-uppercase">Reason for Correction *</label>
                      <textarea 
                        className="form-control rounded-3 py-2 bg-firo-bg border-0" 
                        rows="3" 
                        placeholder="Required for audit trail..."
                        value={editForm.reason}
                        onChange={(e) => setEditForm({...editForm, reason: e.target.value})}
                      ></textarea>
                    </div>

                    {editingRecord.auditTrail.length > 0 && (
                      <div className="mt-4 pt-3 border-top">
                        <h6 className="fw-bold text-firo-dark small mb-3">Previous Corrections (Audit Trail)</h6>
                        <div className="d-flex flex-column gap-2">
                          {editingRecord.auditTrail.map((audit, idx) => (
                            <div key={idx} className="bg-firo-bg rounded-3 p-2 small">
                              <div className="fw-semibold text-firo-dark mb-1">{audit.modifiedBy} <span className="text-firo-muted fw-normal float-end">{audit.timestamp}</span></div>
                              <div className="text-firo-muted mb-1">
                                Changed from [{audit.oldIn || '--:--'} - {audit.oldOut || '--:--'}] to [{audit.newIn || '--:--'} - {audit.newOut || '--:--'}]
                              </div>
                              <div className="text-firo-dark fst-italic">"{audit.reason}"</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </form>
                </div>
                <div className="modal-footer border-top-0 pt-0 pb-4 px-4 d-flex gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4 flex-grow-1" onClick={closeEditModal}>Cancel</button>
                  <button type="button" className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 flex-grow-1" onClick={handleSaveCorrection}>Save Correction</button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default AttendanceManagement;
