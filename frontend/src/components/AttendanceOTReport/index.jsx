import React, { useState } from 'react';
import { FileSpreadsheet, Search, Filter, Download, CheckCircle, FileText } from 'lucide-react';
import classNames from 'classnames';

const AttendanceOTReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('2026-08-20 to 2026-08-27');
  
  const [reports, setReports] = useState([]);

  React.useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch('http://72.62.227.163:8010/attendance/');
        if (response.ok) {
          const data = await response.json();
          const reportData = data.map(att => {
            let totalHrs = 0;
            let regularHrs = 0;
            let otHrs = 0;
            let status = 'Absent';
            let workflow = 'Processed';

            const parseTime = (timeStr) => {
              if (!timeStr) return null;
              let h = 0, m = 0;
              if (timeStr.includes('AM') || timeStr.includes('PM')) {
                const parts = timeStr.split(' ');
                const timeParts = parts[0].split(':');
                h = parseInt(timeParts[0]);
                m = parseInt(timeParts[1]);
                if (parts[1] === 'PM' && h !== 12) h += 12;
                if (parts[1] === 'AM' && h === 12) h = 0;
              } else {
                const timeParts = timeStr.split(':');
                h = parseInt(timeParts[0]);
                m = parseInt(timeParts[1]);
              }
              return h * 60 + m;
            };

            const inMins = parseTime(att.inTime);
            const outMins = parseTime(att.outTime);

            if (inMins !== null && outMins !== null) {
              status = 'Present';
              const diffMins = outMins - inMins;
              totalHrs = diffMins / 60;
              const shiftEndMins = 17 * 60; // 5:00 PM
              
              if (outMins > shiftEndMins) {
                otHrs = (outMins - shiftEndMins) / 60;
                regularHrs = totalHrs - otHrs;
                workflow = 'Pending Approval';
              } else {
                regularHrs = totalHrs;
              }
            } else if (inMins !== null) {
              status = 'Missing Out';
            }

            const otAmount = otHrs > 0 ? (otHrs * 20).toFixed(2) : 0;

            return {
              id: `RPT-${att.id}`,
              empId: att.employeeId,
              name: att.name,
              date: att.date,
              inTime: att.inTime || '-',
              outTime: att.outTime || '-',
              totalHrs: totalHrs > 0 ? totalHrs.toFixed(2) : '-',
              regularHrs: regularHrs > 0 ? regularHrs.toFixed(2) : '-',
              otHrs: otHrs > 0 ? otHrs.toFixed(2) : '0',
              otRate: otHrs > 0 ? '$20/hr' : '-',
              otAmount: otHrs > 0 ? `$${otAmount}` : '-',
              status: status,
              workflow: workflow
            };
          });
          setReports(reportData);
        }
      } catch (err) {
        console.error('Error fetching report data:', err);
      }
    };
    fetchRecords();
  }, []);

  const filteredReports = reports.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.empId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Present': return 'bg-success bg-opacity-10 text-success';
      case 'Late': return 'bg-warning bg-opacity-10 text-warning';
      case 'Half Day': return 'bg-info bg-opacity-10 text-info';
      case 'Absent': return 'bg-secondary bg-opacity-10 text-secondary';
      default: return 'bg-light text-dark';
    }
  };

  const getWorkflowBadge = (wf) => {
    switch(wf) {
      case 'Approved': return 'text-success fw-bold';
      case 'Pending Approval': return 'text-warning fw-bold';
      case 'Processed': return 'text-primary fw-bold';
      default: return 'text-muted';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">Attendance & OT Report</h1>
          <p className="text-firo-muted m-0 small">Consolidated reports for approval workflows and payroll processing.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary bg-white rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm border-primary">
            <Download size={18} /> Export Excel
          </button>
          <button className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm">
            <FileText size={18} /> Export PDF
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="p-4 border-bottom bg-white d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <select className="form-select rounded-pill bg-firo-bg border-0 fw-medium text-firo-dark" style={{ width: 'auto' }}>
              <option>Current Week</option>
              <option>Previous Week</option>
              <option>Current Month</option>
              <option>Custom Range</option>
            </select>
            <span className="text-firo-muted small">{dateRange}</span>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <div className="position-relative" style={{ width: '250px' }}>
              <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-firo-muted" />
              <input 
                type="text" 
                className="form-control rounded-pill ps-5 bg-firo-bg border-0" 
                placeholder="Search employee or ID..." 
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
          <table className="table table-hover align-middle mb-0" style={{ minWidth: '1200px' }}>
            <thead className="bg-light">
              <tr>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 px-4">Employee Details</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Date</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">In / Out</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 text-center">Work Hrs (Reg/Total)</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">OT Details</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Attendance</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 text-end px-4">Approval / Payroll</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {filteredReports.map((rec) => (
                <tr key={rec.id}>
                  <td className="px-4">
                    <div className="fw-bold text-firo-dark">{rec.name}</div>
                    <div className="small text-firo-muted">{rec.empId}</div>
                  </td>
                  <td>
                    <span className="fw-medium text-firo-dark">{rec.date}</span>
                  </td>
                  <td>
                    <div className="small text-firo-dark">In: <span className="fw-medium">{rec.inTime}</span></div>
                    <div className="small text-firo-dark">Out: <span className="fw-medium">{rec.outTime}</span></div>
                  </td>
                  <td className="text-center">
                    <div className="fw-bold text-firo-primary fs-6">{rec.totalHrs} <span className="fw-normal text-firo-muted small">Total</span></div>
                    <div className="small text-firo-muted">{rec.regularHrs} Reg</div>
                  </td>
                  <td>
                    {rec.otHrs !== '0' ? (
                      <>
                        <div className="fw-bold text-danger">{rec.otHrs} hrs</div>
                        <div className="small text-firo-dark">{rec.otAmount} <span className="text-firo-muted">({rec.otRate})</span></div>
                      </>
                    ) : (
                      <span className="text-firo-muted small">-</span>
                    )}
                  </td>
                  <td>
                    <span className={classNames('badge rounded-pill px-3 py-2 fw-medium', getStatusBadge(rec.status))}>
                      {rec.status}
                    </span>
                  </td>
                  <td className="text-end px-4">
                    <div className={classNames('small mb-1', getWorkflowBadge(rec.workflow))}>
                      {rec.workflow}
                    </div>
                    {rec.workflow === 'Pending Approval' && (
                      <button className="btn btn-sm btn-success rounded-pill px-3 py-1" style={{ fontSize: '12px' }}>
                        <CheckCircle size={14} className="me-1 mb-1" /> Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-firo-muted">
                    No reports found. Try adjusting the date range or search term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceOTReport;
