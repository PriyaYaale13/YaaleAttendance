import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Timer, Search, ClockAlert, Edit, Check } from 'lucide-react';
import classNames from 'classnames';

const OvertimeManagement = () => {
  const [activeTab, setActiveTab] = useState('records');
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState([]);
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  const [reviewForm, setReviewForm] = useState({
    submittedOtHours: '',
    supervisorReviewedOt: '',
    adminApprovedOt: '',
    paidOtHours: '',
    status: ''
  });

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

  useEffect(() => {
    // First sync OT from attendance, then fetch
    const init = async () => {
      try {
        await fetch('http://localhost:8000/overtime/sync-from-attendance');
      } catch (err) {
        console.warn('Sync skipped:', err);
      }
      fetchRecords();
    };
    init();
  }, []);

  const handleReviewClick = (record) => {
    setSelectedRecord(record);
    setReviewForm({
      submittedOtHours: record.submittedOtHours || '',
      supervisorReviewedOt: record.supervisorReviewedOt || '',
      adminApprovedOt: record.adminApprovedOt || '',
      paidOtHours: record.paidOtHours || '',
      status: record.status || 'Pending Submission'
    });
    setShowReviewModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    document.body.style.overflow = 'unset';
    setSelectedRecord(null);
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    try {
      const adminApproved = parseFloat(reviewForm.adminApprovedOt || 0);
      const paidOt = parseFloat(reviewForm.paidOtHours || 0);
      const balance = Math.max(0, adminApproved - paidOt).toString();
      
      const payload = {
        empId: selectedRecord.empId,
        name: selectedRecord.name,
        date: selectedRecord.date,
        actualWorkingHours: selectedRecord.actualWorkingHours,
        potentialOtHours: selectedRecord.potentialOtHours,
        submittedOtHours: reviewForm.submittedOtHours,
        supervisorReviewedOt: reviewForm.supervisorReviewedOt,
        adminApprovedOt: reviewForm.adminApprovedOt,
        paidOtHours: reviewForm.paidOtHours,
        outstandingOtBalance: balance,
        status: reviewForm.status
      };

      const response = await fetch(`http://localhost:8000/overtime/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        await fetchRecords();
        closeReviewModal();
      }
    } catch (err) {
      console.error('Error updating overtime record:', err);
    }
  };

  const filteredRecords = records.filter(rec => 
    rec.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    rec.empId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">Overtime Management</h1>
          <p className="text-firo-muted m-0 small">Verify, review, and approve employee overtime requests.</p>
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
                placeholder="Search employee or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold">Employee</th>
                <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold">Date</th>
                <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold text-center">Actual/Pot. OT</th>
                <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold text-center">Submitted OT</th>
                <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold text-center">Approved/Paid</th>
                <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold text-center">Balance</th>
                <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold">Status</th>
                <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((rec) => (
                <tr key={rec.id}>
                  <td className="px-4 py-3">
                    <div className="fw-bold text-firo-dark">{rec.name}</div>
                    <div className="small text-firo-muted">{rec.empId}</div>
                  </td>
                  <td className="px-4 py-3 text-firo-dark fw-medium">{rec.date}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="fw-bold text-firo-dark">{rec.actualWorkingHours || '0'} hrs</div>
                    <div className="small text-firo-primary">Pot: {rec.potentialOtHours || '0'} hrs</div>
                  </td>
                  <td className="px-4 py-3 text-center fw-bold text-warning">{rec.submittedOtHours || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="fw-bold text-success">{rec.adminApprovedOt || '0'} hrs</div>
                    <div className="small text-firo-muted">Paid: {rec.paidOtHours || '0'} hrs</div>
                  </td>
                  <td className="px-4 py-3 text-center fw-bold text-danger">{rec.outstandingOtBalance || '0'} hrs</td>
                  <td className="px-4 py-3">
                    <span className={classNames('badge rounded-pill px-3 py-2 fw-medium', {
                      'bg-success bg-opacity-10 text-success': rec.status === 'Approved' || rec.status === 'Paid',
                      'bg-warning bg-opacity-10 text-warning': rec.status.includes('Pending'),
                      'bg-danger bg-opacity-10 text-danger': rec.status === 'Rejected'
                    })}>{rec.status}</span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button className="btn btn-sm btn-light text-firo-primary rounded-circle p-2" onClick={() => handleReviewClick(rec)}>
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showReviewModal && selectedRecord && createPortal(
        <>
          <div className="modal-backdrop fade show" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)', transform: 'translateZ(0)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                <div className="modal-header border-bottom-0 pb-0 mt-2 mx-2">
                  <h5 className="modal-title fw-bold text-firo-dark fs-4">Review Overtime</h5>
                  <button type="button" className="btn-close shadow-none" onClick={closeReviewModal}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="bg-light rounded p-3 mb-4 d-flex justify-content-between">
                    <div>
                      <div className="small text-muted text-uppercase fw-bold">Actual Hours</div>
                      <div className="fw-bold text-dark fs-5">{selectedRecord.actualWorkingHours || '0'} hrs</div>
                    </div>
                    <div>
                      <div className="small text-muted text-uppercase fw-bold">Potential OT</div>
                      <div className="fw-bold text-firo-primary fs-5">{selectedRecord.potentialOtHours || '0'} hrs</div>
                    </div>
                  </div>
                  <form onSubmit={handleSaveReview} id="otReviewForm">
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Submitted OT Hours</label>
                        <input type="number" step="0.1" className="form-control bg-firo-bg border-0 rounded-3" value={reviewForm.submittedOtHours} onChange={(e) => setReviewForm({...reviewForm, submittedOtHours: e.target.value})} />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Supervisor Reviewed OT</label>
                        <input type="number" step="0.1" className="form-control bg-firo-bg border-0 rounded-3" value={reviewForm.supervisorReviewedOt} onChange={(e) => setReviewForm({...reviewForm, supervisorReviewedOt: e.target.value})} />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Admin Approved OT</label>
                        <input type="number" step="0.1" className="form-control bg-firo-bg border-0 rounded-3" value={reviewForm.adminApprovedOt} onChange={(e) => setReviewForm({...reviewForm, adminApprovedOt: e.target.value})} />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Paid OT Hours</label>
                        <input type="number" step="0.1" className="form-control bg-firo-bg border-0 rounded-3" value={reviewForm.paidOtHours} onChange={(e) => setReviewForm({...reviewForm, paidOtHours: e.target.value})} />
                      </div>
                      <div className="col-12">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">OT Status</label>
                        <select className="form-select bg-firo-bg border-0 rounded-3" value={reviewForm.status} onChange={(e) => setReviewForm({...reviewForm, status: e.target.value})}>
                          <option>Pending Submission</option>
                          <option>Pending Supervisor</option>
                          <option>Pending Admin</option>
                          <option>Approved</option>
                          <option>Paid</option>
                          <option>Rejected</option>
                        </select>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer border-top-0 pt-0 pb-4 px-4 d-flex gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4 flex-grow-1" onClick={closeReviewModal}>Cancel</button>
                  <button type="submit" form="otReviewForm" className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 flex-grow-1">Save Updates</button>
                </div>
              </div>
            </div>
          </div>
        </>, document.body
      )}
    </div>
  );
};

export default OvertimeManagement;
