import React from 'react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', badge: 'Overview' },
    { id: 'cases', label: 'Case Management', icon: '📁', badge: undefined },
    { id: 'replay', label: 'Forensic Replay', icon: '📹', badge: 'Dual-Pane' },
    { id: 'recovery', label: 'Recovery Workspace', icon: '🔍', badge: 'Carving' },
    { id: 'lineage', label: 'Evidence Lineage DAG', icon: '🕸️', badge: 'Provenance' },
    { id: 'custody', label: 'Chain of Custody', icon: '⛓️', badge: 'SHA-256' },
    { id: 'matrix', label: 'OEM Coverage Matrix', icon: '🛡️', badge: '8 Vendors' },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-title">
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'var(--palette-stormy-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              boxShadow: '0 0 10px rgba(60, 110, 113, 0.5)',
            }}
          >
            🛡️
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--palette-white)', letterSpacing: '0.02em' }}>
              DVR FORENSICS
            </div>
          </div>
        </div>
        <div className="sidebar-subtitle">
          <span>● SIH 2026</span>
          <span>•</span>
          <span style={{ color: 'var(--palette-dust-grey)' }}>PS-26150</span>
        </div>
      </div>

      {/* Nav List */}
      <ul className="nav-links">
        {navItems.map((item) => (
          <li
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span style={{ fontSize: '15px' }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  padding: '1px 5px',
                  borderRadius: '3px',
                  backgroundColor: activeTab === item.id ? 'var(--palette-stormy-teal)' : 'rgba(255, 255, 255, 0.08)',
                  color: activeTab === item.id ? 'var(--palette-white)' : 'var(--text-muted)',
                }}
              >
                {item.badge}
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* System Status Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Build Version</span>
          <span style={{ color: 'var(--palette-white)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            v1.2.0-rc3
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)', fontSize: '11px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-green)', boxShadow: '0 0 6px var(--accent-green)' }} />
          <span>Local Forensic Daemon Active</span>
        </div>
      </div>
    </aside>
  );
};
