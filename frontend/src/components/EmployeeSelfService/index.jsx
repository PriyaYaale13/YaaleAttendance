import React, { useState, useEffect, useContext } from 'react';
import { UserCheck, Clock, FileText, Bell, CheckCircle, Download, Eye, Calendar as CalendarIcon, Wallet } from 'lucide-react';
import classNames from 'classnames';
import { AuthContext } from '../../context/AuthContext';

const EmployeeSelfService = () => {
  const { user } = useContext(AuthContext) || {};
  const [activeTab, setActiveTab] = useState('attendance');

  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');

  const [attendanceData, setAttendanceData] = useState([]);
  const [payslipsData, setPayslipsData] = useState([]);
  const [notificationsData, setNotificationsData] = useState([]);

  // Fetch all employees for the dropdown
  useEffect(() => {
    fetch('http://localhost:8000/employees/')
      .then(res => res.json())
      .then(data => {
        setAllEmployees(data);
        if (user?.employeeId && data.find(e => e.employeeId === user.employeeId)) {
          setSelectedEmpId(user.employeeId);
        } else if (data.length > 0) {
          setSelectedEmpId(data[0].employeeId);
        }
      })
      .catch(err => console.error("Failed to fetch employees:", err));
  }, [user]);

  // Derived selected employee info
  const selectedEmpDetails = allEmployees.find(e => e.employeeId === selectedEmpId);
  const empId = selectedEmpId || 'N/A';
  const name = selectedEmpDetails?.fullName || 'Unknown Employee';
  const designation = selectedEmpDetails?.designation || 'N/A';
  const department = selectedEmpDetails?.department || 'N/A';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1873B9&color=fff`;

  useEffect(() => {
    if (!empId || empId === 'N/A') return;

    const fetchData = async () => {
      try {
        const [attRes, payslipRes] = await Promise.all([
          fetch('http://localhost:8000/attendance/'),
          fetch('http://localhost:8000/payslips/')
        ]);

        if (attRes.ok) {
          const allAtt = await attRes.json();
          // Filter by this employee
          const myAtt = allAtt.filter(a => a.employeeId === empId).map(a => {
            let status = 'Pending';
            if (a.inTime && a.outTime) status = 'Present';
            else if (a.inTime && !a.outTime) status = 'Missing Out';
            else status = 'Absent';

            return {
              date: a.date,
              in: a.inTime || '-',
              out: a.outTime || '-',
              workHrs: a.workingHours ? `${a.workingHours}h` : '-',
              otHrs: '0h',
              status: status
            };
          });
          myAtt.sort((a, b) => new Date(b.date) - new Date(a.date));
          setAttendanceData(myAtt);
        }

        if (payslipRes.ok) {
          const allSlips = await payslipRes.json();
          const mySlips = allSlips.filter(p => p.empId === empId).map(p => ({
            period: p.period,
            basic: `$${p.basicSalary}`,
            otAmount: `$${p.otAmount}`,
            netPay: `$${p.netSalary}`,
            status: p.status || 'Paid',
            date: p.paymentDate || '-'
          }));
          setPayslipsData(mySlips);
        }

        setNotificationsData([
          { id: 1, title: 'Welcome to ATM-WMS', desc: `Viewing portal for ${name}.`, date: 'Today', type: 'salary' }
        ]);

      } catch (err) {
        console.error('Failed to fetch self-service data:', err);
      }
    };

    fetchData();
  }, [empId, name]);

  // Derived KPIs
  const todayAtt = attendanceData.find(a => a.date === new Date().toISOString().split('T')[0]);
  const checkedInTime = todayAtt ? todayAtt.in : 'Not checked in';
  const checkedOutTime = todayAtt ? todayAtt.out : 'Pending';
  const isCheckedIn = todayAtt && todayAtt.in !== '-';

  const lastPayslip = payslipsData.length > 0 ? payslipsData[0] : null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">Employee Self-Service</h1>
          <p className="text-firo-muted m-0 small">Your personal portal for attendance, overtime, and salary information.</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <label className="text-firo-muted small fw-bold text-nowrap">View as:</label>
          <select 
            className="form-select rounded-pill bg-white border-0 shadow-sm text-firo-dark fw-medium"
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            style={{ width: 'auto', minWidth: '200px' }}
          >
            <option value="" disabled>Select Employee</option>
            {allEmployees.map(emp => (
              <option key={emp.employeeId} value={emp.employeeId}>
                {emp.employeeId} - {emp.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Profile Header */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
        <div className="p-4 d-flex flex-wrap align-items-center gap-4">
          <img src={avatarUrl} alt="Profile" className="rounded-circle" style={{ width: '80px', height: '80px' }} />
          <div>
            <h4 className="fw-bold text-firo-dark mb-1">{name}</h4>
            <div className="d-flex flex-wrap gap-3 small text-muted fw-medium">
              <span><UserCheck size={14} className="me-1 mb-1" /> {empId}</span>
              <span><FileText size={14} className="me-1 mb-1" /> {designation}</span>
              <span><Clock size={14} className="me-1 mb-1" /> {department}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle">
                <Clock size={24} />
              </div>
              <div>
                <div className="text-muted small fw-bold text-uppercase">Today's Status</div>
                <div className="fw-bold fs-5 text-firo-dark">{isCheckedIn ? 'Checked In' : 'Pending'}</div>
              </div>
            </div>
            <div className="d-flex justify-content-between text-muted small border-top pt-2 mt-2">
              <span>In: {checkedInTime}</span>
              <span>Out: {checkedOutTime}</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="bg-danger bg-opacity-10 text-danger p-3 rounded-circle">
                <CalendarIcon size={24} />
              </div>
              <div>
                <div className="text-muted small fw-bold text-uppercase">Monthly Overtime</div>
                <div className="fw-bold fs-5 text-firo-dark">Check OT Module</div>
              </div>
            </div>
            <div className="d-flex justify-content-between text-muted small border-top pt-2 mt-2">
              <span className="text-success fw-medium">-</span>
              <span className="text-warning fw-medium">-</span>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle">
                <Wallet size={24} />
              </div>
              <div>
                <div className="text-muted small fw-bold text-uppercase">Last Net Pay</div>
                <div className="fw-bold fs-5 text-firo-dark">{lastPayslip ? lastPayslip.netPay : 'N/A'}</div>
              </div>
            </div>
            <div className="d-flex justify-content-between text-muted small border-top pt-2 mt-2">
              <span>Period: {lastPayslip ? lastPayslip.period : '-'}</span>
              <span className="text-success fw-medium">{lastPayslip ? lastPayslip.status : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
        <div className="border-bottom">
          <ul className="nav nav-tabs border-0 gap-3 px-4 pt-3">
            <li className="nav-item">
              <button 
                className={classNames('nav-link border-0 text-firo-dark bg-transparent pb-3 fw-medium', { 'border-bottom border-primary border-3 text-primary': activeTab === 'attendance' })}
                style={{ borderColor: activeTab === 'attendance' ? 'var(--firo-primary) !important' : 'transparent', color: activeTab === 'attendance' ? 'var(--firo-primary) !important' : '' }}
                onClick={() => setActiveTab('attendance')}
              >
                <CalendarIcon size={16} className="me-2 mb-1" />
                Attendance & OT History
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={classNames('nav-link border-0 text-firo-dark bg-transparent pb-3 fw-medium', { 'border-bottom border-primary border-3 text-primary': activeTab === 'payslips' })}
                style={{ borderColor: activeTab === 'payslips' ? 'var(--firo-primary) !important' : 'transparent', color: activeTab === 'payslips' ? 'var(--firo-primary) !important' : '' }}
                onClick={() => setActiveTab('payslips')}
              >
                <FileText size={16} className="me-2 mb-1" />
                My Payslips
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={classNames('nav-link border-0 text-firo-dark bg-transparent pb-3 fw-medium', { 'border-bottom border-primary border-3 text-primary': activeTab === 'notifications' })}
                style={{ borderColor: activeTab === 'notifications' ? 'var(--firo-primary) !important' : 'transparent', color: activeTab === 'notifications' ? 'var(--firo-primary) !important' : '' }}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell size={16} className="me-2 mb-1" />
                Notifications
              </button>
            </li>
          </ul>
        </div>

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="text-firo-muted small text-uppercase fw-semibold py-3 px-4">Date</th>
                  <th className="text-firo-muted small text-uppercase fw-semibold py-3">In-Time</th>
                  <th className="text-firo-muted small text-uppercase fw-semibold py-3">Out-Time</th>
                  <th className="text-firo-muted small text-uppercase fw-semibold py-3">Work Hrs</th>
                  <th className="text-firo-muted small text-uppercase fw-semibold py-3">OT Hrs</th>
                  <th className="text-firo-muted small text-uppercase fw-semibold py-3 text-end px-4">Status</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {attendanceData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">No attendance records found.</td>
                  </tr>
                ) : attendanceData.map((record, index) => (
                  <tr key={index}>
                    <td className="px-4 fw-medium text-firo-dark">{record.date}</td>
                    <td className="text-firo-muted">{record.in}</td>
                    <td className="text-firo-muted">{record.out}</td>
                    <td className="text-firo-dark">{record.workHrs}</td>
                    <td className={record.otHrs !== '0h' ? 'text-danger fw-bold' : 'text-firo-muted'}>{record.otHrs}</td>
                    <td className="text-end px-4">
                      <span className={classNames('badge rounded-pill px-3 py-2 fw-medium', {
                        'bg-success bg-opacity-10 text-success': record.status === 'Present',
                        'bg-warning bg-opacity-10 text-warning': record.status === 'Late',
                        'bg-info bg-opacity-10 text-info': record.status === 'Half Day',
                        'bg-danger bg-opacity-10 text-danger': record.status === 'Missing Out',
                        'bg-secondary bg-opacity-10 text-secondary': record.status === 'Absent',
                        'bg-light text-muted border': record.status === 'Pending'
                      })}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payslips Tab */}
        {activeTab === 'payslips' && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="text-firo-muted small text-uppercase fw-semibold py-3 px-4">Pay Period</th>
                  <th className="text-firo-muted small text-uppercase fw-semibold py-3">Basic Pay</th>
                  <th className="text-firo-muted small text-uppercase fw-semibold py-3">OT Amount</th>
                  <th className="text-firo-muted small text-uppercase fw-semibold py-3">Net Pay</th>
                  <th className="text-firo-muted small text-uppercase fw-semibold py-3">Payment Date</th>
                  <th className="text-firo-muted small text-uppercase fw-semibold py-3 text-end px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {payslipsData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">No payslips found.</td>
                  </tr>
                ) : payslipsData.map((slip, index) => (
                  <tr key={index}>
                    <td className="px-4 fw-bold text-firo-dark">{slip.period}</td>
                    <td className="text-firo-muted">{slip.basic}</td>
                    <td className="text-danger fw-medium">{slip.otAmount}</td>
                    <td className="text-firo-primary fw-bold fs-6">{slip.netPay}</td>
                    <td className="text-firo-muted">
                      {slip.date} <span className="badge bg-success bg-opacity-10 text-success ms-2">{slip.status}</span>
                    </td>
                    <td className="text-end px-4">
                      <button className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 me-2"><Eye size={14} className="me-1 mb-1"/> View</button>
                      <button className="btn btn-sm btn-primary bg-firo-primary border-0 rounded-pill px-3 py-1"><Download size={14} className="me-1 mb-1"/> PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="p-4">
            {notificationsData.map((notif) => (
              <div key={notif.id} className="d-flex gap-3 mb-4 border-bottom pb-3">
                <div className={classNames('p-2 rounded-circle h-100', {
                  'bg-primary bg-opacity-10 text-primary': notif.type === 'salary',
                  'bg-success bg-opacity-10 text-success': notif.type === 'ot',
                  'bg-warning bg-opacity-10 text-dark': notif.type === 'warning'
                })}>
                  <Bell size={20} />
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h6 className="fw-bold text-firo-dark m-0">{notif.title}</h6>
                    <span className="small text-muted fst-italic">— {notif.date}</span>
                  </div>
                  <p className="small text-firo-muted m-0">{notif.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeSelfService;
