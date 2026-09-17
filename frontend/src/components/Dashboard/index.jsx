import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import {
  Users, UserCheck, UserX, FileText, Clock, DollarSign,
  TrendingUp, Info, Calendar, CheckCircle2, UserPlus, Check, ChevronDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const Dashboard = () => {
  const [role, setRole] = useState('Superadmin');
  const [timeRange, setTimeRange] = useState('7D');
  const roles = ['Superadmin', 'Supervisor', 'Payroll', 'Employee'];

  const [dbData, setDbData] = useState({
    totalEmployees: 0,
    present: 0,
    absent: 0,
    late: 0,
    otHours: '0.0',
    otAmount: '0.00',
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    onLeaveToday: 0,
    scheduledShifts: 0,
    avgWorkHrs: '0.0',
    recentActivities: [],
    chartData: []
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

        let emps = [], atts = [], ots = [], leaves = [];

        if (empRes.ok) emps = await empRes.json();
        if (attRes.ok) atts = await attRes.json();
        if (otRes.ok) ots = await otRes.json();
        if (leaveRes.ok) leaves = await leaveRes.json();

        // Safe array fallbacks
        emps = Array.isArray(emps) ? emps : [];
        atts = Array.isArray(atts) ? atts : [];
        ots = Array.isArray(ots) ? ots : [];
        leaves = Array.isArray(leaves) ? leaves : [];

        const now = new Date();
        // Since we know we're simulating localized data (e.g. IST), construct YYYY-MM-DD
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        let totalEmp = emps.length;
        
        // Today's attendance
        const todayAtts = atts.filter(a => a.date === todayStr);
        let present = 0;
        let late = 0;
        let totalWorkHrsToday = 0;
        
        todayAtts.forEach(a => {
          if (a.inTime) {
            present++;
            // Check late (naive check: if PM or after 9:15 AM)
            if (a.inTime.toUpperCase().includes('PM')) {
               const hr = parseInt(a.inTime.split(':')[0], 10);
               if (hr !== 12 || parseInt(a.inTime.split(':')[1], 10) > 0) late++;
            } else {
               const timeNum = parseInt(a.inTime.replace(':', '').replace(/ AM| PM/i, ''), 10);
               if (timeNum > 915 && timeNum < 1200) late++;
            }
          }
          if (a.workingHours) {
            totalWorkHrsToday += parseFloat(a.workingHours);
          }
        });
        
        let avgWorkHrs = present > 0 ? (totalWorkHrsToday / present).toFixed(1) : '0.0';

        let onLeaveToday = leaves.filter(l => l.startDate <= todayStr && l.endDate >= todayStr && l.status === 'Approved').length;
        let absent = Math.max(0, totalEmp - present - onLeaveToday);

        let otHours = 0, otAmount = 0;
        const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const monthOts = ots.filter(o => o.date && o.date.startsWith(currentMonthPrefix));
        monthOts.forEach(o => {
          otHours += parseFloat(o.potentialOtHours || o.actualWorkingHours || 0);
          otAmount += (parseFloat(o.paidOtHours || 0) * 20); // Arbitrary $20 per hr
        });

        let pending = 0, approved = 0, rejected = 0;
        leaves.forEach(l => {
          if (l.status === 'Pending') pending++;
          else if (l.status === 'Approved') approved++;
          else if (l.status === 'Rejected') rejected++;
        });

        // Generate Recent Activities Dynamically
        let acts = [];
        const sortedAtts = [...atts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
        sortedAtts.forEach((a, i) => {
          acts.push({
            id: `att-${i}`,
            title: `${a.name || a.employeeId} checked in`,
            time: `${a.date}, ${a.inTime || 'N/A'}`,
            badge: 'Check-in',
            badgeClass: 'bg-success-subtle text-success',
            icon: Check,
            iconBg: '#dcfce7',
            iconColor: '#16a34a'
          });
        });

        const sortedLeaves = [...leaves].sort((a, b) => b.id - a.id).slice(0, 2);
        sortedLeaves.forEach((l, i) => {
          acts.push({
            id: `lv-${i}`,
            title: `Leave request by ${l.empId}`,
            time: `Status: ${l.status}`,
            badge: l.status,
            badgeClass: l.status === 'Pending' ? 'bg-warning-subtle text-warning' : (l.status === 'Approved' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'),
            icon: Calendar,
            iconBg: '#f3e8ff',
            iconColor: '#9333ea'
          });
        });

        const chartData = [
          { name: 'Present', count: present, color: '#2563eb' },
          { name: 'Absent', count: absent, color: '#ef4444' },
          { name: 'On Leave', count: onLeaveToday, color: '#f59e0b' },
          { name: 'Pending Approval', count: pending, color: '#8b5cf6' }
        ];

        setDbData({
          totalEmployees: totalEmp,
          present,
          absent,
          late,
          otHours: otHours.toFixed(1),
          otAmount: otAmount.toFixed(2),
          pendingLeaves: pending,
          approvedLeaves: approved,
          rejectedLeaves: rejected,
          onLeaveToday,
          scheduledShifts: totalEmp, // Assuming all active employees are scheduled
          avgWorkHrs,
          recentActivities: acts.length > 0 ? acts : [{ id: 1, title: 'No recent activity', time: '', badge: 'System', badgeClass: 'bg-light text-muted', icon: Info, iconBg: '#f8f9fa', iconColor: '#6c757d' }],
          chartData
        });
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    };
    fetchData();
  }, []);

  const kpis = [
    {
      label: 'TOTAL EMPLOYEES',
      value: dbData.totalEmployees.toString(),
      sub: 'All registered employees',
      trend: 'Total Headcount',
      trendColor: '#64748b',
      icon: Users,
      iconBg: '#eff6ff',
      iconColor: '#2563eb'
    },
    {
      label: 'PRESENT EMPLOYEES',
      value: dbData.present.toString(),
      sub: 'Checked-in today',
      trend: 'Active Now',
      trendColor: '#10b981',
      icon: UserCheck,
      iconBg: '#f0fdf4',
      iconColor: '#16a34a'
    },
    {
      label: 'ABSENT EMPLOYEES',
      value: dbData.absent.toString(),
      sub: 'Not checked-in today',
      trend: 'Missed Shifts',
      trendColor: '#ef4444',
      icon: UserX,
      iconBg: '#fff7ed',
      iconColor: '#ea580c'
    },
    {
      label: 'PENDING APPROVALS',
      value: dbData.pendingLeaves.toString(),
      sub: 'Requests awaiting approval',
      trend: 'Leaves & Actions',
      trendColor: '#8b5cf6',
      icon: FileText,
      iconBg: '#faf5ff',
      iconColor: '#9333ea'
    },
    {
      label: 'OT HOURS',
      value: `${dbData.otHours} hrs`,
      sub: 'Overtime this month',
      trend: 'Current Month',
      trendColor: '#0ea5e9',
      icon: Clock,
      iconBg: '#f0f9ff',
      iconColor: '#0284c7'
    },
    {
      label: 'PAID OT',
      value: `$${dbData.otAmount}`,
      sub: 'Paid overtime this month',
      trend: 'Calculated Cost',
      trendColor: '#eab308',
      icon: DollarSign,
      iconBg: '#fefce8',
      iconColor: '#ca8a04'
    }
  ];

  return (
    <div className="pb-4">
      {/* Header Section */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold text-dark m-0 mb-1 d-flex align-items-center gap-2">
            Welcome back, Dashboard <span style={{ fontSize: '24px' }}>👋</span>
          </h1>
          <p className="text-muted m-0 small">Here's what's happening in ATM Workspace today.</p>
        </div>
        
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small fw-medium">View as:</span>
          <div className="position-relative">
            <select 
              className="form-select form-select-sm border shadow-sm fw-semibold text-primary bg-white rounded-pill px-3 py-1 pe-4" 
              style={{ borderColor: '#e2e8f0', fontSize: '13px', cursor: 'pointer' }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="row g-3 mb-4">
        {kpis.map((kpi, index) => (
          <div key={index} className="col-12 col-sm-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h6 className="text-muted fw-bold text-uppercase m-0 mb-1" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                    {kpi.label}
                  </h6>
                  <h3 className="fw-bold text-dark m-0">{kpi.value}</h3>
                </div>
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '42px', height: '42px', backgroundColor: kpi.iconBg, color: kpi.iconColor }}
                >
                  <kpi.icon size={20} />
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 mt-auto pt-2">
                <span className="badge bg-opacity-10 fw-medium" style={{ backgroundColor: `${kpi.trendColor}15`, color: kpi.trendColor, fontSize: '10.5px' }}>
                  {kpi.trend}
                </span>
                <span className="text-muted text-truncate" style={{ fontSize: '11px' }}>{kpi.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="row g-4 mb-4">
        {/* Left: Chart */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h5 className="fw-bold text-dark m-0" style={{ fontSize: '16px' }}>Today's Attendance Overview</h5>
              <div className="dropdown">
                <button className="btn btn-sm btn-light border-0 rounded-pill px-3 fw-medium text-secondary d-flex align-items-center gap-2" style={{ fontSize: '11.5px', backgroundColor: '#f1f5f9' }}>
                  <Calendar size={12} /> Today <ChevronDown size={12} />
                </button>
              </div>
            </div>

            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dbData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                    {dbData.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chart Legend */}
            <div className="d-flex align-items-center justify-content-center gap-4 mt-3 flex-wrap" style={{ fontSize: '12px' }}>
              <div className="d-flex align-items-center gap-1.5">
                <span className="rounded-1" style={{ width: '10px', height: '10px', backgroundColor: '#2563eb' }}></span>
                <span className="text-secondary">Present</span>
              </div>
              <div className="d-flex align-items-center gap-1.5">
                <span className="rounded-1" style={{ width: '10px', height: '10px', backgroundColor: '#ef4444' }}></span>
                <span className="text-secondary">Absent</span>
              </div>
              <div className="d-flex align-items-center gap-1.5">
                <span className="rounded-1" style={{ width: '10px', height: '10px', backgroundColor: '#f59e0b' }}></span>
                <span className="text-secondary">On Leave</span>
              </div>
              <div className="d-flex align-items-center gap-1.5">
                <span className="rounded-1" style={{ width: '10px', height: '10px', backgroundColor: '#8b5cf6' }}></span>
                <span className="text-secondary">Pending Approval</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recent Activities */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold text-dark m-0" style={{ fontSize: '16px' }}>Recent Activities</h5>
              <button className="btn btn-sm btn-light rounded-pill px-3 fw-medium text-secondary" style={{ fontSize: '11.5px', border: '1px solid #e2e8f0' }}>
                View All
              </button>
            </div>

            <div className="d-flex flex-column gap-3 mt-2">
              {dbData.recentActivities.map((act) => (
                <div key={act.id} className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: '32px', height: '32px', backgroundColor: act.iconBg, color: act.iconColor }}
                    >
                      <act.icon size={15} />
                    </div>
                    <div>
                      <div className="fw-semibold text-dark" style={{ fontSize: '13px' }}>
                        {act.title}
                      </div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>
                        {act.time}
                      </div>
                    </div>
                  </div>

                  <span 
                    className={classNames('badge rounded-pill px-2.5 py-1 fw-medium', act.badgeClass)} 
                    style={act.badgeStyle || { fontSize: '11px' }}
                  >
                    {act.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: 4 Mini Stats & Inspirational Quote */}
      <div className="row g-3">
        {/* Team Members */}
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 d-flex flex-row align-items-center gap-3">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '40px', height: '40px', backgroundColor: '#eff6ff', color: '#2563eb' }}
            >
              <Users size={18} />
            </div>
            <div>
              <div className="text-muted fw-semibold text-uppercase" style={{ fontSize: '10px' }}>TEAM MEMBERS</div>
              <div className="fw-bold text-dark fs-5">{dbData.totalEmployees}</div>
              <div className="text-muted" style={{ fontSize: '11px' }}>Active this month</div>
            </div>
          </div>
        </div>

        {/* Leave Today */}
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 d-flex flex-row align-items-center gap-3">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '40px', height: '40px', backgroundColor: '#f0fdf4', color: '#16a34a' }}
            >
              <Calendar size={18} />
            </div>
            <div>
              <div className="text-muted fw-semibold text-uppercase" style={{ fontSize: '10px' }}>LEAVE TODAY</div>
              <div className="fw-bold text-dark fs-5">{dbData.onLeaveToday}</div>
              <div className="text-muted" style={{ fontSize: '11px' }}>Employees on leave</div>
            </div>
          </div>
        </div>

        {/* Scheduled Shifts */}
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 d-flex flex-row align-items-center gap-3">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '40px', height: '40px', backgroundColor: '#faf5ff', color: '#9333ea' }}
            >
              <Calendar size={18} />
            </div>
            <div>
              <div className="text-muted fw-semibold text-uppercase" style={{ fontSize: '10px' }}>SCHEDULED SHIFTS</div>
              <div className="fw-bold text-dark fs-5">{dbData.scheduledShifts}</div>
              <div className="text-muted" style={{ fontSize: '11px' }}>Today's shifts</div>
            </div>
          </div>
        </div>

        {/* Avg. Work Hours */}
        <div className="col-12 col-sm-6 col-xl-2">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 d-flex flex-row align-items-center gap-3">
            <div 
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '40px', height: '40px', backgroundColor: '#fff7ed', color: '#ea580c' }}
            >
              <Clock size={18} />
            </div>
            <div>
              <div className="text-muted fw-semibold text-uppercase" style={{ fontSize: '10px' }}>AVG. WORK HOURS</div>
              <div className="fw-bold text-dark fs-5">{dbData.avgWorkHrs} hrs</div>
              <div className="text-muted" style={{ fontSize: '11px' }}>Today's average</div>
            </div>
          </div>
        </div>

        {/* Quote Card */}
        <div className="col-12 col-xl-4">
          <div 
            className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 d-flex flex-row align-items-center gap-3"
            style={{ borderLeft: '4px solid #38bdf8 !important' }}
          >
            <div className="fs-1 text-primary opacity-50 ps-1" style={{ lineHeight: 1 }}>”</div>
            <div>
              <div className="text-secondary fw-medium fst-italic" style={{ fontSize: '12px', lineHeight: 1.4 }}>
                "Efficiency is doing things right; effectiveness is doing the right things."
              </div>
              <div className="text-muted text-end mt-1" style={{ fontSize: '11px' }}>
                — Peter Drucker
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
