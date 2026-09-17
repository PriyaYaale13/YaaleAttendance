import React from 'react';
import { Flame } from 'lucide-react';

const BrandLogo = ({ name = 'Firo', hideName = false }) => {
  return (
    <div className="d-flex align-items-center gap-2 logo-container text-decoration-none">
      <div 
        className="d-flex align-items-center justify-content-center flex-shrink-0" 
      >
        <img src="/logo.png" alt="ATM Engineering" style={{ height: '30px' }} />
      </div>
    </div>
  );
};

export default BrandLogo;
