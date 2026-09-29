import React from 'react';
import { Activity } from 'lucide-react';

interface TimelinePoint {
  time: string;
  camera: string;
  activity: string;
  intensity: number; // 1 to 5
}

interface Props {
  points?: TimelinePoint[];
  title?: string;
  throughputMbMin?: number;
}

export const ForensicChart: React.FC<Props> = ({
  points,
  title = "Multi-Channel Temporal Activity & Bitstream Flow",
  throughputMbMin = 1240.5,
}) => {
  const defaultPoints: TimelinePoint[] = [
    { time: "14:31:00", camera: "CAM-01", activity: "Entrance Ingest", intensity: 2 },
    { time: "14:31:05", camera: "CAM-02", activity: "Corridor Motion", intensity: 4 },
    { time: "14:31:12", camera: "CAM-03", activity: "Carved Loading Bay", intensity: 5 },
    { time: "14:31:18", camera: "CAM-04", activity: "Perimeter Transit", intensity: 3 },
    { time: "14:31:25", camera: "CAM-05", activity: "Exit Gate Verified", intensity: 4 },
  ];
  const activePoints = points && points.length > 0 ? points : defaultPoints;

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        boxShadow: 'var(--shadow-card)',
        margin: '20px 0',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--palette-deep-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="var(--palette-deep-purple)" />
            <span>{title}</span>
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Sector read velocity: <strong style={{ color: 'var(--palette-deep-purple)' }}>{throughputMbMin.toLocaleString()} MB/min</strong> • 0 Frame Dropped
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            ● Active Stream
          </span>
          <span style={{ fontSize: '11px', color: 'var(--accent-amber)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            ● Carved Footage
          </span>
        </div>
      </div>

      {/* SVG Chart Visualization */}
      <div style={{ width: '100%', height: '110px', position: 'relative' }}>
        <svg viewBox="0 0 500 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="chartGradientLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DAE0F2" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="20" x2="500" y2="20" stroke="#ECE6E5" strokeDasharray="3 3" />
          <line x1="0" y1="50" x2="500" y2="50" stroke="#ECE6E5" strokeDasharray="3 3" />
          <line x1="0" y1="80" x2="500" y2="80" stroke="#ECE6E5" strokeDasharray="3 3" />

          {/* Area fill */}
          <path
            d="M 20 85 L 70 65 L 170 30 L 270 15 L 370 45 L 470 25 L 470 95 L 20 95 Z"
            fill="url(#chartGradientLight)"
          />

          {/* Line curve */}
          <path
            d="M 20 85 L 70 65 L 170 30 L 270 15 L 370 45 L 470 25"
            fill="none"
            stroke="var(--palette-deep-purple)"
            strokeWidth="2.5"
          />

          {/* Event Points */}
          <circle cx="20" cy="85" r="4" fill="#52154E" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="70" cy="65" r="4" fill="#52154E" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="170" cy="30" r="4" fill="#52154E" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="270" cy="15" r="5" fill="#b45309" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="370" cy="45" r="4" fill="#52154E" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="470" cy="25" r="4" fill="#15803d" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
      </div>

      {/* Axis markers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        {activePoints.map((pt, i) => (
          <span
            key={i}
            style={{
              color: pt.activity.toLowerCase().includes('carved') ? 'var(--accent-amber)' : 'var(--text-muted)',
              fontWeight: pt.activity.toLowerCase().includes('carved') ? 600 : 500,
            }}
          >
            {pt.camera} ({pt.time})
          </span>
        ))}
      </div>
    </div>
  );
};

