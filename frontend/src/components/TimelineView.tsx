import React from 'react';
import { TimelineEvent } from '../types';

interface Props {
  events: TimelineEvent[];
}

export const TimelineView: React.FC<Props> = ({ events }) => {
  return (
    <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
      <h3 style={{ fontSize: '15px', color: 'var(--accent-cyan)', marginBottom: '16px' }}>
        Cross-Camera Chronological Incident Reconstruction
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {events.map((e) => (
          <div
            key={e.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '6px',
              borderLeft: '4px solid var(--accent-cyan)',
            }}
          >
            <div style={{ minWidth: '100px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-green)' }}>
              {new Date(e.timestamp_utc).toLocaleTimeString()}
            </div>
            <div style={{ minWidth: '80px' }}>
              <span className="badge badge-cyan">{e.channel_id}</span>
            </div>
            <div style={{ flex: 1, fontSize: '13px' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.camera_name}</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{e.description}</div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Ref: <span className="mono">{e.source_artifact_id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
