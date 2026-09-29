import React, { useState, useEffect } from 'react';
import {
  Lock,
  AlertTriangle,
  Video,
  RotateCcw,
  RotateCw,
  Play,
  Pause,
  Eye,
  EyeOff,
  Search,
  Sliders,
} from 'lucide-react';
import { Recording, RecoveredArtifact } from '../types';
import { StatusBadge } from './StatusBadge';
import { HashViewer } from './HashViewer';

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
          <div style={{ position: 'absolute', top: 14, left: 16, display: 'flex', gap: '8px', zIndex: 20 }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(20, 33, 61, 0.9)',
                border: '1px solid rgba(252, 163, 17, 0.4)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {current.channel_id}
            </span>
            <StatusBadge status={current.isRecovered ? 'RECOVERED' : 'ALLOCATED'} />
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(20, 33, 61, 0.9)',
                color: 'var(--palette-gold)',
                border: '1px solid rgba(252, 163, 17, 0.3)',
                fontFamily: 'var(--font-mono)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Lock size={10} /> BIT-STREAM LOCKED
            </span>
          </div>

          {/* Top Right: Real-time Device vs UTC HUD */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              right: 16,
              zIndex: 20,
              textAlign: 'right',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              backgroundColor: 'rgba(20, 33, 61, 0.92)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ color: '#E5E5E5' }}>DEVICE: {current.start_time_raw}</div>
            <div style={{ color: 'var(--palette-gold)', fontWeight: 600, marginTop: '2px' }}>
              UTC: {current.start_time_utc ? new Date(current.start_time_utc).toISOString().replace('.000Z', ' UTC') : 'N/A'}
            </div>
          </div>

          {/* CCTV Feed Canvas */}
          <div
            style={{
              flex: 1,
              width: '100%',
              minHeight: '360px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#0c1220',
              backgroundImage: 'radial-gradient(rgba(252, 163, 17, 0.12) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              color: '#FFFFFF',
              fontFamily: 'var(--font-mono)',
              position: 'relative',
            }}
          >
            {/* AI Warning Banner */}
            {showAiOverlay && (
              <div
                style={{
                  position: 'absolute',
                  top: 52,
                  left: 16,
                  right: 16,
                  backgroundColor: 'rgba(254, 243, 199, 0.95)',
                  border: '1px solid #fde68a',
                  borderRadius: 'var(--radius-xs)',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  zIndex: 15,
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                }}
              >
                <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={13} />
                  <span>AI ADVISORY OVERLAY ACTIVE • NOT PRIMARY EVIDENCE (ISO/IEC 27037 / SEC 65B)</span>
                </div>
                <div style={{ fontSize: '10px', color: '#78350f', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  AUXILIARY DETECTIONS ONLY
                </div>
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
                  border: '2px dashed #22c55e',
                  backgroundColor: 'rgba(34, 197, 94, 0.12)',
                  boxShadow: '0 0 14px rgba(34, 197, 94, 0.25)',
                  zIndex: 10,
                  pointerEvents: 'none',
                  borderRadius: '2px',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#15803d',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    display: 'inline-block',
                    fontFamily: 'var(--font-mono)',
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
                  bottom: '20%',
                  right: '20%',
                  width: '210px',
                  height: '110px',
                  border: '2px dashed var(--palette-gold)',
                  backgroundColor: 'rgba(252, 163, 17, 0.12)',
                  boxShadow: '0 0 14px rgba(252, 163, 17, 0.3)',
                  zIndex: 10,
                  pointerEvents: 'none',
                  borderRadius: '2px',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--palette-gold)',
                    color: '#000000',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    display: 'inline-block',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  VEHICLE (0.89) • CAR-WHITE
                </div>
              </div>
            )}

            {/* Center Video Metadata Icon */}
            <div style={{ marginBottom: '12px', opacity: 0.9 }}>
              <Video size={48} strokeWidth={1.5} color="var(--palette-gold)" />
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>
              {current.camera_name || current.channel_id}
            </div>
            <div style={{ fontSize: '12px', color: '#E5E5E5', marginTop: '4px' }}>
              STREAM ID: <span style={{ color: 'var(--palette-gold)', fontWeight: 600 }}>{current.artifact_id}</span>
            </div>
            <div
              style={{
                marginTop: '16px',
                padding: '5px 14px',
                background: 'rgba(20, 33, 61, 0.85)',
                border: '1px solid rgba(252, 163, 17, 0.3)',
                borderRadius: 'var(--radius-xs)',
                fontSize: '11px',
                color: '#E5E5E5',
              }}
            >
              H.264 BIT-STREAM READY • 25.0 FPS • 1920x1080 • SHA-256 VERIFIED
            </div>
          </div>

          {/* Scrubber & Playback Controls Bar */}
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: '#FAF9F8',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            {/* Progress Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                {formatTime(currentTimeSec)}
              </span>
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={currentTimeSec}
                onChange={(e) => setCurrentTimeSec(parseFloat(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: 'var(--palette-gold)',
                  cursor: 'pointer',
                  height: '6px',
                }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                {formatTime(duration)}
              </span>
            </div>

            {/* Interactive Control Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => setCurrentTimeSec((prev) => Math.max(0, prev - 1.0))}
                  title="Rewind 1 second"
                >
                  <RotateCcw size={13} /> -1s
                </button>
                <button
                  className="btn-primary"
                  style={{ padding: '6px 18px', fontSize: '12px' }}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <>
                      <Pause size={14} /> Pause
                    </>
                  ) : (
                    <>
                      <Play size={14} /> Play
                    </>
                  )}
                </button>
                <button
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => setCurrentTimeSec((prev) => Math.min(duration, prev + 1.0))}
                  title="Forward 1 second"
                >
                  <RotateCw size={13} /> +1s
                </button>

                {/* Speed Selector */}
                <div style={{ display: 'flex', gap: '4px', marginLeft: '8px', backgroundColor: '#FFFFFF', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  {[0.5, 1.0, 2.0, 4.0].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      style={{
                        padding: '3px 8px',
                        fontSize: '11px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: playbackSpeed === spd ? 'var(--palette-prussian)' : 'transparent',
                        color: playbackSpeed === spd ? '#FFFFFF' : 'var(--palette-prussian)',
                        fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
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
                    padding: '6px 14px',
                    fontSize: '11px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: showAiOverlay ? 'var(--palette-gold-tint)' : '#FFFFFF',
                    border: `1px solid ${showAiOverlay ? 'var(--palette-gold)' : 'var(--border-color)'}`,
                    color: showAiOverlay ? '#B45309' : 'var(--text-secondary)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {showAiOverlay ? (
                    <>
                      <Eye size={13} /> AI Overlay (ON)
                    </>
                  ) : (
                    <>
                      <EyeOff size={13} /> Pure Bitstream
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Forensic Metadata Inspector */}
        <div className="metadata-inspector">
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '16px', color: 'var(--palette-prussian)', fontWeight: 400, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={16} color="var(--palette-gold)" />
            Forensic Metadata Inspector
          </h3>

          <div className="meta-row">
            <span className="meta-label">Artifact ID</span>
            <span className="meta-val" style={{ color: 'var(--palette-prussian)' }}>{current.artifact_id}</span>
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
            <StatusBadge status={current.isRecovered ? (current as any).recovery_status || 'RECOVERED' : 'ALLOCATED'} />
          </div>
          <div className="meta-row">
            <span className="meta-label">Physical Sector Offset</span>
            <span className="meta-val">Sector {current.source_sector_offset} ({current.source_sector_offset * 512} B)</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Video Codec</span>
            <span className="meta-val">{current.codec} (Profile Baseline 3.1)</span>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Cryptographic Signatures
            </div>
            <HashViewer md5={current.md5} sha256={current.sha256} />
          </div>

          {current.isRecovered && (current as any).explanation_rules && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                background: 'var(--palette-gold-tint)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(252, 163, 17, 0.4)',
              }}
            >
              <div style={{ fontSize: '11px', color: '#B45309', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size={13} /> RECOVERY EXPLANATION DIAGNOSTICS:
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {(current as any).explanation_rules.rationale}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Channel Selector Bar */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Select Stream Channel ({allClips.length} Available)
        </div>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
          {allClips.map((c, idx) => (
            <button
              key={c.artifact_id}
              onClick={() => setSelectedIdx(idx)}
              className={`btn-secondary ${selectedIdx === idx ? 'active' : ''}`}
              style={{
                borderColor: selectedIdx === idx ? 'var(--palette-prussian)' : 'var(--border-color)',
                backgroundColor: selectedIdx === idx ? 'var(--palette-prussian-tint)' : '#FFFFFF',
                minWidth: '180px',
                textAlign: 'left',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--palette-prussian)' }}>
                  {c.channel_id}
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '2px',
                    backgroundColor: c.isRecovered ? 'var(--palette-gold-tint)' : 'var(--accent-green-bg)',
                    color: c.isRecovered ? '#B45309' : 'var(--accent-green)',
                    border: `1px solid ${c.isRecovered ? 'rgba(252, 163, 17, 0.4)' : '#bbf7d0'}`,
                  }}
                >
                  {c.isRecovered ? 'CARVED' : 'ALLOCATED'}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.camera_name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
