import React from 'react';

export interface MetricItem {
  label: string;
  value: string | number;
  annotation?: string;
  statusBadge?: {
    text: string;
    variant: 'gold' | 'green' | 'blue' | 'neutral';
  };
}

interface Props {
  metrics: MetricItem[];
}

export const ExecutiveMetricStrip: React.FC<Props> = ({ metrics }) => {
  return (
    <div className="executive-metric-strip">
      {metrics.map((item, idx) => (
        <div key={idx} className="metric-strip-item">
          <div className="metric-strip-label">
            {item.label}
          </div>
          <div className="metric-strip-value">
            {item.value}
          </div>
          <div className="metric-strip-footer">
            {item.statusBadge && (
              <span className={`status-pip status-pip-${item.statusBadge.variant}`}>
                <span className="status-pip-dot" />
                {item.statusBadge.text}
              </span>
            )}
            {item.annotation && (
              <span className="metric-strip-annotation">
                {item.annotation}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
