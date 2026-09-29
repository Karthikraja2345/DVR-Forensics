import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

interface Props {
  type?: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  message: string;
  badge?: string;
  actionText?: string;
  onAction?: () => void;
  dismissible?: boolean;
}

export const AlertBanner: React.FC<Props> = ({
  type = 'info',
  title,
  message,
  badge,
  actionText,
  onAction,
  dismissible = true,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const colorMap = {
    info: {
      bg: 'rgba(218, 224, 242, 0.4)',
      border: '#c7d2fe',
      icon: <ShieldCheck size={18} color="var(--palette-deep-purple)" />,
      accent: 'var(--palette-deep-purple)',
    },
    success: {
      bg: 'var(--accent-green-bg)',
      border: '#bbf7d0',
      icon: <CheckCircle2 size={18} color="var(--accent-green)" />,
      accent: 'var(--accent-green)',
    },
    warning: {
      bg: 'var(--accent-amber-bg)',
      border: '#fde68a',
      icon: <AlertTriangle size={18} color="var(--accent-amber)" />,
      accent: 'var(--accent-amber)',
    },
    danger: {
      bg: 'var(--accent-rose-bg)',
      border: '#fecdd3',
      icon: <AlertCircle size={18} color="var(--accent-rose)" />,
      accent: 'var(--accent-rose)',
    },
  }[type];

  return (
    <div
      style={{
        backgroundColor: colorMap.bg,
        border: `1px solid ${colorMap.border}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        marginBottom: '16px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <span style={{ display: 'flex', alignItems: 'center' }}>{colorMap.icon}</span>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, color: 'var(--palette-deep-navy)', fontSize: '13px' }}>
              {title}
            </span>
            {badge && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${colorMap.border}`,
                  color: colorMap.accent,
                  letterSpacing: '0.04em',
                }}
              >
                {badge}
              </span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {message}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {actionText && onAction && (
          <button
            onClick={onAction}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: 'var(--palette-deep-purple)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 1px 3px rgba(82, 21, 78, 0.2)',
            }}
          >
            {actionText}
          </button>
        )}
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Dismiss banner"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  );
};

