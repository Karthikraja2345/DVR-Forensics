import React, { useState } from 'react';
import { Recording, RecoveredArtifact } from '../types';
import { StatusBadge } from './StatusBadge';

interface Props {
  recordings: Recording[];
  recovered: RecoveredArtifact[];
}

export const VideoReplayer: React.FC<Props> = ({ recordings, recovered }) => {
  const allClips = [
    ...recordings.map((r) => ({ ...r, isRecovered: false })),
    ...recovered.map((rc) => ({
      ...rc,
      isRecovered: true,
      start_time_raw: rc.start_time_utc || 'N/A',
      end_time_raw: 'N/A',
      resolution: '1920x1080 (Inferred)',
      source_sector_offset: Math.floor(rc.source_byte_offset / 512),
      camera_name: `Loading Bay (Carved)`,
    })),
  ];

  const [selectedIdx, setSelectedIdx] = useState(0);
  const current = allClips[selectedIdx] || null;

  if (!current) {
    return <div style={{ color: 'var(--text-muted)' }}>No evidence recordings loaded for replay.</div>;
  }

  return (
    <div>
      <div className="replay-grid">
        {/* Left Pane: Video Player */}
        <div className="video-player-panel">
          <div style={{ position: 'absolute', top: 12, left: 16, display: 'flex', gap: '8px', zIndex: 10 }}>
            <span className="badge badge-cyan">{current.channel_id}</span>
            {current.isRecovered ? (
              <span className="badge badge-amber">RECOVERED DELETED FOOTAGE</span>
            ) : (
              <span className="badge badge-green">ALLOCATED ACTIVE STREAM</span>
            )}
          </div>

          {/* Simulated CCTV Screen Canvas */}
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#05070a',
              color: '#38bdf8',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📹</div>
            <div style={{ fontSize: '15px', fontWeight: 600 }}>{current.camera_name || current.channel_id}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              REC: {current.artifact_id}
            </div>
            <div
              style={{
                marginTop: '16px',
                padding: '6px 12px',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '4px',
                fontSize: '11px',
              }}
            >
              H.264 BIT-STREAM READY • 25.0 FPS • 1920x1080
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 16,
              right: 16,
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
            }}
          >
            <span>RAW CLOCK: {current.start_time_raw}</span>
            <span>SECTOR: 0x{current.source_sector_offset.toString(16).toUpperCase()}</span>
          </div>
        </div>

        {/* Right Pane: Forensic Metadata Inspector */}
        <div className="metadata-inspector">
          <h3 style={{ fontSize: '15px', marginBottom: '16px', color: 'var(--accent-cyan)' }}>
            Forensic Metadata Inspector
          </h3>

          <div className="meta-row">
            <span className="meta-label">Artifact ID</span>
            <span className="meta-val">{current.artifact_id}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Camera / Channel</span>
            <span className="meta-val">{current.channel_id} ({current.camera_name})</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Raw Hardware Timestamp</span>
            <span className="meta-val">{current.start_time_raw}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Normalized UTC Timestamp</span>
            <span className="meta-val" style={{ color: 'var(--accent-green)' }}>
              {current.start_time_utc ? new Date(current.start_time_utc).toUTCString() : 'N/A'}
            </span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Stream Status</span>
            <StatusBadge status={current.isRecovered ? (current as any).recovery_status : 'ALLOCATED'} />
          </div>
          <div className="meta-row">
            <span className="meta-label">Physical Sector Offset</span>
            <span className="meta-val">Sector {current.source_sector_offset} ({current.source_sector_offset * 512} bytes)</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Video Codec</span>
            <span className="meta-val">{current.codec} (Profile Baseline 3.1)</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Artifact SHA-256</span>
            <span className="meta-val" style={{ fontSize: '10px' }}>
              {current.sha256}
            </span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Artifact MD5</span>
            <span className="meta-val">{current.md5}</span>
          </div>

          {current.isRecovered && (current as any).explanation_rules && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#0a0e17', borderRadius: '4px' }}>
              <div style={{ fontSize: '11px', color: 'var(--accent-amber)', fontWeight: 600, marginBottom: '6px' }}>
                RECOVERY EXPLANATION DIAGNOSTICS:
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {(current as any).explanation_rules.rationale}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Channel Selector Bar */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
        {allClips.map((c, idx) => (
          <button
            key={c.artifact_id}
            onClick={() => setSelectedIdx(idx)}
            className={`btn-secondary ${selectedIdx === idx ? 'active' : ''}`}
            style={{
              borderColor: selectedIdx === idx ? 'var(--accent-cyan)' : 'var(--border-color)',
              minWidth: '160px',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600 }}>{c.channel_id}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{c.camera_name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
