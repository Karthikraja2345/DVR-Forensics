import React from 'react';
import { TimelineEvent } from '../types';

interface Props {
  events: TimelineEvent[];
}

export const TimelineView: React.FC<Props> = ({ events }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: '24px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '16px', color: 'var(--palette-white)', fontWeight: 600 }}>
            Cross-Camera Chronological Incident Reconstruction
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Empirically synchronized timeline compensating for multi-camera sub-second clock drift (ISO/IEC 27037).
          </p>
        </div>
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'rgba(60, 110, 113, 0.25)',
            border: '1px solid var(--palette-stormy-teal)',
            color: 'var(--accent-teal-bright)',
          }}
        >
          {events.length} Events Reconstructed
        </span>
      </div>

      {events.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No timeline events recorded for this case.
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '28px' }}>
          {/* Continuous vertical connector line */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              bottom: '12px',
              left: '9px',
              width: '2px',
              background: 'linear-gradient(180deg, var(--palette-stormy-teal) 0%, var(--palette-yale-blue) 100%)',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {events.map((e) => (
              <div
                key={e.id}
                style={{
                  position: 'relative',
                  backgroundColor: 'var(--bg-card-solid)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px',
                  transition: 'border-color 0.2s ease, transform 0.2s ease',
                }}
                onMouseEnter={(ev) => {
                  ev.currentTarget.style.borderColor = 'var(--palette-stormy-teal)';
                  ev.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(ev) => {
                  ev.currentTarget.style.borderColor = 'var(--border-color)';
                  ev.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {/* Node Dot on the timeline */}
                <div
                  style={{
                    position: 'absolute',
                    top: '18px',
                    left: '-24px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-primary)',
                    border: '2px solid var(--palette-stormy-teal)',
                    boxShadow: '0 0 6px var(--palette-stormy-teal)',
                  }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--accent-teal-bright)',
                      }}
                    >
                      {new Date(e.timestamp_utc).toLocaleTimeString()} UTC
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'rgba(40, 75, 99, 0.4)',
                        border: '1px solid var(--palette-yale-blue)',
                        color: 'var(--palette-white)',
                      }}
                    >
                      {e.channel_id}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--palette-white)' }}>
                      {e.camera_name}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--palette-dust-grey)', lineHeight: 1.5 }}>
                    {e.description}
                  </div>
                </div>

                <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <span
                    className="mono"
                    style={{
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      padding: '3px 6px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    Ref: {e.source_artifact_id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

