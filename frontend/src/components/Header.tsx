import React from 'react';
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
          📁 {currentCaseId}
        </span>
        <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-green)' }} />
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
              backgroundColor: 'rgba(40, 75, 99, 0.35)',
              border: '1px solid var(--border-yale)',
              color: 'var(--palette-white)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ISO/IEC 27037:2012
          </span>
          <span
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'rgba(60, 110, 113, 0.25)',
              border: '1px solid var(--palette-stormy-teal)',
              color: 'var(--accent-teal-bright)',
              fontFamily: 'var(--font-mono)',
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
