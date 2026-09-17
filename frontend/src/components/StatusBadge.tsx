import React from 'react';

interface Props {
  status: string;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const s = status.toUpperCase();

  if (s === 'VALIDATED' || s === 'CONFIRMED' || s === 'VERIFIED' || s === 'CHAIN VALID' || s === 'SUCCESS') {
    return <span className="badge badge-green">{status}</span>;
  }
  if (s === 'PROFILE READY' || s === 'PROBABLE' || s === 'IN_PROGRESS') {
    return <span className="badge badge-amber">{status}</span>;
  }
  if (s === 'PLANNED' || s === 'ACQUIRED' || s === 'OPEN') {
    return <span className="badge badge-cyan">{status}</span>;
  }
  return <span className="badge badge-red">{status}</span>;
};
