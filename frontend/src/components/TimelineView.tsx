import React from 'react';
import { Clock, Video, FileText } from 'lucide-react';
import { TimelineEvent } from '../types';

interface Props {
  events: TimelineEvent[];
}

export const TimelineView: React.FC<Props> = ({ events }) => {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        padding: '24px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '16px', color: 'var(--palette-deep-navy)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} style={{ color: 'var(--palette-deep-purple)' }} />
            Cross-Camera Chronological Incident Reconstruction
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Empirically synchronized timeline compensating for multi-camera sub-second clock drift (ISO/IEC 27037).
          </p>
        </div>
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--palette-lavender)',
            border: '1px solid rgba(82, 21, 78, 0.15)',
            color: 'var(--palette-deep-purple)',
            fontWeight: 600,
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
              background: 'linear-gradient(180deg, var(--palette-deep-purple) 0%, var(--palette-lavender) 100%)',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {events.map((e) => (
              <div
                key={e.id}
                style={{
                  position: 'relative',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px',
                  transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(ev) => {
                  ev.currentTarget.style.borderColor = 'var(--palette-deep-purple)';
                  ev.currentTarget.style.transform = 'translateX(4px)';
                  ev.currentTarget.style.boxShadow = 'var(--shadow-card)';
                }}
                onMouseLeave={(ev) => {
                  ev.currentTarget.style.borderColor = 'var(--border-color)';
                  ev.currentTarget.style.transform = 'translateX(0)';
                  ev.currentTarget.style.boxShadow = 'none';
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
                    backgroundColor: '#FFFFFF',
                    border: '2px solid var(--palette-deep-purple)',
                    boxShadow: '0 0 6px rgba(82, 21, 78, 0.3)',
                  }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--palette-deep-purple)',
                      }}
                    >
                      {new Date(e.timestamp_utc).toLocaleTimeString()} UTC
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--palette-lavender)',
                        border: '1px solid rgba(82, 21, 78, 0.15)',
                        color: 'var(--palette-deep-navy)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Video size={10} />
                      {e.channel_id}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--palette-deep-navy)' }}>
                      {e.camera_name}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {e.description}
                  </div>
                </div>

                <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <span
                    className="mono"
                    style={{
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      backgroundColor: 'var(--bg-primary)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-subtle)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <FileText size={10} />
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

