import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface Props {
  md5: string;
  sha256: string;
  compact?: boolean;
}

export const HashViewer: React.FC<Props> = ({ md5, sha256, compact = false }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '4px' : '6px' }}>
      {/* SHA-256 Box */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          backgroundColor: '#F8F5F4',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xs)',
          padding: '4px 8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
          <span
            style={{
              fontSize: '9px',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: '2px',
              backgroundColor: 'var(--palette-deep-purple)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-mono)',
            }}
          >
            SHA-256
          </span>
          <span
            className="mono"
            style={{
              fontSize: '11px',
              color: 'var(--palette-deep-navy)',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={sha256}
          >
            {sha256.length > 24 ? `${sha256.substring(0, 10)}...${sha256.substring(sha256.length - 8)}` : sha256}
          </span>
        </div>
        <button
          onClick={() => handleCopy(sha256, 'sha')}
          style={{
            background: 'none',
            border: 'none',
            color: copied === 'sha' ? 'var(--accent-green)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '11px',
            fontWeight: 600,
          }}
          title="Copy full SHA-256 digest"
        >
          {copied === 'sha' ? (
            <>
              <Check size={12} color="var(--accent-green)" />
              <span style={{ color: 'var(--accent-green)' }}>Copied</span>
            </>
          ) : (
            <Copy size={12} />
          )}
        </button>
      </div>

      {/* MD5 Box */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          backgroundColor: '#F8F5F4',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xs)',
          padding: '4px 8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
          <span
            style={{
              fontSize: '9px',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: '2px',
              backgroundColor: 'var(--palette-deep-navy)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-mono)',
            }}
          >
            MD5
          </span>
          <span
            className="mono"
            style={{
              fontSize: '11px',
              color: 'var(--text-secondary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={md5}
          >
            {md5.length > 16 ? `${md5.substring(0, 8)}...${md5.substring(md5.length - 6)}` : md5}
          </span>
        </div>
        <button
          onClick={() => handleCopy(md5, 'md5')}
          style={{
            background: 'none',
            border: 'none',
            color: copied === 'md5' ? 'var(--accent-green)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '11px',
            fontWeight: 600,
          }}
          title="Copy MD5 hash"
        >
          {copied === 'md5' ? (
            <>
              <Check size={12} color="var(--accent-green)" />
              <span style={{ color: 'var(--accent-green)' }}>Copied</span>
            </>
          ) : (
            <Copy size={12} />
          )}
        </button>
      </div>
    </div>
  );
};


