import re

filepath = r'd:\ATM-WMS\frontend\src\components\QRAttendance\index.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# I will rewrite the return statement to restructure the UI completely.
new_ui = """
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">QR Code Attendance</h1>
          <p className="text-firo-muted m-0 small">Scan QR code to mark your entry and exit time.</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card border-0 rounded-4 shadow-sm h-100">
            <div className="card-body p-4 d-flex flex-column align-items-center justify-content-center text-center">
              <h5 className="fw-bold text-firo-dark mb-1">Common Scan Station</h5>
              <p className="text-firo-muted small mb-4">Please hold your employee ID card QR code in front of the scanner.</p>
              
              <div className="bg-light p-3 rounded-4 d-inline-block mb-4">
                <QRCodeSVG value="ATM_ATTENDANCE_KIOSK_URL" size={200} fgColor="#374151" />
              </div>
              
              <form onSubmit={simulateQRScan} className="w-100 mb-2" style={{ maxWidth: '500px' }}>
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
                <div className={classNames('mt-2 p-2 rounded-3 small fw-medium', {
                  'bg-success bg-opacity-10 text-success': scanMessage.type === 'success',
                  'bg-danger bg-opacity-10 text-danger': scanMessage.type === 'error'
                })} style={{ maxWidth: '500px', width: '100%' }}>
                  {scanMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12">
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
"""

# Find where the return statement starts
start_idx = content.find('  return (')
# Find where the early modal starts, we want to keep it
modal_idx = content.find('{showEarlyModal && createPortal(')

if start_idx != -1 and modal_idx != -1:
    new_content = content[:start_idx] + new_ui + "\n      " + content[modal_idx:]
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
else:
    print("Could not find insertion points")
