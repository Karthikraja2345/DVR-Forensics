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
            backgroundColor: 'var(--palette-lavender)',
            border: '1px solid rgba(82, 21, 78, 0.2)',
            color: 'var(--palette-deep-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: size === 'sm' ? '10px' : '13px',
            fontFamily: 'var(--font-mono)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {initials}
        </div>
        {status === 'verified' && (
          <span
            style={{
              position: 'absolute',
              bottom: '-1px',
              right: '-1px',
              width: '10px',
              height: '10px',
              backgroundColor: 'var(--accent-green)',
              borderRadius: '50%',
              border: '2px solid #FFFFFF',
            }}
            title="Verified Forensic Examiner"
          />
        )}
      </div>

      <div style={{ lineHeight: 1.2 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--palette-deep-navy)' }}>
          {name}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {role} {agency ? `• ${agency}` : ''}
        </div>
      </div>
    </div>
  );
};

