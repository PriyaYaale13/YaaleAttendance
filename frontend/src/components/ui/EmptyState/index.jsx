import React from 'react';
import { Plus, Sparkles, PackageOpen } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = PackageOpen, 
  secondaryIcon: SecondaryIcon = Plus,
  title = "Nothing to see here yet.",
  description = "This module is currently under construction or has no data.",
  actionText = null,
  onAction = null
}) => {
  return (
    <div className="card border shadow-sm rounded-4 p-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '450px' }}>
      
      <div className="mb-4 position-relative d-flex align-items-center justify-content-center bg-primary-subtle rounded-circle" style={{ width: '130px', height: '130px' }}>
        <Icon size={54} className="text-firo-primary" strokeWidth={1.5} />
        
        {SecondaryIcon && (
          <div className="position-absolute bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ bottom: '10px', right: '10px', width: '36px', height: '36px', border: '3px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <SecondaryIcon size={20} className="text-firo-primary" strokeWidth={3} />
          </div>
        )}
        
        <Sparkles size={16} className="text-firo-primary position-absolute" style={{ top: '25px', left: '20px', opacity: 0.6 }} />
        <Sparkles size={12} className="text-firo-primary position-absolute" style={{ bottom: '35px', left: '15px', opacity: 0.4 }} />
        <Sparkles size={14} className="text-firo-primary position-absolute" style={{ top: '35px', right: '20px', opacity: 0.5 }} />
      </div>

      <h4 className="fw-bold text-firo-dark mb-2">{title}</h4>
      <p className="text-firo-muted mb-4">{description}</p>
      
      {actionText && onAction && (
        <button className="btn btn-primary bg-firo-primary border-0 rounded-3 px-4 py-2 d-flex align-items-center gap-2 shadow-sm" onClick={onAction}>
          {SecondaryIcon && <SecondaryIcon size={18} />}
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
