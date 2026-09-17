import React from 'react';

interface Props {
  currentCaseId: string;
}

export const Header: React.FC<Props> = ({ currentCaseId }) => {
  return (
    <header className="top-header">
      <div className="header-case-badge">
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ACTIVE CASE:</span>
        <span className="case-pill">{currentCaseId}</span>
        <span className="badge badge-green">CHAIN VALID ✓</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Examiner: <strong style={{ color: 'var(--text-primary)' }}>Insp. Rajesh Kumar</strong>
        </span>
        <span className="badge badge-cyan">ISO/IEC 27037</span>
      </div>
    </header>
  );
};
