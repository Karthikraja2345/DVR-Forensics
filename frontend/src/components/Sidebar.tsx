import React from 'react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'cases', label: 'Case Management', icon: '📁' },
    { id: 'replay', label: 'Forensic Replay', icon: '▶' },
    { id: 'recovery', label: 'Recovery Workspace', icon: '🔍' },
    { id: 'lineage', label: 'Evidence Lineage DAG', icon: '🕸' },
    { id: 'custody', label: 'Chain of Custody', icon: '⛓' },
    { id: 'matrix', label: 'OEM Coverage Matrix', icon: '🛡' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <span>⚡</span>
          <span>DVR FORENSICS</span>
        </div>
        <div className="sidebar-subtitle">SIH 2026 • PS-26150</div>
      </div>
      <ul className="nav-links">
        {navItems.map((item) => (
          <li
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <div>System: <strong>v1.0.0-rc1</strong></div>
        <div style={{ color: 'var(--accent-green)', marginTop: '4px' }}>● Engine Online</div>
      </div>
    </aside>
  );
};
