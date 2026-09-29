import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

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
          padding: '7px 14px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--palette-prussian)',
          fontSize: '12px',
          fontWeight: 600,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <span>{selected ? selected.label : 'Select...'}</span>
        {selected?.badge && (
          <span
            style={{
              fontSize: '10px',
              padding: '1px 6px',
              backgroundColor: 'var(--palette-prussian-tint)',
              color: 'var(--palette-prussian)',
              borderRadius: 'var(--radius-xs)',
              fontWeight: 700,
            }}
          >
            {selected.badge}
          </span>
        )}
        <ChevronDown
          size={14}
          color="var(--text-muted)"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 100,
            minWidth: '220px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-dropdown)',
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
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                backgroundColor: opt.value === value ? 'var(--palette-prussian-tint)' : 'transparent',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (opt.value !== value) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              }}
              onMouseLeave={(e) => {
                if (opt.value !== value) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: opt.value === value ? 'var(--palette-prussian)' : 'var(--palette-prussian)' }}>
                  {opt.label}
                </div>
                {opt.sub && (
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {opt.sub}
                  </div>
                )}
              </div>
              {opt.value === value && (
                <Check size={14} color="var(--palette-gold)" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

