import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ListChecks, Search, Eye, CheckCircle, XCircle, ArrowLeftCircle, MessageSquare, History, X } from 'lucide-react';
import classNames from 'classnames';

const ApprovalWorkflow = () => {
  const [activeRole, setActiveRole] = useState('Supervisor'); // Roles: Supervisor, Superadmin, Payroll
  const [searchTerm, setSearchTerm] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve', 'reject', 'return'
  const [remarks, setRemarks] = useState('');
  
  const [workflows, setWorkflows] = useState([]);

  const fetchRecords = async () => {
    try {
      const [otRes, leavesRes, earlyRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/overtime/`),
        fetch(`${import.meta.env.VITE_API_URL}/leaves/`),
        fetch(`${import.meta.env.VITE_API_URL}/early-departures/`)
      ]);

      const otData = otRes.ok ? await otRes.json() : [];
      const leavesData = leavesRes.ok ? await leavesRes.json() : [];
      const earlyData = earlyRes.ok ? await earlyRes.json() : [];

      const mappedOT = otData.map(rec => {
        let stage = 'Supervisor';
        let wfStatus = 'Pending';
        if (rec.status === 'Pending Supervisor') { stage = 'Supervisor'; wfStatus = 'Pending'; }
        else if (rec.status === 'Pending Admin' || rec.status === 'Pending Submission') { stage = 'Superadmin'; wfStatus = 'Pending'; }
        else if (rec.status === 'Approved') { stage = 'Payroll'; wfStatus = 'Approved'; }
        else if (rec.status === 'Paid') { stage = 'Completed'; wfStatus = 'Paid'; }
        else if (rec.status === 'Rejected') { stage = 'Closed'; wfStatus = 'Rejected'; }
        else { stage = 'Superadmin'; wfStatus = rec.status; }
        
        return {
          id: rec.id,
          reportId: `OT-${rec.id}`,
          type: 'overtime',
          empName: rec.name,
          period: rec.date,
          details: `${rec.submittedOtHours || 0} hrs`,
          totalAmount: `$${(parseFloat(rec.submittedOtHours || 0) * 20).toFixed(2)}`,
          currentStage: stage,
          status: wfStatus,
          originalRecord: rec,
          history: []
        };
      });

      const mappedLeaves = leavesData.map(rec => {
        let stage = 'Supervisor';
        let wfStatus = 'Pending';
        if (rec.status === 'Pending') { stage = 'Supervisor'; wfStatus = 'Pending'; }
        else if (rec.status === 'Approved') { stage = 'Completed'; wfStatus = 'Approved'; }
        else if (rec.status === 'Rejected') { stage = 'Closed'; wfStatus = 'Rejected'; }
        else { stage = 'Superadmin'; wfStatus = rec.status; }

        return {
          id: rec.id,
          reportId: `LV-${rec.id}`,
          type: 'leave',
          empName: rec.name,
          period: `${rec.startDate} to ${rec.endDate}`,
          details: rec.leaveType,
          totalAmount: '-',
          currentStage: stage,
          status: wfStatus,
          originalRecord: rec,
          history: []
        };
      });

      const mappedEarly = earlyData.map(rec => {
        let stage = 'Supervisor';
        let wfStatus = 'Pending';
        if (rec.status === 'Pending') { stage = 'Supervisor'; wfStatus = 'Pending'; }
        else if (rec.status === 'Approved') { stage = 'Completed'; wfStatus = 'Approved'; }
        else if (rec.status === 'Rejected') { stage = 'Closed'; wfStatus = 'Rejected'; }
        else { stage = 'Superadmin'; wfStatus = rec.status; }

        return {
          id: rec.id,
          reportId: `ED-${rec.id}`,
          type: 'early_departure',
          empName: rec.name,
          period: rec.date,
          details: rec.departureTime,
          totalAmount: '-',
          currentStage: stage,
          status: wfStatus,
          originalRecord: rec,
          history: []
        };
      });

      setWorkflows([...mappedOT, ...mappedLeaves, ...mappedEarly]);
    } catch (err) {
      console.error('Error fetching workflows:', err);
    }
  };

    useEffect(() => {
    fetchRecords();
  }, []);

  const handleActionClick = (report, type) => {
    setSelectedReport(report);
    setActionType(type);
    setRemarks('');
    setShowActionModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setSelectedReport(null);
    document.body.style.overflow = 'unset';
  };

  const submitAction = async () => {
    let newDbStatus = selectedReport.originalRecord.status;
    let url = '';
    let payload = { ...selectedReport.originalRecord };
    
      if (selectedReport.type === 'overtime') {
      url = `${import.meta.env.VITE_API_URL}/overtime/${selectedReport.id}`;
      let adminApprovedOt = selectedReport.originalRecord.adminApprovedOt;
      let supervisorReviewedOt = selectedReport.originalRecord.supervisorReviewedOt;
      let paidOtHours = selectedReport.originalRecord.paidOtHours;
      
      if (actionType === 'approve') {
        if (activeRole === 'Supervisor') {
          newDbStatus = 'Pending Admin';
          supervisorReviewedOt = selectedReport.originalRecord.submittedOtHours;
        } else if (activeRole === 'Superadmin') {
          newDbStatus = 'Approved';
          adminApprovedOt = selectedReport.originalRecord.submittedOtHours;
        } else if (activeRole === 'Payroll') {
          newDbStatus = 'Paid';
          paidOtHours = adminApprovedOt;
        }
      } else if (actionType === 'return' || actionType === 'reject') {
        newDbStatus = 'Rejected';
      }
      payload.status = newDbStatus;
      payload.supervisorReviewedOt = supervisorReviewedOt;
      payload.adminApprovedOt = adminApprovedOt;
      payload.paidOtHours = paidOtHours;

    } else if (selectedReport.type === 'leave') {
      url = `${import.meta.env.VITE_API_URL}/leaves/${selectedReport.id}`;
      if (actionType === 'approve') newDbStatus = 'Approved';
      else newDbStatus = 'Rejected';
      payload.status = newDbStatus;

    } else if (selectedReport.type === 'early_departure') {
      url = `${import.meta.env.VITE_API_URL}/early-departures/${selectedReport.id}`;
      if (actionType === 'approve') newDbStatus = 'Approved';
      else newDbStatus = 'Rejected';
      payload.status = newDbStatus;
    }

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchRecords();
        closeActionModal();
      } else {
        console.error('Error updating status');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const filteredWorkflows = workflows.filter(wf =>
    (wf.empName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (wf.reportId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

    return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">Approval Workflow</h1>
          <p className="text-firo-muted m-0 small">Manage sequential approvals for attendance and overtime.</p>
        </div>
        <div className="d-flex align-items-center gap-2 bg-white rounded-pill px-3 py-2 shadow-sm border">
          <span className="text-muted small fw-medium">Role:</span>
          <select 
            className="form-select form-select-sm border-0 shadow-none fw-bold text-firo-primary bg-transparent py-0 pe-4" 
            style={{ width: 'auto', cursor: 'pointer' }}
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value)}
          >
            <option>Supervisor</option>
            <option>Superadmin</option>
            <option>Payroll</option>
          </select>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="card-header bg-white border-bottom p-4">
          <div className="position-relative" style={{ maxWidth: '300px' }}>
            <Search className="position-absolute text-muted" size={18} style={{ top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-control rounded-pill ps-5 bg-firo-bg border-0" 
              placeholder="Search reports..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold">Report ID</th>
                <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold">Employee</th>
                <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold">Period / Date</th>
                <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold">Details / Amount</th>
                <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold">Current Stage</th>
                <th className="px-4 py-3 text-uppercase text-firo-muted small fw-semibold text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkflows.map((wf) => (
                <tr key={wf.id}>
                  <td className="px-4 py-3 fw-bold text-firo-primary">{wf.reportId}</td>
                  <td className="px-4 py-3 fw-bold text-firo-dark">{wf.empName}</td>
                  <td className="px-4 py-3 text-firo-muted small fw-medium">{wf.period}</td>
                  <td className="px-4 py-3">
                    <div className="fw-bold text-firo-dark">{wf.details}</div>
                    <div className="small text-success fw-bold">{wf.totalAmount}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={classNames('badge rounded-pill px-3 py-2 fw-medium border', {
                      'bg-warning bg-opacity-10 text-warning border-warning': wf.currentStage === activeRole,
                      'bg-light text-muted': wf.currentStage !== activeRole && wf.status === 'Pending',
                      'bg-success bg-opacity-10 text-success border-success': wf.status === 'Approved' || wf.status === 'Paid',
                      'bg-danger bg-opacity-10 text-danger border-danger': wf.status === 'Rejected'
                    })}>
                      {wf.status === 'Pending' ? `Pending ${wf.currentStage}` : wf.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    {wf.currentStage === activeRole && wf.status === 'Pending' ? (
                      <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-sm btn-success rounded-circle p-2 text-white shadow-sm" onClick={() => handleActionClick(wf, 'approve')} title="Approve">
                          <CheckCircle size={16} />
                        </button>
                        <button className="btn btn-sm btn-warning rounded-circle p-2 text-white shadow-sm" onClick={() => handleActionClick(wf, 'return')} title="Return for Correction">
                          <ArrowLeftCircle size={16} />
                        </button>
                        <button className="btn btn-sm btn-danger rounded-circle p-2 text-white shadow-sm" onClick={() => handleActionClick(wf, 'reject')} title="Reject">
                          <XCircle size={16} />
                        </button>
                      </div>
                    ) : (
                      <button className="btn btn-sm btn-light text-firo-primary rounded-pill px-3" onClick={() => handleActionClick(wf, 'view')} title="View Details">
                        <Eye size={16} className="me-1" /> View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showActionModal && createPortal(
        <>
          <div className="modal-backdrop fade show" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                <div className="modal-header border-bottom-0 pb-0 mt-2 mx-2">
                  <h5 className="modal-title fw-bold text-firo-dark fs-4">
                    {actionType === 'approve' && 'Confirm Approval'}
                    {actionType === 'return' && 'Return for Correction'}
                    {actionType === 'reject' && 'Reject Report'}
                    {actionType === 'view' && 'Report Details'}
                  </h5>
                  <button type="button" className="btn-close shadow-none" onClick={closeActionModal}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="bg-firo-bg rounded-3 p-3 mb-4">
                    <div className="row g-2 text-firo-dark small">
                      <div className="col-6"><span className="text-firo-muted">Report ID:</span> <span className="fw-bold">{selectedReport?.reportId}</span></div>
                      <div className="col-6"><span className="text-firo-muted">Employee:</span> <span className="fw-bold">{selectedReport?.empName}</span></div>
                      <div className="col-6"><span className="text-firo-muted">Details:</span> <span className="fw-bold">{selectedReport?.details}</span></div>
                      <div className="col-6"><span className="text-firo-muted">Amount:</span> <span className="fw-bold text-success">{selectedReport?.totalAmount}</span></div>
                    </div>
                  </div>

                  {actionType !== 'view' && (
                    <div className="mb-3">
                      <label className="form-label text-firo-muted fw-semibold small text-uppercase">Remarks (Optional)</label>
                      <textarea 
                        className="form-control bg-light border-0 rounded-3" 
                        rows="3" 
                        placeholder="Add comments for the audit log..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      ></textarea>
                    </div>
                  )}

                  {selectedReport?.history?.length > 0 && (
                    <div>
                      <h6 className="fw-bold text-firo-dark mb-3"><History size={16} className="me-2" />Approval History</h6>
                      <div className="d-flex flex-column gap-3 border-start border-2 border-firo-primary ms-2 ps-3 py-1">
                        {selectedReport.history.map((h, i) => (
                          <div key={i}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="fw-bold text-firo-dark small">{h.actor}</span>
                              <span className="text-muted small" style={{fontSize: '0.75rem'}}>{h.timestamp}</span>
                            </div>
                            <div className="small text-firo-primary fw-medium mb-1">{h.action}</div>
                            {h.remarks && <div className="text-muted small fst-italic">"{h.remarks}"</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {actionType !== 'view' && (
                  <div className="modal-footer border-top-0 pt-0 pb-4 px-4 d-flex gap-2">
                    <button type="button" className="btn btn-light rounded-pill px-4 flex-grow-1" onClick={closeActionModal}>Cancel</button>
                    <button type="button" className={classNames('btn border-0 rounded-pill px-4 flex-grow-1 text-white', {
                      'bg-success': actionType === 'approve',
                      'bg-warning': actionType === 'return',
                      'bg-danger': actionType === 'reject'
                    })} onClick={submitAction}>
                      Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>, document.body
      )}
    </div>
  );
};

export default ApprovalWorkflow;
