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
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Active File:
        </span>
        <span className="case-pill">
          <Folder size={13} style={{ color: 'var(--palette-gold)' }} />
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', color: 'var(--palette-prussian)', fontWeight: 400 }}>
            {currentCaseId}
          </span>
        </span>
        <span className="badge badge-green">
          <ShieldCheck size={12} strokeWidth={2.2} />
          WRITE-BLOCK SECURE
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              padding: '3px 9px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--palette-prussian-tint)',
              border: '1px solid rgba(20, 33, 61, 0.15)',
              color: 'var(--palette-prussian)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
            }}
          >
            ISO/IEC 27037:2012
          </span>
          <span
            style={{
              fontSize: '11px',
              padding: '3px 9px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--palette-gold-tint)',
              border: '1px solid rgba(252, 163, 17, 0.4)',
              color: '#B45309',
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
