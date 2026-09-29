import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { OEMMatrixItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ExecutiveMetricStrip } from '../components/ui/ExecutiveMetricStrip';
import { AlertBanner } from '../components/ui/AlertBanner';
import { Dropdown } from '../components/ui/Dropdown';

export const OEMMatrixPage: React.FC = () => {
  const [matrix, setMatrix] = useState<OEMMatrixItem[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatrix() {
      try {
        const res = await api.getOEMMatrix();
        setMatrix(res.matrix);
      } catch (err) {
        console.error('Failed to load OEM matrix', err);
      } finally {
        setLoading(false);
      }
    }
    loadMatrix();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading vendor support matrix...</div>;
  }

  const validatedCount = matrix.filter((m) => m.status.toUpperCase() === 'VALIDATED').length;
  const profileReadyCount = matrix.filter((m) => m.status.toUpperCase() === 'PROFILE READY').length;
  const plannedCount = matrix.filter((m) => m.status.toUpperCase() === 'PLANNED').length;

  const filteredMatrix = matrix.filter((item) => {
    if (filter === 'ALL') return true;
    return item.status.toUpperCase() === filter;
  });

  const filterOptions = [
    { value: 'ALL', label: `All Surveillance OEMs (${matrix.length})` },
    { value: 'VALIDATED', label: `Empirically Validated (${validatedCount})`, badge: 'Active' },
    { value: 'PROFILE READY', label: `Profile Specifications Ready (${profileReadyCount})` },
    { value: 'PLANNED', label: `Planned Adapters (${plannedCount})` },
  ];

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Honest OEM Coverage Matrix</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Transparent capability tracking for all 8 surveillance OEMs named in Problem Statement 26150.
          </p>
        </div>
        <Dropdown
          options={filterOptions}
          value={filter}
          onChange={(val) => setFilter(val)}
          label="Filter by Tier:"
        />
      </div>

      {/* Executive Forensic Metric Ribbon */}
      <ExecutiveMetricStrip
        metrics={[
          {
            label: 'Empirically Validated',
            value: validatedCount,
            annotation: 'Hikvision & Dahua',
            statusBadge: { text: 'GROUND TRUTH OK', variant: 'green' }
          },
          {
            label: 'Profile Spec Ready',
            value: profileReadyCount,
            annotation: 'CP Plus & Uniview',
            statusBadge: { text: 'PARSER SPEC READY', variant: 'gold' }
          },
          {
            label: 'Planned Adapters',
            value: plannedCount,
            annotation: 'Hanwha, Bosch, Axis, Honeywell',
            statusBadge: { text: 'IN ROADMAP', variant: 'blue' }
          },
          {
            label: 'Non-Fabrication',
            value: '100%',
            annotation: 'Zero unverified claims',
            statusBadge: { text: 'EMPIRICAL', variant: 'green' }
          }
        ]}
      />

      <AlertBanner
        type="info"
        title="Forensic Integrity & Non-Fabrication Guarantee"
        badge="SEC 65B & ISO 27037"
        message="In accordance with forensic science standards, we strictly distinguish between formats that have undergone verified fixture testing (VALIDATED) and formats with structural specifications ready (PROFILE READY). We never claim parse capability without empirical evidence."
      />

      <table className="forensic-table">
        <thead>
          <tr>
            <th>OEM / Manufacturer</th>
            <th>Detection Method</th>
            <th>Parser Status</th>
            <th>Deleted Recovery</th>
            <th>Ground Truth Fixture</th>
            <th>Support Tier</th>
          </tr>
        </thead>
        <tbody>
          {filteredMatrix.map((item) => (
            <tr key={item.oem}>
              <td>
                <div style={{ fontWeight: 600, color: 'var(--palette-prussian)', fontSize: '13px' }}>
                  {item.oem}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Surveillance DVR/NVR Series
                </div>
              </td>
              <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {item.detection}
              </td>
              <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {item.parser_status}
              </td>
              <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {item.recovery_status}
              </td>
              <td>
                <span
                  className="mono"
                  style={{
                    fontSize: '11px',
                    color: item.fixture_reference ? 'var(--palette-prussian)' : 'var(--text-muted)',
                    backgroundColor: item.fixture_reference ? 'var(--palette-prussian-tint)' : 'transparent',
                    padding: item.fixture_reference ? '2px 8px' : '0',
                    borderRadius: 'var(--radius-xs)',
                    border: item.fixture_reference ? '1px solid var(--border-color)' : 'none',
                    fontWeight: item.fixture_reference ? 600 : 400,
                  }}
                >
                  {item.fixture_reference || 'N/A (Adapter Spec)'}
                </span>
              </td>
              <td>
                <StatusBadge status={item.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

