import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Toaster = ({ message, type = 'success', show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-success' : 'bg-danger';
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return createPortal(
    <div 
      className={`position-fixed start-50 translate-middle-x d-flex align-items-center text-white ${bgColor} rounded-pill shadow-lg px-4 py-2`}
      style={{ 
        top: '24px', 
        zIndex: 9999, 
        minWidth: '300px',
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      <Icon size={20} className="me-2 flex-shrink-0" />
      <span className="fw-medium flex-grow-1 text-center" style={{ fontSize: '15px' }}>{message}</span>
      <button 
        className="btn btn-link text-white p-0 ms-3 d-flex align-items-center" 
        onClick={onClose}
        style={{ opacity: 0.8 }}
      >
        <X size={18} />
      </button>

      <style>{`
        @keyframes slideDown {
          from { transform: translate(-50%, -100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default Toaster;
