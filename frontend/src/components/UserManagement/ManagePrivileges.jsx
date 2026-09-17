import React, { useState, useEffect } from 'react';
import { Check, X, Save } from 'lucide-react';
import classNames from 'classnames';

const ManagePrivileges = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [privileges, setPrivileges] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Group definitions for modules
  const privilegeGroups = [
    {
      group: 'DASHBOARD',
      modules: [
        { name: 'Dashboard', actions: ['View'] }
      ]
    },
    {
      group: 'USER MANAGEMENT',
      modules: [
        { name: 'System Users', actions: ['View', 'Add', 'Edit', 'Delete', 'Export'] },
        { name: 'Manage Roles', actions: ['View', 'Add', 'Edit', 'Delete'] },
        { name: 'Manage Privileges', actions: ['View', 'Edit'] },
        { name: 'Locations', actions: ['View', 'Add', 'Edit', 'Delete'] }
      ]
    },
    {
      group: 'EMPLOYEE MANAGEMENT',
      modules: [
        { name: 'Employee Management', actions: ['View', 'Add', 'Edit', 'Delete', 'Export'] },
        { name: 'Employee Document Management', actions: ['View', 'Add', 'Edit', 'Delete'] },
        { name: 'Customer Site Management', actions: ['View', 'Add', 'Edit', 'Delete'] },
        { name: 'Team', actions: ['View', 'Add', 'Edit', 'Delete'] }
      ]
    },
    {
      group: 'ATTENDANCE & TIME',
      modules: [
        { name: 'QR Attendance', actions: ['View', 'Export'] },
        { name: 'Shift & Hours', actions: ['View', 'Add', 'Edit', 'Delete'] },
        { name: 'Attendance Management', actions: ['View', 'Edit', 'Export', 'Approve'] },
        { name: 'Early Departure Management', actions: ['View', 'Edit', 'Approve'] },
        { name: 'Leave Management', actions: ['View', 'Add', 'Edit', 'Delete', 'Actions'] },
        { name: 'Overtime Management', actions: ['View', 'Edit', 'Approve'] }
      ]
    },
    {
      group: 'REPORTS & PAYROLL',
      modules: [
        { name: 'Attendance & OT Report', actions: ['View', 'Export'] },
        { name: 'Payslips', actions: ['View', 'Export', 'Generate'] },
        { name: 'Timecard Management', actions: ['View', 'Add', 'Delete', 'Download'] },
        { name: 'Payment & Receipts', actions: ['View', 'Add', 'Edit', 'Delete'] }
      ]
    },
    {
      group: 'SYSTEM',
      modules: [
        { name: 'Approval Workflow', actions: ['View', 'Add', 'Edit', 'Delete'] },
        { name: 'Employee Self-Service', actions: ['View', 'Edit'] },
        { name: 'Reports & Analytics', actions: ['View', 'Export'] },
        { name: 'Audit Log', actions: ['View', 'Export'] },
        { name: 'Settings', actions: ['View', 'Edit'] }
      ]
    }
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/roles/`);
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
        if (data.length > 0) {
          setSelectedRole(data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  useEffect(() => {
    if (selectedRole) {
      const role = roles.find(r => r.id == selectedRole);
      if (role && role.privileges) {
        setPrivileges(role.privileges);
      } else {
        setPrivileges({});
      }
    }
  }, [selectedRole, roles]);

  const handleCheck = (moduleName, action, checked) => {
    const key = `${moduleName}_${action}`;
    setPrivileges(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const handleQuickAction = (actionType) => {
    const newPrivileges = { ...privileges };

    if (actionType === 'Check All') {
      privilegeGroups.forEach(g => {
        g.modules.forEach(m => {
          m.actions.forEach(a => {
            newPrivileges[`${m.name}_${a}`] = true;
          });
        });
      });
    } else if (actionType === 'Uncheck All') {
      privilegeGroups.forEach(g => {
        g.modules.forEach(m => {
          m.actions.forEach(a => {
            newPrivileges[`${m.name}_${a}`] = false;
          });
        });
      });
    } else {
      // Action is "View", "Add", "Edit", etc.
      privilegeGroups.forEach(g => {
        g.modules.forEach(m => {
          if (m.actions.includes(actionType)) {
            newPrivileges[`${m.name}_${actionType}`] = true;
          }
        });
      });
    }

    setPrivileges(newPrivileges);
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setIsLoading(true);
    
    try {
      const role = roles.find(r => r.id == selectedRole);
      const payload = {
        name: role.name,
        privileges: privileges
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/roles/${selectedRole}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        alert('Privileges saved successfully for the selected role!');
        fetchRoles(); // Refresh to get the latest saved data
      } else {
        alert('Failed to save privileges.');
      }
    } catch (err) {
      console.error('Error saving privileges:', err);
      alert('Error saving privileges.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4 h-100 overflow-auto position-relative bg-white">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="h3 fw-bold text-dark m-0 mb-1">Manage Privileges</h1>
          <p className="text-muted m-0 small">Assign module-level access permissions to roles</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-medium text-dark small text-uppercase">Role:</span>
            <select 
              className="form-select border-light rounded-3 bg-light"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ width: '200px', borderColor: '#e2e8f0' }}
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <button 
            className="btn btn-primary bg-firo-primary border-0 rounded-3 px-4 py-2 d-flex align-items-center gap-2 fw-medium shadow-sm"
            onClick={handleSave}
            disabled={isLoading || !selectedRole}
          >
            <Save size={18} /> {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 border border-light">
        <div className="card-body p-0">
          
          {/* Quick Actions Header */}
          <div className="p-4 border-bottom bg-white">
            <div className="text-uppercase fw-bold text-muted small mb-3" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
              Quick Actions:
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button 
                className="btn btn-sm d-flex align-items-center gap-1 fw-bold text-firo-primary" 
                style={{ backgroundColor: 'rgba(var(--firo-primary-rgb, 19, 78, 122), 0.1)', border: '1px solid rgba(var(--firo-primary-rgb, 19, 78, 122), 0.2)', fontSize: '12px', padding: '4px 10px' }}
                onClick={() => handleQuickAction('View')}
              >
                <Check size={14} /> All View
              </button>
              <button 
                className="btn btn-sm d-flex align-items-center gap-1 fw-bold text-firo-primary" 
                style={{ backgroundColor: 'rgba(var(--firo-primary-rgb, 19, 78, 122), 0.1)', border: '1px solid rgba(var(--firo-primary-rgb, 19, 78, 122), 0.2)', fontSize: '12px', padding: '4px 10px' }}
                onClick={() => handleQuickAction('Add')}
              >
                <Check size={14} /> All Add
              </button>
              <button 
                className="btn btn-sm d-flex align-items-center gap-1 fw-bold" 
                style={{ backgroundColor: '#fefce8', color: '#eab308', border: '1px solid #fef08a', fontSize: '12px', padding: '4px 10px' }}
                onClick={() => handleQuickAction('Edit')}
              >
                <Check size={14} /> All Edit
              </button>
              <button 
                className="btn btn-sm d-flex align-items-center gap-1 fw-bold" 
                style={{ backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', fontSize: '12px', padding: '4px 10px' }}
                onClick={() => handleQuickAction('Delete')}
              >
                <Check size={14} /> All Delete
              </button>
              <button 
                className="btn btn-sm d-flex align-items-center gap-1 fw-bold ms-1 bg-firo-primary text-white border-0" 
                style={{ fontSize: '12px', padding: '5px 11px' }}
                onClick={() => handleQuickAction('Check All')}
              >
                <Check size={14} /> Check All
              </button>
              <button 
                className="btn btn-sm d-flex align-items-center gap-1 fw-bold" 
                style={{ backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', fontSize: '12px', padding: '4px 10px' }}
                onClick={() => handleQuickAction('Uncheck All')}
              >
                <X size={14} /> Uncheck All
              </button>
            </div>
          </div>

          {/* Privileges Table / List */}
          <div className="bg-white">
            {privilegeGroups.map((group, gIdx) => (
              <div key={gIdx} className="border-bottom">
                {/* Group Title */}
                <div className="bg-light px-4 py-2 border-bottom">
                  <div className="text-uppercase fw-bold text-dark" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
                    {group.group}
                  </div>
                </div>
                
                {/* Modules */}
                <div>
                  {group.modules.map((mod, mIdx) => (
                    <div key={mIdx} className="border-bottom px-4 py-3">
                      <div className="text-uppercase fw-bold mb-3 text-firo-primary" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
                        {mod.name.toUpperCase()}
                      </div>
                      <div className="d-flex flex-wrap gap-4 align-items-center px-2">
                        {mod.actions.map(action => {
                          const key = `${mod.name}_${action}`;
                          const isChecked = !!privileges[key];
                          return (
                            <div key={action} className="form-check d-flex align-items-center gap-2 mb-0 cursor-pointer" onClick={() => handleCheck(mod.name, action, !isChecked)}>
                              <div 
                                className={classNames('d-flex align-items-center justify-content-center rounded', {
                                  'bg-firo-primary text-white border-0': isChecked,
                                  'bg-white text-transparent border': !isChecked
                                })}
                                style={{ 
                                  width: '18px', 
                                  height: '18px', 
                                  borderColor: isChecked ? 'transparent' : '#cbd5e1', 
                                  cursor: 'pointer', 
                                  transition: 'all 0.2s ease' 
                                }}
                              >
                                {isChecked && <Check size={14} strokeWidth={3} />}
                              </div>
                              <label className="form-check-label text-dark fw-medium" style={{ fontSize: '13px', cursor: 'pointer', userSelect: 'none' }}>
                                {action}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ManagePrivileges;
