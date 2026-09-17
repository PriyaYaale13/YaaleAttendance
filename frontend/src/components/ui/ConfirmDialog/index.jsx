import React from 'react';
import { createPortal } from 'react-dom';

const ConfirmDialog = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) return null;

  return createPortal(
    <>
      <div 
        className="modal-backdrop fade show" 
        style={{ 
          position: 'fixed',
          inset: 0,
          zIndex: 1100, 
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)'
        }}
      ></div>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1105 }}>
        <div className="modal-dialog modal-dialog-centered modal-sm" role="document">
          <div className="modal-content rounded-4 border-0 shadow-lg text-center p-4">
            <h5 className="fw-bold text-firo-dark mb-2">{title}</h5>
            <p className="text-firo-muted mb-4 small">{message}</p>
            <div className="d-flex gap-2 justify-content-center">
              <button type="button" className="btn btn-light rounded-pill px-4 flex-grow-1" onClick={onCancel}>Cancel</button>
              <button type="button" className="btn btn-primary bg-firo-primary border-0 rounded-pill px-4 flex-grow-1" onClick={onConfirm}>OK</button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default ConfirmDialog;
