import React, { useState, useEffect } from 'react';
import { BarChart2, Calendar as CalendarIcon, Download, Filter, FileText, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const ReportsAnalytics = () => {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [reportType, setReportType] = useState('monthly_attendance');
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [overtime, setOvertime] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('http://72.62.227.163:8010/employees/').then(r => r.json()),
      fetch('http://72.62.227.163:8010/attendance/').then(r => r.json()),
      fetch('http://72.62.227.163:8010/overtime/').then(r => r.json())
    ]).then(([empData, attData, otData]) => {
      setEmployees(empData || []);
      setAttendance(attData || []);
      setOvertime(otData || []);
    }).catch(console.error);
  }, []);

  const COLORS = ['#1873B9', '#2E90D1', '#54A8E0', '#7FBEED', '#10b981', '#f59e0b', '#6366f1'];

  // Identify filtering parameters
  const [year, month] = selectedMonth.split('-');
  const isCurrentMonth = (now.getFullYear() === parseInt(year, 10) && (now.getMonth() + 1) === parseInt(month, 10));
  
  let daysInMonth;
  if (isCurrentMonth) {
    daysInMonth = now.getDate(); // Up to today if it's the current month
  } else {
    daysInMonth = new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate(); // Total days in that month
  }
  
  const filteredAtt = attendance.filter(a => a.date && a.date.startsWith(selectedMonth));
  const filteredOt = overtime.filter(o => o.date && o.date.startsWith(selectedMonth));

  // Compute Report Data dynamically from database records
  const reportData = employees.map(emp => {
      const empAtt = filteredAtt.filter(a => a.employeeId.toLowerCase() === emp.employeeId.toLowerCase());
      const empOt = filteredOt.filter(o => o.empId.toLowerCase() === emp.employeeId.toLowerCase());

      let present = 0;
      let late = 0;

      empAtt.forEach(a => {
        if (a.inTime && a.outTime) {
           let isLate = false;
           if (a.inTime.toUpperCase().includes('PM')) {
             const hrStr = a.inTime.split(':')[0];
             const hr = parseInt(hrStr, 10);
             if (hr !== 12 || parseInt(a.inTime.split(':')[1], 10) > 0) isLate = true;
           } else {
             const timeNum = parseInt(a.inTime.replace(':', '').replace(/ AM| PM/i, ''), 10);
             if (timeNum > 915 && timeNum < 1200) isLate = true; 
           }
           if (isLate) late++;
           else present++;
        }
      });
      
      const totalOtHrs = empOt.reduce((sum, o) => sum + parseFloat(o.potentialOtHours || o.actualWorkingHours || 0), 0).toFixed(1);

      return {
        empId: emp.employeeId,
        name: emp.fullName,
        dept: emp.department || 'Unassigned',
        present,
        late,
        absent: Math.max(0, daysInMonth - present - late),
        otHrs: totalOtHrs
      };
  });

  // Compute Department Data for OT
  const deptOT = {};
  reportData.forEach(r => {
    if (!deptOT[r.dept]) deptOT[r.dept] = 0;
    deptOT[r.dept] += parseFloat(r.otHrs);
  });
  
  let deptData = Object.keys(deptOT).map(k => ({ name: k, value: deptOT[k] })).filter(d => d.value > 0);
  if (deptData.length === 0) {
    deptData = [{ name: 'No OT Recorded', value: 1 }];
  }

  // Compute Trend Data 
  let trendData = Array.from({ length: daysInMonth }, (_, i) => {
    const d = String(i + 1).padStart(2, '0');
    const dateStr = `${selectedMonth}-${d}`;
    const dayAtt = filteredAtt.filter(a => a.date === dateStr);
    
    let present = 0, late = 0;
    dayAtt.forEach(a => {
      if (a.inTime && a.outTime) {
        let isLate = false;
        if (a.inTime.toUpperCase().includes('PM')) {
          const hr = parseInt(a.inTime.split(':')[0], 10);
          if (hr !== 12 || parseInt(a.inTime.split(':')[1], 10) > 0) isLate = true;
        } else {
          const timeNum = parseInt(a.inTime.replace(':', '').replace(/ AM| PM/i, ''), 10);
          if (timeNum > 915 && timeNum < 1200) isLate = true;
        }
        if (isLate) late++;
        else present++;
      }
    });

    return {
      name: `${month}-${d}`,
      present,
      late,
      absent: employees.length > 0 ? employees.length - present - late : 0
    };
  });

  if (trendData.length === 0) {
    trendData = [
      { name: 'No Data', present: 0, absent: 0, late: 0 }
    ];
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">Reports & Analytics</h1>
          <p className="text-firo-muted m-0 small">Generate comprehensive operational and management reports.</p>
        </div>
        <button className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm">
          <Download size={18} /> Export All Data
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label small fw-bold text-muted text-uppercase mb-2">Report Type</label>
            <select 
              className="form-select bg-firo-bg border-0 rounded-3"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="monthly_attendance">Monthly Attendance Summary</option>
              <option value="daily_attendance">Daily Attendance Log</option>
              <option value="late_attendance">Late Arrivals Report</option>
              <option value="overtime_report">Overtime & OT Payment</option>
              <option value="payroll_report">Consolidated Payroll</option>
              <option value="dept_attendance">Department-wise Analytics</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-bold text-muted text-uppercase mb-2">Date Range</label>
            <div className="input-group">
              <span className="input-group-text bg-firo-bg border-0 rounded-start-3"><CalendarIcon size={16} className="text-muted"/></span>
              <select 
                className="form-select bg-firo-bg border-0 rounded-end-3"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="2026-09">September 2026</option>
                <option value="2026-08">August 2026</option>
                <option value="2026-07">July 2026</option>
              </select>
            </div>
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <button className="btn btn-light border rounded-3 w-100 d-flex align-items-center justify-content-center gap-2 py-2">
              <Filter size={16} /> Advanced Filters
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <div className="d-flex align-items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-firo-primary" />
              <h6 className="fw-bold text-firo-dark m-0">Attendance Trends (Last 7 Days)</h6>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1873B9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1873B9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="present" stroke="#1873B9" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" name="Present" />
                  <Area type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={3} fillOpacity={0.1} fill="#f59e0b" name="Late" />
                  <Area type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={3} fillOpacity={0.1} fill="#ef4444" name="Absent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <div className="d-flex align-items-center gap-2 mb-4">
              <PieChartIcon size={20} className="text-firo-primary" />
              <h6 className="fw-bold text-firo-dark m-0">OT by Department</h6>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Report Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <FileText size={20} className="text-firo-primary" />
            <h6 className="fw-bold text-firo-dark m-0">Generated Report Details</h6>
          </div>
          <button className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-2">
            <Download size={14} /> CSV
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 px-4">Employee ID</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Name</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3">Department</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 text-center">Present Days</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 text-center">Late Days</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 text-center">Absent Days</th>
                <th className="text-firo-muted small text-uppercase fw-semibold py-3 text-end px-4">Total OT (Hrs)</th>
              </tr>
            </thead>
            <tbody className="border-top-0">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">No report data found.</td>
                </tr>
              ) : reportData.map((row, i) => (
                <tr key={i}>
                  <td className="px-4 text-firo-muted">{row.empId}</td>
                  <td className="fw-bold text-firo-dark">{row.name}</td>
                  <td className="text-firo-muted">{row.dept}</td>
                  <td className="text-center fw-medium text-success">{row.present}</td>
                  <td className="text-center fw-medium text-warning">{row.late}</td>
                  <td className="text-center fw-medium text-danger">{row.absent}</td>
                  <td className="text-end px-4 fw-bold text-firo-primary">{row.otHrs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
