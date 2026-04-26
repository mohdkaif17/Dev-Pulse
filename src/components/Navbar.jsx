import React from 'react';
import { ChevronDown } from 'lucide-react';

const Navbar = ({ onLogout, activeTab, onTabChange }) => {
  const tabs = [
    { id: 'metrics', label: 'My Metrics' },
    { id: 'team', label: 'Team Overview' },
    { id: 'deepdive', label: 'Deep Dive' },
    { id: 'explorer', label: 'Metric Explorer' },
    { id: 'insights', label: 'Insights' }
  ];

  return (
    <nav className="devpulse-navbar">
      {/* Left Section */}
      <div className="navbar-left">
        <span 
          style={{ 
            color: 'var(--primary)', 
            fontWeight: '700', 
            fontSize: '18px',
            cursor: 'pointer' 
          }}
          onClick={onLogout}
        >
          DevPulse
        </span>
      </div>

      {/* Center Section */}
      <div className="navbar-center">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Right Section */}
      <div className="navbar-right">
        <div className="user-profile" onClick={onLogout}>
          <div className="avatar-circle">NC</div>
          <span className="user-name">Noah Patel</span>
          <ChevronDown size={14} color="#6B7280" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
