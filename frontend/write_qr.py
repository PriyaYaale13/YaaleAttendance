code = '''import React, { useState, useEffect } from 'react';
import { QrCode, Clock, X, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { QRCodeSVG } from 'qrcode.react';

const QRAttendance = () => {
  const [empIdInput, setEmpIdInput] = useState('');
  const [records, setRecords] = useState([]);
  const [scanMessage, setScanMessage] = useState(null);
  
  // Early Departure State
  const [showEarlyModal, setShowEarlyModal] = useState(false);
  const [earlyData, setEarlyData] = useState(null);
  const [earlyReason, setEarlyReason] = useState('Personal reason');
  const [earlyInfo, setEarlyInfo] = useState('');

  const fetchAttendance = async () => {
    try {
      const response = await fetch('http://localhost:8000/attendance/');
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 30000);
    return () => clearInterval(interval);
  }, []);

  const simulateQRScan = async (e) => {
    e.preventDefault();
    if (!empIdInput) return;
    const empId = empIdInput.trim();
    try {
      const response = await fetch('http://localhost:8000/attendance/scan/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId }),
      });
      if (response.ok) {
        const data = await response.json();
        fetchAttendance();
        
        if (data.outTime) {
          // Parse time like '02:30 PM' or '17:30'
          let outH = 0;
          if (data.outTime.includes('AM') || data.outTime.includes('PM')) {
            const parts = data.outTime.split(' ');
            outH = parseInt(parts[0].split(':')[0]);
            if (parts[1] === 'PM' && outH !== 12) outH += 12;
            if (parts[1] === 'AM' && outH === 12) outH = 0;
          } else {
            outH = parseInt(data.outTime.split(':')[0]);
          }
          
          if (outH < 17) {
            setEarlyData(data);
            setShowEarlyModal(true);
            setEmpIdInput('');
            return;
          }
        }
        
        setScanMessage({ type: 'success', text: Success!  attendance recorded. });
      } else {
        const errorData = await response.json();
        setScanMessage({ type: 'error', text: errorData.detail || 'Error scanning QR' });
      }
    } catch (error) {
      console.error('Error scanning QR:', error);
      setScanMessage({ type: 'error', text: 'Error connecting to the server.' });
    }
    setEmpIdInput('');
    setTimeout(() => setScanMessage(null), 5000);
  };

  const handleEarlyDepartureSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        empId: earlyData.employeeId,
        name: earlyData.name,
        date: new Date().toISOString().split('T')[0],
        departureTime: earlyData.outTime,
        reason: earlyReason,
        supportingInfo: earlyInfo,
        status: 'Pending'
      };
      const response = await fetch('http://localhost:8000/early-departures/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setShowEarlyModal(false);
        setEarlyData(null);
        setEarlyReason('Personal reason');
        setEarlyInfo('');
        setScanMessage({ type: 'success', text: Early departure logged for . });
        setTimeout(() => setScanMessage(null), 5000);
      }
    } catch (err) {
      console.error('Error saving early departure:', err);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">QR Code Attendance</h1>
          <p className="text-firo-muted m-0 small">Scan QR code to mark your entry and exit time.</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <div className="card border-0 rounded-4 shadow-sm h-100">
            <div className="card-body p-4 d-flex flex-column align-items-center justify-content-center text-center">
              <div className="bg-light p-3 rounded-4 mb-3 d-inline-block">
                <QRCodeSVG value="ATM_ATTENDANCE_KIOSK_URL" size={200} fgColor="#374151" />
              </div>
              <h5 className="fw-bold text-firo-dark mb-1">Common Scan Station</h5>
              <p className="text-firo-muted small mb-4">Please hold your employee ID card QR code in front of the scanner.</p>
              
              <form onSubmit={simulateQRScan} className="w-100">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <QrCode size={18} className="text-firo-muted" />
                  </span>
                  <input 
                    type="text" 
                    className="form-control border-start-0 ps-0 bg-light py-2" 
                    placeholder="Scan ID or enter manually..." 
                    value={empIdInput}
                    onChange={(e) => setEmpIdInput(e.target.value)}
                    autoFocus
                  />
                  <button type="submit" className="btn btn-primary bg-firo-primary px-3">Record</button>
                </div>
              </form>
              
              {scanMessage && (
                <div className={classNames('mt-3 p-2 rounded-3 small w-100 fw-medium', {
                  'bg-success bg-opacity-10 text-success': scanMessage.type === 'success',
                  'bg-danger bg-opacity-10 text-danger': scanMessage.type === 'error'
                })}>
                  {scanMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 rounded-4 shadow-sm h-100">
            <div className="card-body p-0">
              <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
                <h5 className="fw-bold text-firo-dark m-0">Today's Attendance Logs</h5>
                <span className="badge bg-light text-firo-muted rounded-pill px-3 py-2 fw-medium">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>
              
              <div className="table-responsive" style={{ maxHeight: '400px' }}>
                <table className="table table-hover align-middle m-0">
                  <thead className="bg-light sticky-top">
                    <tr>
                      <th className="text-firo-muted small text-uppercase fw-semibold py-3 px-4">Employee</th>
                      <th className="text-firo-muted small text-uppercase fw-semibold py-3 px-4">In Time</th>
                      <th className="text-firo-muted small text-uppercase fw-semibold py-3 px-4">Out Time</th>
                      <th className="text-firo-muted small text-uppercase fw-semibold py-3 px-4">Status</th>
                      <th className="text-firo-muted small text-uppercase fw-semibold py-3 text-end px-4">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                    {records.map((record) => (
                      <tr key={record.id}>
                        <td className="px-4 py-3">
                          <div className="fw-medium text-firo-dark">{record.name}</div>
                          <div className="small text-firo-muted">{record.employeeId}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-2">
                            <Clock size={14} className="text-success" />
                            <span className="fw-medium text-firo-dark">{record.inTime}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {record.outTime ? (
                            <div className="d-flex align-items-center gap-2">
                              <Clock size={14} className="text-secondary" />
                              <span className="fw-medium text-firo-dark">{record.outTime}</span>
                            </div>
                          ) : (
                            <span className="text-firo-muted small">--:--</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={classNames('badge rounded-pill px-3 py-1 fw-medium', {
                            'bg-success bg-opacity-10 text-success': !record.outTime,
                            'bg-secondary bg-opacity-10 text-secondary': record.outTime
                          })}>
                            {record.outTime ? 'Checked Out' : 'Active'}
                          </span>
                        </td>
                        <td className="text-end px-4 py-3 fw-medium text-firo-dark">
                          {record.workingHours || '--'}
                        </td>
                      </tr>
                    ))}
                    {records.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-firo-muted">
                          No attendance records for today yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEarlyModal && createPortal(
        <>
          <div className="modal-backdrop fade show" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 9999 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                <div className="modal-header border-bottom-0 pb-0 mt-2 mx-2">
                  <h5 className="modal-title fw-bold text-firo-dark fs-4">Early Departure Detected</h5>
                  <button type="button" className="btn-close shadow-none" onClick={() => setShowEarlyModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="alert alert-warning border-0 rounded-3 small">
                    <strong>{earlyData?.name}</strong> checked out at <strong>{earlyData?.outTime}</strong>, which is before the scheduled 5:00 PM shift end. Please provide a reason.
                  </div>
                  <form onSubmit={handleEarlyDepartureSubmit} id="earlyForm">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Reason</label>
                        <select className="form-select bg-firo-bg border-0 rounded-3" value={earlyReason} onChange={(e) => setEarlyReason(e.target.value)} required>
                          <option>Personal reason</option>
                          <option>Medical reason</option>
                          <option>Emergency</option>
                          <option>Official work</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label text-firo-muted small fw-semibold text-uppercase">Supporting Information (Optional)</label>
                        <textarea className="form-control bg-firo-bg border-0 rounded-3" rows="3" placeholder="Provide additional details if required..." value={earlyInfo} onChange={(e) => setEarlyInfo(e.target.value)}></textarea>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer border-top-0 pt-0 pb-4 px-4 d-flex gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4 flex-grow-1" onClick={() => setShowEarlyModal(false)}>Skip</button>
                  <button type="submit" form="earlyForm" className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 flex-grow-1">Log Early Departure</button>
                </div>
              </div>
            </div>
          </div>
        </>, document.body
      )}
    </div>
  );
};

export default QRAttendance;
'''
with open(r'd:\ATM-WMS\frontend\src\components\QRAttendance\index.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
