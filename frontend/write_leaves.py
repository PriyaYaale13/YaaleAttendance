code = '''import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, Plus, Check, Search, Filter, BriefcaseMedical, Sun, Clock, AlertTriangle } from 'lucide-react';
import classNames from 'classnames';

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [formData, setFormData] = useState({
    empId: '',
    name: '',
    leaveType: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: '',
    supportingDocs: ''
  });

  const fetchRecords = async () => {
    try {
      const response = await fetch('http://localhost:8000/leaves/');
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleOpenModal = () => {
    setFormData({ empId: '', name: '', leaveType: 'Annual Leave', startDate: '', endDate: '', reason: '', supportingDocs: '' });
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'unset';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/leaves/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.empId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Mock leave balances for display purposes
  const leaveBalances = [
    { type: 'Annual Leave', total: 14, used: 4, remaining: 10, icon: Sun, color: 'text-warning', bg: 'bg-warning' },
    { type: 'Medical Leave', total: 14, used: 2, remaining: 12, icon: BriefcaseMedical, color: 'text-danger', bg: 'bg-danger' },
    { type: 'Emergency Leave', total: 5, used: 0, remaining: 5, icon: AlertTriangle, color: 'text-info', bg: 'bg-info' },
    { type: 'Unpaid Leave', total: 'Unlimited', used: 1, remaining: 'N/A', icon: Clock, color: 'text-secondary', bg: 'bg-secondary' }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">Leave Management</h1>
          <p className="text-firo-muted m-0 small">Manage employee leave requests, history, and balances.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 d-flex align-items-center fw-medium shadow-sm" onClick={handleOpenModal}>
            <Plus size={18} className="me-2" /> New Request
          </button>
        </div>
      </div>

      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button className={classNames('nav-link rounded-pill fw-medium px-4', { 'active bg-firo-primary': activeTab === 'requests', 'text-firo-muted': activeTab !== 'requests' })} onClick={() => setActiveTab('requests')}>Leave Requests</button>
        </li>
        <li className="nav-item">
          <button className={classNames('nav-link rounded-pill fw-medium px-4', { 'active bg-firo-primary': activeTab === 'balance', 'text-firo-muted': activeTab !== 'balance' })} onClick={() => setActiveTab('balance')}>Leave Balances</button>
        </li>
      </ul>

      {activeTab === 'requests' && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <div className="card-header bg-white border-bottom p-4">
            <div className="row g-3 align-items-center">
              <div className="col-lg-5">
                <div className="position-relative">
                  <Search className="position-absolute text-muted" size={18} style={{ top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
                  <input type="text" className="form-control rounded-pill ps-5 bg-firo-bg border-0" placeholder="Search employee..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="col-lg-7 d-flex justify-content-lg-end gap-2 overflow-auto">
                {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
                  <button 
                    key={status} 
                    className={classNames('btn rounded-pill px-4 fw-medium border', {
                      'bg-light text-firo-dark border-secondary': filterStatus === status,
                      'text-muted border-light': filterStatus !== status
                    })}
                    onClick={() => setFilterStatus(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold">Employee</th>
                  <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold">Leave Type</th>
                  <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold">Duration</th>
                  <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold">Reason</th>
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
                      <div className="fw-bold text-firo-dark">{rec.leaveType}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="d-flex align-items-center gap-2">
                        <CalendarIcon size={14} className="text-firo-muted" />
                        <span className="small text-firo-dark fw-medium">{rec.startDate} to {rec.endDate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="small text-firo-dark">{rec.reason}</span>
                      {rec.supportingDocs && <div className="small text-firo-primary mt-1 fw-medium cursor-pointer">View Document</div>}
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
                    <td colSpan="5" className="text-center py-5 text-firo-muted">No leave records found matching your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'balance' && (
        <div className="row g-4">
          {leaveBalances.map((bal, idx) => (
            <div key={idx} className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h6 className="text-muted fw-semibold mb-1 text-uppercase small">{bal.type}</h6>
                    <h2 className="fw-bold text-dark m-0">{bal.remaining}</h2>
                    <span className="small text-muted">Remaining</span>
                  </div>
                  <div className={classNames("p-3 rounded-circle bg-opacity-10", bal.bg, bal.color)}>
                    <bal.icon size={24} />
                  </div>
                </div>
                <div className="pt-3 border-top d-flex justify-content-between">
                  <span className="small text-muted fw-medium">Total: {bal.total}</span>
                  <span className="small fw-bold text-firo-dark">Used: {bal.used}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && createPortal(
        <>
          <div className="modal-backdrop fade show" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', transform: 'translateZ(0)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                <div className="modal-header border-bottom-0 pb-0 mt-2 mx-2">
                  <h5 className="modal-title fw-bold text-firo-dark fs-4">Submit Leave Request</h5>
                  <button type="button" className="btn-close shadow-none" onClick={closeModal}></button>
                </div>
                <div className="modal-body p-4">
                  <form onSubmit={handleSave} id="leaveForm">
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Emp ID</label>
                        <input type="text" className="form-control bg-firo-bg border-0 rounded-3" value={formData.empId} onChange={(e) => setFormData({...formData, empId: e.target.value})} required />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Employee Name</label>
                        <input type="text" className="form-control bg-firo-bg border-0 rounded-3" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                      </div>
                      <div className="col-12">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Leave Type</label>
                        <select className="form-select bg-firo-bg border-0 rounded-3" value={formData.leaveType} onChange={(e) => setFormData({...formData, leaveType: e.target.value})} required>
                          <option>Annual Leave</option>
                          <option>Medical Leave</option>
                          <option>Unpaid Leave</option>
                          <option>Emergency Leave</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Start Date</label>
                        <input type="date" className="form-control bg-firo-bg border-0 rounded-3" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} required />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">End Date</label>
                        <input type="date" className="form-control bg-firo-bg border-0 rounded-3" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} required />
                      </div>
                      <div className="col-12">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Reason</label>
                        <textarea className="form-control bg-firo-bg border-0 rounded-3" rows="2" placeholder="Brief reason for leave..." value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} required></textarea>
                      </div>
                      <div className="col-12">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Supporting Document (URL/Filename)</label>
                        <input type="text" className="form-control bg-firo-bg border-0 rounded-3" placeholder="Attach medical cert, etc. if required" value={formData.supportingDocs} onChange={(e) => setFormData({...formData, supportingDocs: e.target.value})} />
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer border-top-0 pt-0 pb-4 px-4 d-flex gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4 flex-grow-1" onClick={closeModal}>Cancel</button>
                  <button type="submit" form="leaveForm" className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 flex-grow-1">Submit Request</button>
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
                <h5 className="fw-bold text-dark mb-3">Leave Submitted!</h5>
                <p className="text-muted small mb-0">The leave request has been submitted for approval.</p>
              </div>
            </div>
          </div>
        </>, document.body
      )}
    </div>
  );
};

export default LeaveManagement;
'''
with open(r'd:\ATM-WMS\frontend\src\components\LeaveManagement\index.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
