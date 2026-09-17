import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut } from 'lucide-react';
import TopNavbar from '../Navigation/TopNavbar';
import Sidebar from '../Navigation/Sidebar';

const Layout = ({ children, activeTab, onNavigate, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Handle screen resize to determine if we are on mobile/tablet
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) {
        setIsSidebarOpen(false); // Sidebar is static on desktop
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    if (onLogout) onLogout();
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="d-flex bg-firo-bg flex-grow-1 overflow-hidden w-100" style={{ height: '100vh', minHeight: '100vh', maxHeight: '100vh' }}>
      {/* Sidebar for all layouts - manages its own mobile state */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        isMobile={isMobile} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        activeTab={activeTab}
        onNavigate={(tab) => {
          onNavigate(tab);
          if (isMobile) setIsSidebarOpen(false);
        }}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column overflow-hidden h-100" style={{ minWidth: 0, minHeight: 0 }}>
        <TopNavbar 
          onMenuClick={toggleSidebar} 
          showHamburger={isMobile || isSidebarCollapsed} 
          activeTab={activeTab}
          onNavigate={onNavigate}
          onLogout={() => setShowLogoutConfirm(true)}
        />
        
        <main className="flex-grow-1 overflow-auto p-4 d-flex flex-column" id="main-content" style={{ minHeight: 0, overscrollBehavior: 'contain' }}>
          <div className="container-fluid py-2 flex-grow-1">
            {children}
          </div>
          
          <footer className="mt-auto pt-4 pb-2 d-flex flex-column flex-sm-row align-items-center justify-content-between text-muted small flex-shrink-0" style={{ fontSize: '12px' }}>
            <div>
              © {new Date().getFullYear()} ATM Engineering Pte Ltd. All rights reserved.
            </div>
            <div className="d-flex align-items-center gap-3 mt-2 mt-sm-0">
              <span>Built in Singapore <span style={{ color: '#ef4444' }}>♡</span></span>
              <span className="badge bg-light text-secondary border px-2 py-1" style={{ fontSize: '11px', fontWeight: 500 }}>v2.0.0</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && createPortal(
        <>
          <div 
            className="modal-backdrop fade show" 
            style={{ 
              position: 'fixed', 
              inset: 0, 
              zIndex: 106000, 
              backgroundColor: 'rgba(15, 23, 42, 0.55)', 
              backdropFilter: 'blur(4px)', 
              WebkitBackdropFilter: 'blur(4px)' 
            }}
            onClick={handleCancelLogout}
          ></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 106005 }} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden p-2">
                <div className="modal-body text-center p-4">
                  <div 
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                    style={{ width: '56px', height: '56px', backgroundColor: '#fee2e2', color: '#dc2626' }}
                  >
                    <LogOut size={26} />
                  </div>
                  <h5 className="fw-bold text-dark mb-2">Are you sure you want to logout?</h5>
                  <p className="text-muted small mb-4">
                    Clicking "Yes" will end your active session and return to the login screen.
                  </p>
                  <div className="d-flex gap-2 justify-content-center">
                    <button 
                      type="button" 
                      className="btn btn-light rounded-pill px-4 fw-semibold flex-grow-1 border"
                      onClick={handleCancelLogout}
                    >
                      No
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-danger rounded-pill px-4 fw-semibold flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                      onClick={handleConfirmLogout}
                    >
                      <LogOut size={16} /> Yes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default Layout;
