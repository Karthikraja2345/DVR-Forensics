import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { RecoveredArtifact, Evidence } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { HashViewer } from '../components/HashViewer';

interface Props {
  caseId: string;
}

export const RecoveryWorkspacePage: React.FC<Props> = ({ caseId }) => {
  const [artifacts, setArtifacts] = useState<RecoveredArtifact[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [carving, setCarving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const evList = await api.getEvidence(caseId);
        setEvidence(evList);
        if (evList.length > 0) {
          const recs = await api.getRecoveredArtifacts(evList[0].id);
          setArtifacts(recs);
        }
      } catch (err) {
        console.error('Failed to load recovery artifacts', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [caseId]);

  const handleCarve = async () => {
    if (evidence.length === 0) return;
    setCarving(true);
    try {
      const res = await api.triggerRecovery(evidence[0].id);
      alert(`Carving Complete: ${res.recovered_count} deleted artifacts recovered!`);
      const updated = await api.getRecoveredArtifacts(evidence[0].id);
      setArtifacts(updated);
    } catch (e: any) {
      alert(`Carving failed: ${e.message}`);
    } finally {
      setCarving(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Scanning unallocated clusters...</div>;
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Deleted Video Recovery Workspace</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Filesystem-aware index traversal and raw H.264/H.265 NAL unit carving with explainable confidence scoring.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={handleCarve}
          disabled={carving}
        >
          {carving ? 'Carving Sectors...' : '🔍 Trigger Deep Cluster Carve'}
        </button>
      </div>

      <table className="forensic-table">
        <thead>
          <tr>
            <th>Artifact ID & Channel</th>
            <th>Recovery Status</th>
            <th>Physical Sector Offset</th>
            <th>Confidence & Explanation</th>
            <th>Hashes</th>
          </tr>
        </thead>
        <tbody>
          {artifacts.map((art) => (
            <tr key={art.id}>
              <td>
                <strong className="mono" style={{ color: 'var(--accent-cyan)' }}>{art.artifact_id}</strong>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Channel: {art.channel_id || 'CARVED'} • Method: {art.recovery_method}
                </div>
              </td>
              <td>
                <StatusBadge status={art.recovery_status} />
              </td>
              <td className="mono" style={{ fontSize: '12px' }}>
                Offset 0x{art.source_byte_offset.toString(16).toUpperCase()} ({art.source_byte_length.toLocaleString()} B)
              </td>
              <td style={{ maxWidth: '300px' }}>
                <div style={{ fontWeight: 600, color: 'var(--accent-green)', fontSize: '12px' }}>
                  {Math.round(art.confidence_score * 100)}% Structural Confidence
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {art.explanation_rules?.rationale}
                </div>
              </td>
              <td>
                <HashViewer md5={art.md5} sha256={art.sha256} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
