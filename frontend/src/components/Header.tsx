import React from 'react';
import { Folder, ShieldCheck } from 'lucide-react';
import { Avatar } from './ui/Avatar';

interface Props {
  currentCaseId: string;
}

export const Header: React.FC<Props> = ({ currentCaseId }) => {
  return (
    <header className="top-header">
      <div className="header-case-badge">
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Active Case:
        </span>
        <span className="case-pill">
          <Folder size={13} style={{ color: 'var(--palette-deep-purple)' }} />
          <span>{currentCaseId}</span>
        </span>
        <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={12} strokeWidth={2.2} />
          WRITE-BLOCK SECURE
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--palette-lavender)',
              border: '1px solid rgba(82, 21, 78, 0.15)',
              color: 'var(--palette-deep-navy)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
            }}
          >
            ISO/IEC 27037:2012
          </span>
          <span
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-petal-tint)',
              border: '1px solid rgba(82, 21, 78, 0.18)',
              color: 'var(--palette-deep-purple)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
            }}
          >
            SEC 65B / 63 BSA
          </span>
        </div>

        <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-color)' }} />

        <Avatar
          name="Insp. Rajesh Kumar"
          role="Lead Cyber Examiner"
          agency="State Forensic Science Lab"
          status="verified"
          size="sm"
        />
      </div>
    </header>
  );
};
