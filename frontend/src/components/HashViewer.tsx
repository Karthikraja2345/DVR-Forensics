import React, { useState } from 'react';

interface Props {
  md5: string;
  sha256: string;
}

export const HashViewer: React.FC<Props> = ({ md5, sha256 }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SHA256:</span>
        <span className="mono" style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>
          {sha256.substring(0, 16)}...{sha256.substring(48)}
        </span>
        <button
          onClick={() => handleCopy(sha256, 'sha')}
          style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '11px' }}
        >
          {copied === 'sha' ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MD5:</span>
        <span className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          {md5}
        </span>
        <button
          onClick={() => handleCopy(md5, 'md5')}
          style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '11px' }}
        >
          {copied === 'md5' ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
};
