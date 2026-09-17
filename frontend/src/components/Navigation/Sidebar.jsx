import React, { useContext } from 'react';
import { 
  Home, 
  Contact, 
  MapPin,
  CheckSquare, 
  Clock, 
  ClipboardCheck, 
  Users, 
  Timer, 
  MessageSquare, 
  Settings, 
  LogOut,
  ChevronsLeft,
  X,
  ListChecks,
  Banknote,
  CreditCard,
  UserCheck,
  UserCog,
  BarChart2,
  History,
  FileSpreadsheet,
  Flame,
  QrCode,
  ChevronRight,
  ChevronDown,
  ShieldAlert
} from 'lucide-react';
import classNames from 'classnames';
import './Navigation.css';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = ({ isOpen, isMobile, onClose, onToggleCollapse, isCollapsed, activeTab, onNavigate, onLogout }) => {
  const { privileges, user } = useContext(AuthContext) || { privileges: {}, user: {} };
  const [expandedMenus, setExpandedMenus] = React.useState({});

  const hasViewPrivilege = (moduleName) => {
    if (moduleName === 'Logout') return true;
    return !!privileges[`${moduleName}_View`];
  };

  const toggleSubMenu = (menuName, e) => {
    e.stopPropagation();
    setExpandedMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const mainLinks = [
    { name: 'Dashboard', icon: Home },
    { 
      name: 'User Management', 
      icon: UserCog,
      subLinks: [
        { name: 'System Users' },
        { name: 'Manage Roles' },
        { name: 'Manage Privileges' },
        { name: 'Locations' }
      ]
    },
    { 
      name: 'Employee Management', 
      icon: Contact,
      subLinks: [
        { name: 'Employee Management' },
        { name: 'Employee Document Management' }
      ]
    },
    { name: 'Customer Site Management', icon: MapPin },
    { name: 'QR Attendance', icon: QrCode },
    { name: 'Shift & Hours', icon: Clock },
    { name: 'Attendance Management', icon: ClipboardCheck },
    { name: 'Early Departure Management', icon: LogOut },
    { name: 'Leave Management', icon: CheckSquare },
    { name: 'Overtime Management', icon: Timer },
    { name: 'Attendance & OT Report', icon: FileSpreadsheet },
    { name: 'Approval Workflow', icon: ListChecks },
    { name: 'Payslips', icon: Banknote },
    { name: 'Timecard Management', icon: Clock },
    { name: 'Payment & Receipts', icon: CreditCard },
    { name: 'Employee Self-Service', icon: UserCheck },
    { name: 'Reports & Analytics', icon: BarChart2 },
    { name: 'Audit Log', icon: History },
  ];

  const settingsLinks = [
    { name: 'Logout', icon: LogOut },
  ];

  // Filter links based on privileges
  const filteredLinks = mainLinks.filter(link => {
    if (link.subLinks) {
      const allowedSubs = link.subLinks.filter(sub => hasViewPrivilege(sub.name));
      link.subLinks = allowedSubs;
      return allowedSubs.length > 0;
    }
    return hasViewPrivilege(link.name);
  });

  const sidebarClasses = classNames(
    'firo-sidebar bg-firo-card d-flex flex-column',
    {
      'open': isOpen,
      'collapsed': isCollapsed && !isMobile,
      'mobile': isMobile
    }
  );

  return (
    <>
      {isMobile && isOpen && (
        <div 
          className="firo-sidebar-overlay" 
          onClick={onClose}
          aria-label="Close sidebar"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onClose();
            }
          }}
        ></div>
      )}
      
      <aside className={sidebarClasses} aria-label="Sidebar Navigation">
        <div className="sidebar-header flex-shrink-0 d-flex align-items-center justify-content-between px-3 border-bottom" style={{ height: '64px' }}>
          <div className="d-flex align-items-center overflow-hidden">
            <img 
              src="/logo.png" 
              alt="ATM Engineering Logo" 
              style={{ width: 'auto', height: '24px', marginRight: '12px' }} 
            />
          </div>

          {isMobile && (
            <button className="btn btn-link text-firo-muted p-1 border-0" onClick={onClose} aria-label="Close sidebar">
              <X size={20} />
            </button>
          )}
          
          {!isMobile && (
            <button 
              className="btn btn-link text-secondary p-1 border-0 collapse-btn" 
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronsLeft size={16} className={classNames('transition-transform', { 'rotate-180': isCollapsed })} />
            </button>
          )}
        </div>

        <div className="sidebar-content flex-grow-1 overflow-y-auto py-3">
          {!isCollapsed && (
            <div className="px-3 mb-2">
              <div className="text-uppercase text-firo-muted fw-bold sidebar-label" style={{ fontSize: '10px', letterSpacing: '0.8px' }}>Main</div>
            </div>
          )}
          
          <nav aria-label="Main Navigation">
            <ul className="list-unstyled mb-3">
              {filteredLinks.map((link, idx) => (
                <li key={idx} className="mb-1">
                  <button 
                    className={classNames(
                      'sidebar-link w-100 border-0 bg-transparent text-start d-flex align-items-center px-3 py-2 text-decoration-none',
                      { 'active': activeTab === link.name }
                    )}
                    onClick={(e) => {
                      if (link.name === 'Logout') {
                        if (onLogout) onLogout();
                      } else {
                        onNavigate(link.name);
                        if (link.subLinks) toggleSubMenu(link.name, e);
                      }
                    }}
                    aria-current={activeTab === link.name ? 'page' : undefined}
                  >
                    <link.icon size={18} className="link-icon me-3 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="link-text flex-grow-1 text-truncate" style={{ fontSize: '13.5px' }}>{link.name}</span>
                    )}
                    {!isCollapsed && link.badge && (
                      <span className="badge bg-primary-subtle text-primary rounded-pill px-2">{link.badge}</span>
                    )}
                    {!isCollapsed && link.subLinks && (
                      <div className="ms-auto text-muted">
                        {expandedMenus[link.name] ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                      </div>
                    )}
                  </button>
                  {!isCollapsed && link.subLinks && expandedMenus[link.name] && (
                    <ul className="list-unstyled ms-4 mt-1 mb-2 ps-1">
                      {link.subLinks.map((subLink, subIdx) => (
                        <li key={subIdx} className="mb-1">
                          <button
                            className={classNames(
                              'sidebar-link w-100 border-0 bg-transparent text-start d-flex align-items-center px-3 py-1.5 text-decoration-none',
                              { 'active': activeTab === subLink.name }
                            )}
                            onClick={() => onNavigate(subLink.name)}
                          >
                            <span 
                              className="rounded-circle me-2 flex-shrink-0" 
                              style={{ 
                                width: '6px', 
                                height: '6px', 
                                backgroundColor: activeTab === subLink.name ? 'var(--firo-primary)' : '#94a3b8' 
                              }}
                            />
                            <span 
                              className="link-text" 
                              style={{ 
                                fontSize: '13px', 
                                color: activeTab === subLink.name ? 'var(--firo-primary)' : '#64748b',
                                fontWeight: activeTab === subLink.name ? 600 : 400
                              }}
                            >
                              {subLink.label || subLink.name}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="System Navigation">
            <ul className="list-unstyled mb-3">
              {settingsLinks.map((link, idx) => (
                <li key={idx} className="mb-1">
                  <button 
                    className="sidebar-link w-100 border-0 bg-transparent text-start d-flex align-items-center px-3 py-2 text-decoration-none"
                    onClick={() => {
                      if (link.name === 'Logout') {
                        if (onLogout) onLogout();
                      } else {
                        onNavigate(link.name);
                      }
                    }}
                  >
                    <link.icon size={18} className="link-icon me-3 flex-shrink-0" />
                    {!isCollapsed && <span className="link-text text-truncate" style={{ fontSize: '13.5px' }}>{link.name}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Singapore Skyline Promo Banner Card */}
          {!isCollapsed && (
            <div className="px-1 mt-3 mb-2">
              <div 
                className="p-3 rounded-4 position-relative overflow-hidden" 
                style={{ 
                  background: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)', 
                  border: '1px solid #bae6fd' 
                }}
              >
                <div className="mb-2 text-center" style={{ height: '42px', overflow: 'hidden' }}>
                  <svg viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                    {/* Marina Bay Sands */}
                    <rect x="15" y="18" width="7" height="32" rx="1" fill="#0284c7" opacity="0.45" />
                    <rect x="26" y="16" width="7" height="34" rx="1" fill="#0284c7" opacity="0.45" />
                    <rect x="37" y="18" width="7" height="32" rx="1" fill="#0284c7" opacity="0.45" />
                    <path d="M10 18 Q30 14 55 19 L53 16 Q30 12 11 16 Z" fill="#0284c7" opacity="0.7" />
                    {/* CBD Towers */}
                    <rect x="52" y="12" width="9" height="38" fill="#0369a1" opacity="0.35" />
                    <polygon points="52,12 56.5,6 61,12" fill="#0369a1" opacity="0.45" />
                    <rect x="65" y="16" width="11" height="34" fill="#0284c7" opacity="0.4" />
                    <rect x="80" y="10" width="12" height="40" fill="#0369a1" opacity="0.35" />
                    <rect x="96" y="20" width="9" height="30" fill="#0284c7" opacity="0.35" />
                    <rect x="109" y="14" width="11" height="36" fill="#0369a1" opacity="0.4" />
                    {/* Singapore Flyer */}
                    <circle cx="145" cy="24" r="14" stroke="#0284c7" strokeWidth="1.5" opacity="0.5" />
                    <circle cx="145" cy="24" r="2.5" fill="#0284c7" opacity="0.6" />
                    <line x1="145" y1="24" x2="145" y2="50" stroke="#0284c7" strokeWidth="1.5" opacity="0.5" />
                    <line x1="136" y1="50" x2="145" y2="24" stroke="#0284c7" strokeWidth="1.5" opacity="0.5" />
                    <line x1="154" y1="50" x2="145" y2="24" stroke="#0284c7" strokeWidth="1.5" opacity="0.5" />
                    {/* Base waterline */}
                    <line x1="0" y1="50" x2="200" y2="50" stroke="#0284c7" strokeWidth="1.5" opacity="0.3" />
                  </svg>
                </div>
                <div className="fw-bold text-dark" style={{ fontSize: '11.5px', lineHeight: 1.3 }}>
                  Precision. People. Progress.
                </div>
                <div className="text-muted" style={{ fontSize: '10px', lineHeight: 1.3, marginTop: '2px' }}>
                  Building a stronger tomorrow, together.
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
