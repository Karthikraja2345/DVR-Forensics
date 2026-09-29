import React from 'react';
import {
  LayoutDashboard,
  FolderArchive,
  PlaySquare,
  Search,
  GitFork,
  Link2,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
    { id: 'cases', label: 'Case Management', icon: <FolderArchive size={17} /> },
    { id: 'replay', label: 'Forensic Replay', icon: <PlaySquare size={17} /> },
    { id: 'recovery', label: 'Recovery Workspace', icon: <Search size={17} /> },
    { id: 'lineage', label: 'Evidence Lineage DAG', icon: <GitFork size={17} /> },
    { id: 'custody', label: 'Chain of Custody', icon: <Link2 size={17} /> },
    { id: 'matrix', label: 'OEM Coverage Matrix', icon: <ShieldCheck size={17} /> },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-title">
          <div className="sidebar-logo-icon">
            <ShieldCheck size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="sidebar-brand-name">
              DVR Forensics
            </div>
            <div className="sidebar-brand-sub">
              National Forensic Core
            </div>
          </div>
        </div>
        <div className="sidebar-subtitle">
          <span>SIH 2026</span>
          <span>•</span>
          <span>PS-26150</span>
        </div>
      </div>

      {/* Nav List - Clean, no distracting badges */}
      <ul className="nav-links">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <li
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="nav-item-content">
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? 'var(--palette-gold)' : 'var(--text-muted)',
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
            </li>
          );
        })}
      </ul>

      {/* System Status Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Build Version</span>
          <span style={{ color: 'var(--palette-prussian)', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '11px' }}>
            v2.1.0-prod
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontSize: '11px', fontWeight: 500 }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-green)',
            }}
          />
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Cpu size={12} /> Forensic Daemon Active
          </span>
        </div>
      </div>
    </aside>
  );
};
