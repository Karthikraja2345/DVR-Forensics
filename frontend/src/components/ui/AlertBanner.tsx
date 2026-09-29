import React, { useState } from 'react';

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
      bg: 'rgba(40, 75, 99, 0.22)',
      border: 'var(--palette-yale-blue)',
      icon: '🛡️',
      accent: 'var(--accent-teal-bright)',
    },
    success: {
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.35)',
      icon: '✓',
      accent: 'var(--accent-green)',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.35)',
      icon: '⚠️',
      accent: 'var(--accent-amber)',
    },
    danger: {
      bg: 'rgba(244, 63, 94, 0.12)',
      border: 'rgba(244, 63, 94, 0.35)',
      icon: '⛔',
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
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <span style={{ fontSize: '18px' }}>{colorMap.icon}</span>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, color: 'var(--palette-white)', fontSize: '13px' }}>
              {title}
            </span>
            {badge && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'rgba(60, 110, 113, 0.3)',
                  border: '1px solid var(--palette-stormy-teal)',
                  color: 'var(--palette-white)',
                  letterSpacing: '0.04em',
                }}
              >
                {badge}
              </span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--palette-dust-grey)', marginTop: '2px' }}>
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
              backgroundColor: 'var(--palette-stormy-teal)',
              color: 'var(--palette-white)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 2px 8px rgba(60, 110, 113, 0.3)',
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
              fontSize: '15px',
              padding: '4px',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
