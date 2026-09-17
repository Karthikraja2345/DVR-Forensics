import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { OEMMatrixItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const OEMMatrixPage: React.FC = () => {
  const [matrix, setMatrix] = useState<OEMMatrixItem[]>([]);
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

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Honest OEM Coverage Matrix</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Transparent status tracking for all 8 surveillance OEMs named in Problem Statement 26150.
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', borderLeft: '4px solid var(--accent-cyan)' }}>
        <h4 style={{ fontSize: '13px', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
          Forensic Integrity & Non-Fabrication Guarantee
        </h4>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          In accordance with digital forensics standards, we strictly distinguish between formats that have undergone
          <strong> verified fixture testing (VALIDATED)</strong>, formats with <strong>structural specifications ready (PROFILE READY)</strong>,
          and future adapters <strong>(PLANNED)</strong>. We never claim full parse capability without empirical test results.
        </p>
      </div>

      <table className="forensic-table">
        <thead>
          <tr>
            <th>OEM / Manufacturer</th>
            <th>Detection Method</th>
            <th>Parser Status</th>
            <th>Deleted Recovery</th>
            <th>Ground Truth Fixture</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {matrix.map((item) => (
            <tr key={item.oem}>
              <td style={{ fontWeight: 600 }}>{item.oem}</td>
              <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.detection}</td>
              <td style={{ fontSize: '12px' }}>{item.parser_status}</td>
              <td style={{ fontSize: '12px' }}>{item.recovery_status}</td>
              <td className="mono" style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>
                {item.fixture_reference || 'N/A (Adapter Spec)'}
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
