import React, { useState } from 'react';
import { QrCode, Clock, CheckCircle } from 'lucide-react';
import classNames from 'classnames';

const QRAttendance = () => {
  const [empIdInput, setEmpIdInput] = useState('');
  
  // Attendance records state
  const [records, setRecords] = useState([
    {
      id: 'REC-01',
      empId: 'EMP-001',
      name: 'John Doe',
      date: new Date().toLocaleDateString(),
      inTime: '09:00 AM',
      outTime: null,
      workingHours: null
    }
  ]);

  const [scanMessage, setScanMessage] = useState(null);

  const simulateQRScan = (e) => {
    e.preventDefault();
    if (!empIdInput) return;

    const empId = empIdInput.trim().toUpperCase();
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Check if there is already a record for today
    const existingRecordIndex = records.findIndex(r => r.empId === empId && r.date === currentDate);

    if (existingRecordIndex >= 0) {
      const record = records[existingRecordIndex];
      if (record.outTime) {
        setScanMessage({ type: 'error', text: `${empId} has already checked out for today.` });
      } else {
        // Handle checkout
        const updatedRecords = [...records];
        
        // Mock working hours calculation
        const hours = (8 + Math.random() * 2).toFixed(2);

        updatedRecords[existingRecordIndex] = {
          ...record,
          outTime: currentTime,
          workingHours: `${hours} hrs`
        };
        setRecords(updatedRecords);
        setScanMessage({ type: 'success', text: `Check-out successful for ${empId} at ${currentTime}. Total hours: ${hours} hrs` });
      }
    } else {
      // Handle check-in
      const newRecord = {
        id: `REC-${Date.now()}`,
        empId,
        name: 'Scanned Employee', // Hardcoded for demo
        date: currentDate,
        inTime: currentTime,
        outTime: null,
        workingHours: null
      };
      setRecords([newRecord, ...records]);
      setScanMessage({ type: 'success', text: `Check-in successful for ${empId} at ${currentTime}` });
    }
    setEmpIdInput('');
    
    setTimeout(() => {
      setScanMessage(null);
    }, 5000);
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">QR Code Attendance</h1>
        <p className="text-firo-muted m-0 small">Record employee check-in and check-out via QR scan.</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
            <div className="p-4 bg-firo-primary text-white d-flex align-items-center gap-3">
              <QrCode size={24} />
              <h5 className="m-0 fw-bold">QR Scanner Prototype</h5>
            </div>
            <div className="p-4 p-md-5 d-flex flex-column justify-content-center align-items-center">
              <div className="mb-4 position-relative p-4 border border-2 border-primary rounded-4 bg-light d-flex align-items-center justify-content-center" style={{ width: '200px', height: '200px', borderStyle: 'dashed' }}>
                <QrCode size={100} className="text-primary opacity-50" />
              </div>
              
              <h5 className="fw-bold text-firo-dark mb-3">Simulate QR Scan</h5>
              <form onSubmit={simulateQRScan} className="w-100 text-center">
                <div className="input-group mb-3 shadow-sm rounded-pill overflow-hidden">
                  <input 
                    type="text" 
                    className="form-control border-0 py-3 px-4 bg-firo-bg" 
                    placeholder="Employee ID (e.g. EMP-002)" 
                    value={empIdInput}
                    onChange={(e) => setEmpIdInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary bg-firo-primary border-0 px-4 fw-medium">
                    Scan
                  </button>
                </div>
              </form>

              {scanMessage && (
                <div className={classNames('alert mt-3 w-100 border-0 rounded-3 py-2 text-center small fw-medium', {
                  'alert-success text-success bg-success bg-opacity-10': scanMessage.type === 'success',
                  'alert-danger text-danger bg-danger bg-opacity-10': scanMessage.type === 'error'
                })}>
                  {scanMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
            <div className="p-4 border-bottom bg-white d-flex align-items-center justify-content-between">
              <h5 className="m-0 fw-bold text-firo-dark d-flex align-items-center gap-2">
                <Clock size={20} className="text-firo-primary" /> Today's Attendance Logs
              </h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="text-firo-muted small text-uppercase fw-semibold py-3 px-4">Emp ID</th>
                    <th className="text-firo-muted small text-uppercase fw-semibold py-3">In-Time</th>
                    <th className="text-firo-muted small text-uppercase fw-semibold py-3">Out-Time</th>
                    <th className="text-firo-muted small text-uppercase fw-semibold py-3">Total Hours</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {records.map((rec) => (
                    <tr key={rec.id}>
                      <td className="px-4">
                        <div className="fw-bold text-firo-dark">{rec.empId}</div>
                        <div className="small text-firo-muted">{rec.name}</div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <CheckCircle size={14} className="text-success" />
                          <span className="fw-medium text-firo-dark">{rec.inTime}</span>
                        </div>
                      </td>
                      <td>
                        {rec.outTime ? (
                          <div className="d-flex align-items-center gap-2">
                            <CheckCircle size={14} className="text-danger" />
                            <span className="fw-medium text-firo-dark">{rec.outTime}</span>
                          </div>
                        ) : (
                          <span className="badge bg-light text-firo-muted rounded-pill px-3 fw-medium">Active</span>
                        )}
                      </td>
                      <td>
                        {rec.workingHours ? (
                          <span className="fw-bold text-firo-primary">{rec.workingHours}</span>
                        ) : (
                          <span className="text-firo-muted small">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-firo-muted">
                        No attendance logs for today.
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
  );
};

export default QRAttendance;
