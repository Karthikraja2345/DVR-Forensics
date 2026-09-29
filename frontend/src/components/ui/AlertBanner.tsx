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
      bg: '#FFFFFF',
      border: 'var(--border-color)',
      icon: <ShieldCheck size={18} color="var(--palette-gold)" />,
      accent: 'var(--palette-prussian)',
      badgeBg: 'var(--palette-gold-tint)',
      badgeColor: '#B45309',
      badgeBorder: 'rgba(252, 163, 17, 0.35)',
    },
    success: {
      bg: 'var(--accent-green-bg)',
      border: '#bbf7d0',
      icon: <CheckCircle2 size={18} color="var(--accent-green)" />,
      accent: 'var(--accent-green)',
      badgeBg: '#FFFFFF',
      badgeColor: 'var(--accent-green)',
      badgeBorder: '#bbf7d0',
    },
    warning: {
      bg: 'var(--accent-amber-bg)',
      border: '#fde68a',
      icon: <AlertTriangle size={18} color="var(--accent-amber)" />,
      accent: 'var(--accent-amber)',
      badgeBg: '#FFFFFF',
      badgeColor: 'var(--accent-amber)',
      badgeBorder: '#fde68a',
    },
    danger: {
      bg: 'var(--accent-rose-bg)',
      border: '#fecdd3',
      icon: <AlertCircle size={18} color="var(--accent-rose)" />,
      accent: 'var(--accent-rose)',
      badgeBg: '#FFFFFF',
      badgeColor: 'var(--accent-rose)',
      badgeBorder: '#fecdd3',
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
        marginBottom: '20px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <span style={{ display: 'flex', alignItems: 'center' }}>{colorMap.icon}</span>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, color: 'var(--palette-prussian)', fontSize: '13px' }}>
              {title}
            </span>
            {badge && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: colorMap.badgeBg,
                  border: `1px solid ${colorMap.badgeBorder}`,
                  color: colorMap.badgeColor,
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
            className="btn-primary"
            style={{
              padding: '6px 14px',
              fontSize: '11px',
              fontWeight: 600,
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
