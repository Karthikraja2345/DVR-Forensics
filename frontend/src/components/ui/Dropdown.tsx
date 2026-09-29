import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
  sub?: string;
  badge?: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

export const Dropdown: React.FC<Props> = ({ options, value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {label && (
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '8px', fontWeight: 600 }}>
          {label}
        </span>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 14px',
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--palette-white)',
          fontSize: '12px',
          fontWeight: 600,
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <span>{selected ? selected.label : 'Select...'}</span>
        {selected?.badge && (
          <span
            style={{
              fontSize: '10px',
              padding: '1px 6px',
              backgroundColor: 'rgba(60, 110, 113, 0.3)',
              color: 'var(--accent-teal-bright)',
              borderRadius: 'var(--radius-xs)',
            }}
          >
            {selected.badge}
          </span>
        )}
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 100,
            minWidth: '220px',
            backgroundColor: '#1b222a',
            border: '1px solid var(--palette-stormy-teal)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-glow-teal)',
            overflow: 'hidden',
            padding: '4px',
          }}
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: opt.value === value ? 'rgba(60, 110, 113, 0.25)' : 'transparent',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (opt.value !== value) e.currentTarget.style.backgroundColor = 'rgba(40, 75, 99, 0.3)';
              }}
              onMouseLeave={(e) => {
                if (opt.value !== value) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: opt.value === value ? 'var(--palette-white)' : 'var(--palette-dust-grey)' }}>
                  {opt.label}
                </div>
                {opt.sub && (
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {opt.sub}
                  </div>
                )}
              </div>
              {opt.value === value && (
                <span style={{ color: 'var(--accent-teal-bright)', fontSize: '12px' }}>✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
