import React, { useState } from 'react';
import { History, Search, Download, Filter, Info, ShieldAlert, ArrowRight } from 'lucide-react';
import classNames from 'classnames';

const AuditLogModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('All');

  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('http://72.62.227.163:8010/audit-logs/');
      if (response.ok) {
        const data = await response.json();
        // Convert the ISO datetime strings to local format
        const formattedData = data.map(log => {
          const date = new Date(log.timestamp);
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          const hh = String(date.getHours()).padStart(2, '0');
          const min = String(date.getMinutes()).padStart(2, '0');
          const ss = String(date.getSeconds()).padStart(2, '0');
          return {
            ...log,
            timestamp: `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
          };
        });
        setAuditLogs(formattedData);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = auditLogs.filter(log => 
    (filterModule === 'All' || log.module === filterModule) &&
    (log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
     log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
     log.record.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">System Audit Log</h1>
          <p className="text-firo-muted m-0 small">Track all critical actions, modifications, and security events across the system.</p>
        </div>
        <button className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm">
          <Download size={18} /> Export Audit Trail
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
        <div className="p-4 border-bottom bg-white d-flex flex-wrap gap-3 align-items-center justify-content-between">
          <div className="d-flex gap-3">
            <div className="input-group" style={{ width: '250px' }}>
              <span className="input-group-text bg-firo-bg border-0 rounded-start-3"><Filter size={16} className="text-muted"/></span>
              <select 
                className="form-select bg-firo-bg border-0 rounded-end-3"
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
              >
                <option value="All">All Modules</option>
                <option value="Employee Management">Employee Management</option>
                <option value="Attendance">Attendance</option>
                <option value="Approval Workflow">Approval Workflow</option>
                <option value="Payroll">Payroll</option>
                <option value="Authentication">Authentication</option>
              </select>
            </div>
          </div>
          <div className="position-relative" style={{ width: '300px' }}>
            <Search size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-firo-muted" />
            <input 
              type="text" 
              className="form-control rounded-pill ps-5 bg-firo-bg border-0" 
              placeholder="Search user, action, or record..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 px-4">Date & Time</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">User</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Action & Module</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Target Record</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Changes (Old &rarr; New)</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4">
                    <div className="fw-medium text-firo-dark">{log.timestamp.split(' ')[0]}</div>
                    <div className="small text-muted">{log.timestamp.split(' ')[1]}</div>
                  </td>
                  <td>
                    <div className="fw-bold text-firo-primary">{log.user.split(' ')[0] + ' ' + (log.user.split(' ')[1] || '')}</div>
                    <div className="small text-muted">{log.user.split('(')[1]?.replace(')', '') || 'System'}</div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {log.severity === 'danger' && <ShieldAlert size={14} className="text-danger" />}
                      <span className="fw-bold text-firo-dark">{log.action}</span>
                    </div>
                    <span className="badge bg-firo-bg text-firo-muted border mt-1">{log.module}</span>
                  </td>
                  <td className="fw-medium text-firo-dark">{log.record}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2 small">
                      <span className="text-muted text-decoration-line-through">{log.details.prev}</span>
                      <ArrowRight size={12} className="text-muted" />
                      <span className={log.severity === 'danger' ? 'text-danger fw-bold' : 'text-success fw-bold'}>{log.details.new}</span>
                    </div>
                  </td>
                  <td className="px-4">
                    <span className="text-muted small d-flex align-items-center gap-1">
                      <Info size={14} /> {log.remarks}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-firo-muted">
                    No audit logs match the current filters.
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

export default AuditLogModule;
