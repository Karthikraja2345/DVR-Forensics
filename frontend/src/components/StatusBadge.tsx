import React from 'react';

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'sm' }) => {
  const s = status.toUpperCase();

  let type: 'green' | 'teal' | 'amber' | 'red' = 'red';
  let dotColor = 'var(--accent-green)';

  if (
    s === 'VALIDATED' ||
    s === 'CONFIRMED' ||
    s === 'VERIFIED' ||
    s === 'CHAIN VALID' ||
    s === 'SUCCESS' ||
    s === 'ACTIVE'
  ) {
    type = 'green';
    dotColor = 'var(--accent-green)';
  } else if (s === 'PROFILE READY' || s === 'PROBABLE' || s === 'IN_PROGRESS' || s === 'RECOVERED') {
    type = 'amber';
    dotColor = 'var(--accent-amber)';
  } else if (
    s === 'PLANNED' ||
    s === 'ACQUIRED' ||
    s === 'OPEN' ||
    s === 'ALLOCATED' ||
    s === 'BIT-STREAM LOCKED'
  ) {
    type = 'teal';
    dotColor = 'var(--palette-deep-purple)';
  } else {
    type = 'red';
    dotColor = 'var(--accent-rose)';
  }

  const badgeClass =
    type === 'green'
      ? 'badge badge-green'
      : type === 'amber'
      ? 'badge badge-amber'
      : type === 'teal'
      ? 'badge badge-cyan'
      : 'badge badge-red';

  return (
    <span
      className={badgeClass}
      style={{
        fontSize: size === 'sm' ? '11px' : '12px',
        padding: size === 'sm' ? '3px 8px' : '4px 10px',
        borderRadius: 'var(--radius-xs)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          boxShadow: `0 0 6px ${dotColor}`,
          display: 'inline-block',
        }}
      />
      <span>{status}</span>
    </span>
  );
};
