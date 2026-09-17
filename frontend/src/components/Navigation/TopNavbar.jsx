import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  AlignLeft as Menu, 
  Search, 
  Bell, 
  HelpCircle,
  ChevronDown,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import classNames from 'classnames';
import './Navigation.css';
import BrandLogo from './BrandLogo';
import { AuthContext } from '../../context/AuthContext';

const TopNavbar = ({ onMenuClick, showHamburger = false, activeTab, onNavigate, onLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { user } = useContext(AuthContext) || { user: {} };

  // Derive display name and initials from user object
  const displayName = user?.name || user?.fullName || user?.username || 'User';
  const displayRole = user?.role || '';
  const displayEmail = user?.email || user?.contactInformation || '';
  const initials = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-bottom d-flex align-items-center justify-content-between px-4 py-2 flex-shrink-0" style={{ height: '64px', zIndex: 1020 }} aria-label="Top Navigation">
      <div className="d-flex align-items-center gap-3">
        <button 
          className="btn btn-link text-firo-text p-1 border-0"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu size={22} className="text-secondary" />
        </button>

        <div className="position-relative d-none d-md-block" style={{ width: '360px' }}>
          <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          <input 
            type="text" 
            className="form-control form-control-sm border bg-light bg-opacity-50 ps-5 pe-5 py-2 rounded-pill" 
            style={{ fontSize: '13px', borderColor: '#e2e8f0' }}
            placeholder="Search employees, modules, reports..." 
            aria-label="Search"
          />
          <div className="position-absolute top-50 end-0 translate-middle-y me-2">
            <kbd className="bg-white border rounded px-2 py-0.5 text-muted shadow-sm" style={{ fontSize: '10px', fontFamily: 'inherit' }}>⌘ K</kbd>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Singapore Country Selector */}
        <div className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill hover-bg cursor-pointer text-secondary fw-medium" style={{ fontSize: '13px', cursor: 'pointer' }}>
          <span style={{ fontSize: '16px' }}>🇸🇬</span>
          <span className="fw-semibold text-dark">SG</span>
          <ChevronDown size={14} className="text-muted" />
        </div>

        {/* Notifications */}
        <button className="btn btn-link text-secondary p-1 position-relative" aria-label="Notifications">
          <Bell size={19} />
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '9px', padding: '2px 5px' }}>
            3
          </span>
        </button>
        
        {/* Help */}
        <button className="btn btn-link text-secondary p-1 d-none d-sm-block" aria-label="Help">
          <HelpCircle size={19} />
        </button>
        
        <div className="vr d-none d-sm-block bg-secondary bg-opacity-25 mx-1" style={{ height: '20px' }}></div>

        {/* Profile */}
        <div className="position-relative" ref={profileRef}>
          <button 
            className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2" 
            aria-expanded={isProfileOpen} 
            aria-haspopup="menu"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px', fontSize: '14px', background: '#e0e7ff', color: '#3b82f6' }}>
              {initials}
            </div>
            <div className="d-none d-md-flex flex-column align-items-start text-start me-1">
              <span className="text-dark fw-bold" style={{ fontSize: '13px', lineHeight: '1.2' }}>{displayName}</span>
              <span className="text-muted" style={{ fontSize: '11px', lineHeight: '1.2' }}>{displayRole}</span>
            </div>
            <ChevronDown size={14} className="text-muted" />
          </button>
          
          {isProfileOpen && (
            <div className="dropdown-menu show position-absolute end-0 shadow-lg border-0 rounded-4 p-2 bg-white mt-2" style={{ minWidth: '220px', zIndex: 1050 }}>
              <div className="px-3 py-2 border-bottom mb-1">
                <div className="fw-bold text-dark fs-6">{displayName}</div>
                <div className="text-muted small">{displayEmail}</div>
              </div>
              <button className="dropdown-item rounded-3 py-2 px-3 mb-1 d-flex align-items-center gap-2 text-dark fw-medium" style={{ fontSize: '13px' }}>
                <User size={16} className="text-muted" /> My Profile
              </button>
              <button className="dropdown-item rounded-3 py-2 px-3 mb-1 d-flex align-items-center gap-2 text-dark fw-medium" style={{ fontSize: '13px' }}>
                <Settings size={16} className="text-muted" /> Settings
              </button>
              <div className="dropdown-divider my-1"></div>
              <button 
                className="dropdown-item rounded-3 py-2 px-3 d-flex align-items-center gap-2 text-danger fw-medium"
                style={{ fontSize: '13px' }}
                onClick={onLogout}
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
