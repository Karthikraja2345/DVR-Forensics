import React, { useRef } from 'react';
import { Recording, RecoveredArtifact } from '../../types';

interface Props {
  recordings: Recording[];
  recovered: RecoveredArtifact[];
  onSelectStream: (artifactId: string) => void;
}

export const CameraCarousel: React.FC<Props> = ({ recordings, recovered, onSelectStream }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const streams = [
    ...recordings.map((r) => ({
      id: r.artifact_id,
      channel: r.channel_id,
      name: r.camera_name,
      start: r.start_time_raw,
      duration: `${r.duration_seconds}s`,
      isRecovered: false,
      codec: r.codec || 'H.264',
      status: 'ALLOCATED',
    })),
    ...recovered.map((rc) => ({
      id: rc.artifact_id,
      channel: rc.channel_id || 'CARVED',
      name: 'Unallocated Cluster Stream',
      start: rc.start_time_utc ? new Date(rc.start_time_utc).toISOString().slice(11, 19) + ' UTC' : 'Recovered',
      duration: `${rc.duration_seconds}s`,
      isRecovered: true,
      codec: rc.codec || 'H.264',
      status: rc.recovery_status || 'CONFIRMED',
    })),
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ position: 'relative', margin: '16px 0 24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h2 style={{ fontSize: '15px', color: 'var(--palette-white)', fontWeight: 600 }}>
            Surveillance Stream Carousel
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Active channel feeds and carved unallocated footage ready for forensic playback.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => scroll('left')}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: 'var(--radius-sm)' }}
          >
            ← Prev
          </button>
          <button
            onClick={() => scroll('right')}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: 'var(--radius-sm)' }}
          >
            Next →
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '14px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
        }}
      >
        {streams.map((s) => (
          <div
            key={s.id}
            style={{
              minWidth: '280px',
              maxWidth: '280px',
              backgroundColor: 'var(--bg-card)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: `1px solid ${s.isRecovered ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              scrollSnapAlign: 'start',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = s.isRecovered ? 'var(--accent-amber)' : 'var(--palette-stormy-teal)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = s.isRecovered ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-color)';
            }}
          >
            {/* Top row */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: s.isRecovered ? 'rgba(245, 158, 11, 0.2)' : 'rgba(60, 110, 113, 0.25)',
                    color: s.isRecovered ? 'var(--accent-amber)' : 'var(--accent-teal-bright)',
                    border: `1px solid ${s.isRecovered ? 'rgba(245, 158, 11, 0.4)' : 'var(--palette-stormy-teal)'}`,
                  }}
                >
                  {s.channel}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {s.codec} • 1080P
                </span>
              </div>

              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--palette-white)', marginBottom: '4px' }}>
                {s.name}
              </div>

              <div style={{ fontSize: '11px', color: 'var(--palette-dust-grey)', marginBottom: '8px' }}>
                Clock: <span className="mono">{s.start}</span> ({s.duration})
              </div>
            </div>

            {/* Bottom action button */}
            <button
              onClick={() => onSelectStream(s.id)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: s.isRecovered ? 'rgba(245, 158, 11, 0.2)' : 'rgba(40, 75, 99, 0.4)',
                border: `1px solid ${s.isRecovered ? 'var(--accent-amber)' : 'var(--palette-yale-blue)'}`,
                color: s.isRecovered ? 'var(--accent-amber)' : 'var(--palette-white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>📹 Inspect Stream</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
