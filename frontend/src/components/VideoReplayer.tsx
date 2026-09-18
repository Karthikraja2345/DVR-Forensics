import React, { useState, useEffect } from 'react';
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [showAiOverlay, setShowAiOverlay] = useState<boolean>(true);

  const current = allClips[selectedIdx] || null;
  const duration = current ? (current.duration_seconds || 10.0) : 10.0;

  // Playback timer simulation
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return Math.min(duration, prev + 0.2 * playbackSpeed);
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, duration]);

  // Reset time on clip change
  useEffect(() => {
    setCurrentTimeSec(0);
    setIsPlaying(false);
  }, [selectedIdx]);

  if (!current) {
    return <div style={{ color: 'var(--text-muted)' }}>No evidence recordings loaded for replay.</div>;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="replay-grid">
        {/* Left Pane: Forensic Video Player Screen */}
        <div className="video-player-panel" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Top Status & Channel Tag */}
          <div style={{ position: 'absolute', top: 12, left: 16, display: 'flex', gap: '8px', zIndex: 20 }}>
            <span className="badge badge-cyan">{current.channel_id}</span>
            {current.isRecovered ? (
              <span className="badge badge-amber">RECOVERED DELETED FOOTAGE</span>
            ) : (
              <span className="badge badge-green">ALLOCATED ACTIVE STREAM</span>
            )}
            <span className="badge" style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}>
              BIT-STREAM LOCKED
            </span>
          </div>

          {/* Top Right: Real-time Device vs UTC HUD */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 16,
              zIndex: 20,
              textAlign: 'right',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              backgroundColor: 'rgba(10, 14, 23, 0.85)',
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid rgba(56, 189, 248, 0.2)',
            }}
          >
            <div style={{ color: '#94a3b8' }}>DEVICE: {current.start_time_raw}</div>
            <div style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
              UTC: {current.start_time_utc ? new Date(current.start_time_utc).toISOString().replace('.000Z', ' UTC') : 'N/A'}
            </div>
          </div>

          {/* CCTV Feed Canvas */}
          <div
            style={{
              flex: 1,
              width: '100%',
              minHeight: '340px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#04070d',
              backgroundImage: 'radial-gradient(#111c30 1px, transparent 1px)',
              backgroundSize: '16px 16px',
              color: '#38bdf8',
              fontFamily: 'var(--font-mono)',
              position: 'relative',
            }}
          >
            {/* AI Warning Banner (Only visible when AI overlay is enabled) */}
            {showAiOverlay && (
              <div
                style={{
                  position: 'absolute',
                  top: 48,
                  left: 16,
                  right: 16,
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  zIndex: 15,
                }}
              >
                <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>
                  ⚠️ AI ADVISORY OVERLAY ACTIVE • NOT PRIMARY EVIDENCE (ISO/IEC 27037 / SEC 65B)
                </div>
                <div style={{ fontSize: '10px', color: '#cbd5e1' }}>AUXILIARY DETECTIONS ONLY</div>
              </div>
            )}

            {/* AI Motion Bounding Box Mockup */}
            {showAiOverlay && (
              <div
                style={{
                  position: 'absolute',
                  top: '32%',
                  left: '26%',
                  width: '180px',
                  height: '140px',
                  border: '2px dashed #10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.25)',
                  zIndex: 10,
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#10b981',
                    color: '#000',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    display: 'inline-block',
                  }}
                >
                  PERSON (0.94) • ΔMOTION +28%
                </div>
              </div>
            )}

            {showAiOverlay && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '22%',
                  right: '20%',
                  width: '210px',
                  height: '110px',
                  border: '2px dashed #38bdf8',
                  backgroundColor: 'rgba(56, 189, 248, 0.08)',
                  boxShadow: '0 0 10px rgba(56, 189, 248, 0.25)',
                  zIndex: 10,
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#38bdf8',
                    color: '#000',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    display: 'inline-block',
                  }}
                >
                  VEHICLE (0.89) • CAR-WHITE
                </div>
              </div>
            )}

            {/* Center Video Metadata Icon */}
            <div style={{ fontSize: '48px', marginBottom: '10px', opacity: 0.85 }}>📹</div>
            <div style={{ fontSize: '15px', fontWeight: 600 }}>{current.camera_name || current.channel_id}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              STREAM ID: {current.artifact_id}
            </div>
            <div
              style={{
                marginTop: '14px',
                padding: '4px 12px',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '4px',
                fontSize: '11px',
              }}
            >
              H.264 BIT-STREAM READY • 25.0 FPS • 1920x1080 • SHA-256 VERIFIED
            </div>
          </div>

          {/* Scrubber & Playback Controls Bar */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#0a0e17',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            {/* Progress Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#94a3b8' }}>
                {formatTime(currentTimeSec)}
              </span>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={currentTimeSec}
                onChange={(e) => setCurrentTimeSec(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#94a3b8' }}>
                {formatTime(duration)}
              </span>
            </div>

            {/* Interactive Control Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => setCurrentTimeSec((prev) => Math.max(0, prev - 1.0))}
                >
                  ⏪ -1s
                </button>
                <button
                  className="btn-primary"
                  style={{ padding: '6px 16px', fontSize: '12px' }}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <button
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => setCurrentTimeSec((prev) => Math.min(duration, prev + 1.0))}
                >
                  ⏩ +1s
                </button>

                {/* Speed Selector */}
                <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                  {[0.5, 1.0, 2.0, 4.0].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '10px',
                        borderRadius: '4px',
                        backgroundColor: playbackSpeed === spd ? 'var(--accent-cyan)' : '#1e293b',
                        color: playbackSpeed === spd ? '#000' : '#cbd5e1',
                        fontWeight: 600,
                      }}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Overlay Toggle */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowAiOverlay(!showAiOverlay)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    backgroundColor: showAiOverlay ? 'rgba(245, 158, 11, 0.2)' : '#1e293b',
                    border: `1px solid ${showAiOverlay ? '#f59e0b' : '#334155'}`,
                    color: showAiOverlay ? '#f59e0b' : '#94a3b8',
                    fontWeight: 600,
                  }}
                >
                  {showAiOverlay ? '👁️ AI Vision Overlay (ON)' : '🔒 Raw Forensic View (Pure)'}
                </button>
              </div>
            </div>
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
            <span className="meta-label">Raw Hardware Clock</span>
            <span className="meta-val">{current.start_time_raw}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Normalized UTC Time</span>
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
            <div style={{ marginTop: '16px', padding: '12px', background: '#0a0e17', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
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
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginTop: '12px' }}>
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
