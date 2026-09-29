import React from 'react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  progressPercent?: number;
  highlightColor?: string;
}

export const StatCard: React.FC<Props> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendPositive = true,
  progressPercent,
  highlightColor,
}) => {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 20px',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--border-medium)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {title}
        </span>
        {icon && (
          <span
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--palette-lavender)',
              border: '1px solid rgba(82, 21, 78, 0.1)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--palette-deep-purple)',
            }}
          >
            {icon}
          </span>
        )}
      </div>

      {/* Primary Value */}
      <div style={{ fontSize: '26px', fontWeight: 700, color: highlightColor || 'var(--palette-deep-navy)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
        {value}
      </div>

      {/* Subtitle & Trend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
        {trend && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: trendPositive ? 'var(--accent-green-bg)' : 'var(--accent-rose-bg)',
              color: trendPositive ? 'var(--accent-green)' : 'var(--accent-rose)',
              border: `1px solid ${trendPositive ? '#bbf7d0' : '#fecdd3'}`,
            }}
          >
            {trend}
          </span>
        )}
        {subtitle && (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {subtitle}
          </span>
        )}
      </div>

      {/* Optional Mini Progress Bar */}
      {typeof progressPercent === 'number' && (
        <div style={{ marginTop: '12px', width: '100%', height: '4px', backgroundColor: '#ECE6E5', borderRadius: '2px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, Math.max(0, progressPercent))}%`,
              backgroundColor: highlightColor || 'var(--palette-deep-purple)',
              borderRadius: '2px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      )}
    </div>
  );
};

