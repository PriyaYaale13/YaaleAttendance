import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const Dashboard = () => {
  const [role, setRole] = useState('Superadmin');
  const roles = ['Superadmin', 'Supervisor', 'Payroll', 'Employee'];

  const [dbData, setDbData] = useState({
    totalEmployees: 0,
    present: 0,
    absent: 0,
    late: 0,
    otHours: 0,
    otAmount: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, attRes, otRes, leaveRes] = await Promise.all([
          fetch('http://localhost:8000/employees/').catch(() => ({ ok: false })),
          fetch('http://localhost:8000/attendance/').catch(() => ({ ok: false })),
          fetch('http://localhost:8000/overtime/').catch(() => ({ ok: false })),
          fetch('http://localhost:8000/leaves/').catch(() => ({ ok: false }))
        ]);

        let totalEmp = 0, present = 0, absent = 0, late = 0;
        let otHours = 0, otAmount = 0;
        let pending = 0, approved = 0, rejected = 0;

        if (empRes.ok) {
          const emps = await empRes.json();
          totalEmp = emps.length;
        }

        if (attRes.ok) {
          const atts = await attRes.json();
          // Simplified logic for prototype dashboard: 
          // Group by unique employee for today's status
          atts.forEach(a => {
            if (a.inTime && a.outTime) present++;
            else if (a.inTime && !a.outTime) present++; // Still working
            else absent++;
          });
        }

        if (otRes.ok) {
          const ots = await otRes.json();
          ots.forEach(o => {
            otHours += parseFloat(o.actualWorkingHours || 0) > 0 ? parseFloat(o.potentialOtHours || 0) : 0;
            otAmount += (parseFloat(o.paidOtHours || 0) * 20); // standard rate
          });
        }

        if (leaveRes.ok) {
          const leaves = await leaveRes.json();
          leaves.forEach(l => {
            if (l.status === 'Pending') pending++;
            else if (l.status === 'Approved') approved++;
            else if (l.status === 'Rejected') rejected++;
          });
        }

        setDbData({
          totalEmployees: totalEmp,
          present: present,
          absent: absent,
          late: late,
          otHours: otHours.toFixed(1),
          otAmount: otAmount.toFixed(2),
          pendingLeaves: pending,
          approvedLeaves: approved,
          rejectedLeaves: rejected
        });
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    };
    fetchData();
  }, []);

  const kpis = {
    Superadmin: [
      { label: 'Total Employees', value: dbData.totalEmployees.toString() },
      { label: 'Present Employees', value: dbData.present.toString() },
      { label: 'Absent Employees', value: dbData.absent.toString() },
      { label: 'Pending Approvals', value: dbData.pendingLeaves.toString() },
      { label: 'OT Hours', value: dbData.otHours + ' hrs' },
      { label: 'Paid OT', value: '$' + dbData.otAmount },
    ],
    Supervisor: [
      { label: 'Team Attendance', value: dbData.present > 0 ? 'Good' : 'N/A' },
      { label: 'Team Overtime', value: dbData.otHours + ' hrs' },
      { label: 'Pending Leaves', value: dbData.pendingLeaves.toString() },
      { label: 'Approved Leaves', value: dbData.approvedLeaves.toString() },
      { label: 'Rejected Leaves', value: dbData.rejectedLeaves.toString() },
    ],
    Payroll: [
      { label: 'Processed Payroll', value: 'N/A' },
      { label: 'Pending Payroll', value: 'N/A' },
      { label: 'Total Paid OT', value: '$' + dbData.otAmount },
      { label: 'Payment Status', value: 'Pending' },
    ],
    Employee: [
      { label: "Today's Attendance", value: dbData.present > 0 ? 'Present' : 'Absent' },
      { label: 'Total OT Hours', value: dbData.otHours + ' hrs' },
      { label: 'Leave Balances', value: 'View Details' },
      { label: 'Latest Payslip', value: 'Available' },
    ],
  };

  const superadminData = [
    { name: 'Present', value: dbData.present },
    { name: 'Absent', value: dbData.absent },
    { name: 'Late', value: dbData.late },
  ];

  const supervisorData = [
    { name: 'Approved', value: dbData.approvedLeaves },
    { name: 'Rejected', value: dbData.rejectedLeaves },
    { name: 'Pending', value: dbData.pendingLeaves },
  ];
  const COLORS = ['#10B981', '#EF4444', '#F59E0B'];

  const payrollData = [
    { name: 'Jan', processed: 0, pending: 0 },
    { name: 'Feb', processed: 0, pending: 0 },
    { name: 'Mar', processed: 0, pending: 0 },
    { name: 'Apr', processed: 0, pending: 0 },
  ];

  const employeeData = [
    { day: 'Mon', hours: 8, ot: parseFloat(dbData.otHours) || 0 },
  ];

  const renderChart = () => {
    switch(role) {
      case 'Superadmin':
        return (
          <div className="card border-0 shadow-sm rounded-4 p-4 mt-4" style={{ height: '350px' }}>
            <h5 className="text-firo-dark mb-4 fw-semibold">Employee Status Overview</h5>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={superadminData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{fill: '#f8f9fa'}} />
                <Bar dataKey="value" fill="var(--firo-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'Supervisor':
        return (
          <div className="card border-0 shadow-sm rounded-4 p-4 mt-4" style={{ height: '350px' }}>
            <h5 className="text-firo-dark mb-4 fw-semibold">Leave Requests Distribution</h5>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={supervisorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {supervisorData.map((entry, index) => (
                    <Cell key={\cell-\\} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      case 'Payroll':
        return (
          <div className="card border-0 shadow-sm rounded-4 p-4 mt-4" style={{ height: '350px' }}>
            <h5 className="text-firo-dark mb-4 fw-semibold">Payroll Processing Trends</h5>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={payrollData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="processed" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case 'Employee':
        return (
          <div className="card border-0 shadow-sm rounded-4 p-4 mt-4" style={{ height: '350px' }}>
            <h5 className="text-firo-dark mb-4 fw-semibold">Working Hours Overview</h5>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employeeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8f9fa'}} />
                <Legend />
                <Bar dataKey="hours" name="Regular Hours" stackId="a" fill="var(--firo-primary)" />
                <Bar dataKey="ot" name="Overtime" stackId="a" fill="var(--firo-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">Dashboard</h1>
          <p className="text-firo-muted m-0 small">Welcome to the ATM Workspace Management System.</p>
        </div>
        
        <div className="d-flex align-items-center gap-2 bg-white rounded-pill px-3 py-2 shadow-sm border">
          <span className="text-muted small fw-medium">View as:</span>
          <select 
            className="form-select form-select-sm border-0 shadow-none fw-bold text-firo-primary bg-transparent py-0 pe-4" 
            style={{ width: 'auto', cursor: 'pointer' }}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="row g-4 mb-2">
        {kpis[role].map((kpi, idx) => (
          <div key={idx} className="col-md-4 col-lg-auto" style={{ flex: '1 1 0' }}>
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100 d-flex flex-column justify-content-center">
              <span className="text-firo-muted small fw-semibold text-uppercase mb-2">{kpi.label}</span>
              <h2 className="fw-bold text-firo-dark m-0">{kpi.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {renderChart()}
    </div>
  );
};

export default Dashboard;
