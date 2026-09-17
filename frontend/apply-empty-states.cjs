const fs = require('fs');
const path = require('path');

const modules = [
  { name: 'Projects', icon: 'Briefcase' },
  { name: 'Tasks', icon: 'CheckSquare' },
  { name: 'Calendar', icon: 'Calendar' },
  { name: 'Reports', icon: 'BarChart2' },
  { name: 'Clients', icon: 'User' },
  { name: 'Messages', icon: 'MessageSquare' },
  { name: 'Production', icon: 'Factory' },
  { name: 'QC', icon: 'Search' },
  { name: 'QA', icon: 'ShieldCheck' },
  { name: 'Quotations', icon: 'FileText' },
  { name: 'PurchaseOrder', icon: 'ShoppingCart', displayName: 'Purchase Order' },
  { name: 'BillingAdvice', icon: 'Receipt', displayName: 'Billing Advice' },
  { name: 'BillingInvoice', icon: 'FileSpreadsheet', displayName: 'Billing Invoice' },
  { name: 'SalesManagement', icon: 'TrendingUp', displayName: 'Sales Management' },
  { name: 'ResearchDevelopment', icon: 'FlaskConical', displayName: 'Research & Development' },
  { name: 'Settings', icon: 'Settings' }
];

const componentsDir = path.join('d:', 'UI_components', 'firo-navigation', 'src', 'components');

modules.forEach(mod => {
  const modName = mod.name;
  const displayName = mod.displayName || mod.name;
  const icon = mod.icon;
  
  const content = `import React from 'react';
import { ${icon === 'Calendar' ? 'Calendar as CalendarIcon' : icon === 'Settings' ? 'Settings as SettingsIcon' : icon} } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

const ${modName} = () => {
  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">${displayName}</h1>
        <p className="text-firo-muted m-0 small">Manage your ${displayName.toLowerCase()} and view insights.</p>
      </div>

      <EmptyState 
        icon={${icon === 'Calendar' ? 'CalendarIcon' : icon === 'Settings' ? 'SettingsIcon' : icon}}
        title="No ${displayName.toLowerCase()} found."
        description="This module is currently under construction. Check back soon for updates!"
        actionText="Create New"
        onAction={() => alert('${displayName} creation is coming soon!')}
      />
    </div>
  );
};

export default ${modName};
`;

  const targetPath = path.join(componentsDir, modName, 'index.jsx');
  if (fs.existsSync(targetPath)) {
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log(`Updated ${modName}/index.jsx`);
  }
});
