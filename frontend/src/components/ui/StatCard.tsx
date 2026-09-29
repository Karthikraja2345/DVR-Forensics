import React from 'react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
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
        backgroundColor: 'var(--bg-card)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 20px',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--palette-stormy-teal)';
        e.currentTarget.style.boxShadow = 'var(--shadow-glow-teal)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
              backgroundColor: 'rgba(40, 75, 99, 0.35)',
              border: '1px solid var(--border-yale)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '15px',
            }}
          >
            {icon}
          </span>
        )}
      </div>

      {/* Primary Value */}
      <div style={{ fontSize: '26px', fontWeight: 700, color: highlightColor || 'var(--palette-white)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
        {value}
      </div>

      {/* Subtitle & Trend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
        {trend && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: trendPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              color: trendPositive ? 'var(--accent-green)' : 'var(--accent-rose)',
              border: `1px solid ${trendPositive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            }}
          >
            {trend}
          </span>
        )}
        {subtitle && (
          <span style={{ fontSize: '12px', color: 'var(--palette-dust-grey)' }}>
            {subtitle}
          </span>
        )}
      </div>

      {/* Optional Mini Progress Bar */}
      {typeof progressPercent === 'number' && (
        <div style={{ marginTop: '14px', width: '100%', height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, Math.max(0, progressPercent))}%`,
              backgroundColor: highlightColor || 'var(--palette-stormy-teal)',
              boxShadow: '0 0 8px var(--palette-stormy-teal)',
              borderRadius: '2px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      )}
    </div>
  );
};
