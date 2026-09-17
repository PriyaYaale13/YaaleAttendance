import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

const Settings = () => {
  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold text-firo-dark m-0 mb-1">Settings</h1>
        <p className="text-firo-muted m-0 small">Manage your settings and view insights.</p>
      </div>

      <EmptyState 
        icon={SettingsIcon}
        title="No settings found."
        description="This module is currently under construction. Check back soon for updates!"
        actionText="Create New"
        onAction={() => alert('Settings creation is coming soon!')}
      />
    </div>
  );
};

export default Settings;
