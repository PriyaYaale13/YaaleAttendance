import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, Plus, X, Check, Search, Calendar as CalendarIcon, Filter } from 'lucide-react';
import classNames from 'classnames';

const EarlyDepartureManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [formData, setFormData] = useState({
    empId: '',
    name: '',
    departureTime: '',
    reason: 'Personal reason',
    supportingInfo: ''
  });

  const fetchRecords = async () => {
    try {
      const response = await fetch('http://localhost:8000/early-departures/');
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (err) {
      console.error('Error fetching early departures:', err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleOpenModal = () => {
    setFormData({ empId: '', name: '', departureTime: '', reason: 'Personal reason', supportingInfo: '' });
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'unset';
  };

  const handleEmpIdBlur = async () => {
    if (!formData.empId) return;
    try {
      const response = await fetch('http://localhost:8000/employees/');
      if (response.ok) {
        const employees = await response.json();
        const emp = employees.find(e => e.employeeId === formData.empId);
        if (emp) {
          setFormData(prev => ({ ...prev, name: emp.fullName }));
        }
      }
    } catch (err) {
      console.error('Error fetching employee name', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        date: new Date().toISOString().split('T')[0],
      };
      const response = await fetch('http://localhost:8000/early-departures/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        await fetchRecords();
        closeModal();
        setShowSuccessModal(true);
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
          setShowSuccessModal(false);
          document.body.style.overflow = 'unset';
        }, 2000);
      }
    } catch (err) {
      console.error('Error saving record:', err);
    }
  };

  const filteredRecords = records.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.empId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">Early Departure Management</h1>
          <p className="text-firo-muted m-0 small">Manage and track early check-outs from scheduled shifts.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 d-flex align-items-center fw-medium shadow-sm" onClick={handleOpenModal}>
            <Plus size={18} className="me-2" /> New Request
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="card-header bg-white border-bottom p-4">
          <div className="d-flex gap-3 align-items-center">
            <div className="position-relative flex-grow-1" style={{ maxWidth: '300px' }}>
              <Search className="position-absolute text-muted" size={18} style={{ top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                className="form-control rounded-pill ps-5 bg-firo-bg border-0" 
                placeholder="Search employee..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-light rounded-pill px-3 d-flex align-items-center text-firo-dark border">
              <Filter size={16} className="me-2" /> Filter
            </button>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold">Employee</th>
                <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold">Date & Time</th>
                <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold">Reason</th>
                <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold">Supporting Info</th>
                <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold text-end">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((rec) => (
                <tr key={rec.id}>
                  <td className="px-4 py-3">
                    <div className="fw-bold text-firo-dark">{rec.name}</div>
                    <div className="small text-firo-muted">{rec.empId}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="d-flex align-items-center gap-2">
                      <CalendarIcon size={14} className="text-firo-muted" />
                      <span className="small text-firo-dark fw-medium">{rec.date}</span>
                    </div>
                    <div className="small text-firo-primary fw-bold">{rec.departureTime}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge bg-light text-dark border px-2 py-1">{rec.reason}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="small text-firo-muted">{rec.supportingInfo || '-'}</span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <span className={classNames('badge rounded-pill px-3 py-2 fw-medium', {
                      'bg-warning bg-opacity-10 text-warning': rec.status === 'Pending',
                      'bg-success bg-opacity-10 text-success': rec.status === 'Approved',
                      'bg-danger bg-opacity-10 text-danger': rec.status === 'Rejected'
                    })}>{rec.status}</span>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-firo-muted">No early departure records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && createPortal(
        <>
          <div className="modal-backdrop fade show" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', transform: 'translateZ(0)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                <div className="modal-header border-bottom-0 pb-0 mt-2 mx-2">
                  <h5 className="modal-title fw-bold text-firo-dark fs-4">Log Early Departure</h5>
                  <button type="button" className="btn-close shadow-none" onClick={closeModal}></button>
                </div>
                <div className="modal-body p-4">
                  <form onSubmit={handleSave} id="departureForm">
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Emp ID</label>
                        <input type="text" className="form-control bg-firo-bg border-0 rounded-3" value={formData.empId} onChange={(e) => setFormData({...formData, empId: e.target.value})} onBlur={handleEmpIdBlur} required />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Employee Name</label>
                        <input type="text" className="form-control bg-firo-bg border-0 rounded-3" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                      </div>
                      <div className="col-12">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Expected/Actual Departure Time</label>
                        <input type="time" className="form-control bg-firo-bg border-0 rounded-3" value={formData.departureTime} onChange={(e) => setFormData({...formData, departureTime: e.target.value})} required />
                      </div>
                      <div className="col-12">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Reason</label>
                        <select className="form-select bg-firo-bg border-0 rounded-3" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} required>
                          <option>Personal reason</option>
                          <option>Medical reason</option>
                          <option>Emergency</option>
                          <option>Official work</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Supporting Information (Optional)</label>
                        <textarea className="form-control bg-firo-bg border-0 rounded-3" rows="3" placeholder="Provide additional details if required..." value={formData.supportingInfo} onChange={(e) => setFormData({...formData, supportingInfo: e.target.value})}></textarea>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer border-top-0 pt-0 pb-4 px-4 d-flex gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4 flex-grow-1" onClick={closeModal}>Cancel</button>
                  <button type="submit" form="departureForm" className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 flex-grow-1">Submit Request</button>
                </div>
              </div>
            </div>
          </div>
        </>, document.body
      )}

      {showSuccessModal && createPortal(
        <>
          <div className="modal-backdrop fade show" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', transform: 'translateZ(0)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered modal-sm" style={{ maxWidth: '350px' }}>
              <div className="modal-content rounded-4 border-0 shadow-lg p-4 text-center">
                <div className="mb-3">
                  <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex p-3">
                    <Check size={24} />
                  </div>
                </div>
                <h5 className="fw-bold text-dark mb-3">Saved!</h5>
                <p className="text-muted small mb-0">The early departure request has been recorded.</p>
              </div>
            </div>
          </div>
        </>, document.body
      )}
    </div>
  );
};

export default EarlyDepartureManagement;
