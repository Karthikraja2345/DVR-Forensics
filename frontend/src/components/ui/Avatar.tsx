import React from 'react';

interface Props {
  name: string;
  role: string;
  agency?: string;
  status?: 'verified' | 'online' | 'busy';
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<Props> = ({
  name,
  role,
  agency,
  status = 'verified',
  size = 'md',
}) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sizePixels = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: `${sizePixels}px`,
            height: `${sizePixels}px`,
            borderRadius: '50%',
            backgroundColor: 'var(--palette-yale-blue)',
            border: '2px solid var(--palette-stormy-teal)',
            color: 'var(--palette-white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: size === 'sm' ? '10px' : '13px',
            fontFamily: 'var(--font-mono)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {initials}
        </div>
        {status === 'verified' && (
          <span
            style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--accent-green)',
              borderRadius: '50%',
              border: '2px solid var(--bg-secondary)',
            }}
            title="Verified Forensic Examiner"
          />
        )}
      </div>

      <div style={{ lineHeight: 1.2 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--palette-white)' }}>
          {name}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--palette-dust-grey)', marginTop: '2px' }}>
          {role} {agency ? `• ${agency}` : ''}
        </div>
      </div>
    </div>
  );
};
