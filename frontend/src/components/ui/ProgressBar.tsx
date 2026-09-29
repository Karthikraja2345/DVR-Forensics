import React from 'react';

interface Props {
  value: number; // 0 to 100
  label?: string;
  sublabel?: string;
  color?: string;
  height?: number;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<Props> = ({
  value,
  label,
  sublabel,
  color = 'var(--palette-stormy-teal)',
  height = 8,
  showPercentage = true,
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div style={{ width: '100%', margin: '8px 0' }}>
      {(label || showPercentage) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <div>
            {label && (
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--palette-white)' }}>
                {label}
              </span>
            )}
            {sublabel && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                {sublabel}
              </span>
            )}
          </div>
          {showPercentage && (
            <span style={{ fontSize: '11px', fontWeight: 700, color: color, fontFamily: 'var(--font-mono)' }}>
              {clamped.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: `${height / 2}px`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clamped}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`,
            borderRadius: `${height / 2}px`,
            transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </div>
  );
};
