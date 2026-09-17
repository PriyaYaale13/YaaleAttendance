import React, { useState } from 'react';
import {
  Layout,
  Login,
  Dashboard,
  UserManagement,
  SystemUsers,
  ManageRoles,
  ManagePrivileges,
  ManageLocations,
  EmployeeManagement,
  QRAttendance,
  ShiftHours,
  AttendanceManagement,
  OvertimeManagement,
  AttendanceOTReport,
  ApprovalWorkflow,
  PayslipModule,
  PaymentModule,
  EmployeeSelfService,
  ReportsAnalytics,
  AuditLogModule,
  Settings,
  EarlyDepartureManagement,
  LeaveManagement,
  CustomerSiteManagement,
  DocumentManagement,
  TimecardManagement
} from './components';

import { AuthContext } from './context/AuthContext';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('atm_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [privileges, setPrivileges] = useState({});
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('atm_activeTab') || 'Dashboard';
  });

  React.useEffect(() => {
    if (user) {
      localStorage.setItem('atm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('atm_user');
    }
  }, [user]);

  React.useEffect(() => {
    localStorage.setItem('atm_activeTab', activeTab);
  }, [activeTab]);

  React.useEffect(() => {
    if (user && user.role) {
      // Fetch role privileges
      fetch(`${import.meta.env.VITE_API_URL}/roles/`)
        .then(res => res.json())
        .then(roles => {
          const matchedRole = roles.find(r => r.name.toLowerCase() === user.role.toLowerCase());
          if (matchedRole && matchedRole.privileges) {
            let privs = matchedRole.privileges;
            if (typeof privs === 'string') {
              try {
                privs = JSON.parse(privs);
              } catch(e) {
                console.error("Failed to parse privileges JSON", e);
              }
            }
            setPrivileges(privs);
          } else {
            setPrivileges({}); // No specific privileges found
          }
        })
        .catch(err => console.error('Failed to fetch role privileges', err));
    } else {
      setPrivileges({});
    }
  }, [user]);

  if (!user) {
    return <Login onLoginSuccess={(u) => setUser(u)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <Dashboard />;
      case 'User Management': return <UserManagement />;
      case 'System Users':
      case '* System Users': return <SystemUsers />;
      case 'Manage Roles':
      case '* Manage Roles': return <ManageRoles />;
      case 'Manage Privileges':
      case '* Manage Privileges': return <ManagePrivileges />;
      case 'Locations':
      case '* Locations': return <ManageLocations />;
      case 'Employee Management': return <EmployeeManagement />;
      case 'Employee Document Management': return <DocumentManagement />;
      case 'Customer Site Management': return <CustomerSiteManagement />;
      case 'QR Attendance': return <QRAttendance />;
      case 'Shift & Hours': return <ShiftHours />;
      case 'Attendance Management': return <AttendanceManagement />;
      case 'Early Departure Management': return <EarlyDepartureManagement />;
      case 'Leave Management': return <LeaveManagement />;
      case 'Overtime Management': return <OvertimeManagement />;
      case 'Attendance & OT Report': return <AttendanceOTReport />;
      case 'Approval Workflow': return <ApprovalWorkflow />;
      case 'Payslips': return <PayslipModule />;
      case 'Timecard Management': return <TimecardManagement />;
      case 'Payment & Receipts': return <PaymentModule />;
      case 'Employee Self-Service': return <EmployeeSelfService />;
      case 'Reports & Analytics': return <ReportsAnalytics />;
      case 'Audit Log': return <AuditLogModule />;
      case 'Settings': return <Settings />;
      default: 
        return (
          <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
            <h3 className="text-firo-dark fw-bold mb-3">{activeTab}</h3>
            <p className="text-firo-muted">Module not found.</p>
          </div>
        );
    }
  };

  return (
    <AuthContext.Provider value={{ user, privileges }}>
      <Layout 
        activeTab={activeTab} 
        onNavigate={setActiveTab}
        onLogout={() => setUser(null)}
      >
        {renderContent()}
      </Layout>
    </AuthContext.Provider>
  );
}

export default App;
