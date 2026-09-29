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
  badge?: string;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, badge: 'Overview' },
    { id: 'cases', label: 'Case Management', icon: <FolderArchive size={18} />, badge: undefined },
    { id: 'replay', label: 'Forensic Replay', icon: <PlaySquare size={18} />, badge: 'Dual-Pane' },
    { id: 'recovery', label: 'Recovery Workspace', icon: <Search size={18} />, badge: 'Carving' },
    { id: 'lineage', label: 'Evidence Lineage DAG', icon: <GitFork size={18} />, badge: 'Provenance' },
    { id: 'custody', label: 'Chain of Custody', icon: <Link2 size={18} />, badge: 'SHA-256' },
    { id: 'matrix', label: 'OEM Coverage Matrix', icon: <ShieldCheck size={18} />, badge: '8 Vendors' },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-title">
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--palette-deep-purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(82, 21, 78, 0.25)',
            }}
          >
            <ShieldCheck size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--palette-deep-navy)', letterSpacing: '0.01em' }}>
              DVR FORENSICS
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>
              ENTERPRISE PLATFORM
            </div>
          </div>
        </div>
        <div className="sidebar-subtitle">
          <span>SIH 2026</span>
          <span>•</span>
          <span>PS-26150</span>
        </div>
      </div>

      {/* Nav List */}
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
                    color: isActive ? 'var(--palette-deep-purple)' : 'var(--text-muted)',
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    backgroundColor: isActive ? 'var(--palette-deep-purple)' : 'var(--palette-lavender)',
                    color: isActive ? '#FFFFFF' : 'var(--palette-deep-navy)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {/* System Status Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Build Version</span>
          <span style={{ color: 'var(--palette-deep-navy)', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '11px' }}>
            v2.1.0-prod
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontSize: '11px', fontWeight: 500 }}>
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-green)',
              boxShadow: '0 0 6px rgba(21, 128, 61, 0.4)',
            }}
          />
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Cpu size={12} /> Local Forensic Daemon Active
          </span>
        </div>
      </div>
    </aside>
  );
};
