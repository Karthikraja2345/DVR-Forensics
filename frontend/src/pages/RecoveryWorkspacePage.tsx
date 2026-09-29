import React, { useEffect, useState } from 'react';
import { Search, CheckCircle2, Wrench } from 'lucide-react';
import { api } from '../services/api';
import { RecoveredArtifact, Evidence } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { HashViewer } from '../components/HashViewer';
import { ExecutiveMetricStrip } from '../components/ui/ExecutiveMetricStrip';
import { AlertBanner } from '../components/ui/AlertBanner';

interface Props {
  caseId: string;
}

export const RecoveryWorkspacePage: React.FC<Props> = ({ caseId }) => {
  const [artifacts, setArtifacts] = useState<RecoveredArtifact[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [carving, setCarving] = useState(false);
  const [repairingId, setRepairingId] = useState<string | null>(null);
  const [repairNotes, setRepairNotes] = useState<Record<string, string>>({});

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

  const handleRepair = async (artId: string) => {
    setRepairingId(artId);
    try {
      const res = await api.repairStream(artId);
      setRepairNotes((prev) => ({
        ...prev,
        [artId]: `Repaired: ${res.repair_actions.join(', ')}`,
      }));
      alert(`Stream Repair Successful!\n\nActions:\n- ${res.repair_actions.join('\n- ')}\n\nRepaired SHA-256: ${res.repaired_sha256}`);
    } catch (e: any) {
      alert(`Repair failed: ${e.message}`);
    } finally {
      setRepairingId(null);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Scanning unallocated clusters...</div>;
  }

  const avgConfidence = artifacts.length > 0
    ? Math.round((artifacts.reduce((acc, a) => acc + a.confidence_score, 0) / artifacts.length) * 100)
    : 0;

  const totalBytesCarved = artifacts.reduce((acc, a) => acc + a.source_byte_length, 0);

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Deleted Video Recovery Workspace</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Filesystem-aware index traversal, raw H.264/H.265 NAL unit carving, and damaged GOP parameter injection.
          </p>
        </div>
        <button
          className="btn-gold"
          onClick={handleCarve}
          disabled={carving}
        >
          <Search size={14} />
          <span>{carving ? 'Carving Sectors...' : 'Trigger Deep Cluster Carve'}</span>
        </button>
      </div>

      {/* Executive Forensic Metric Ribbon */}
      <ExecutiveMetricStrip
        metrics={[
          {
            label: 'Recovered Artifacts',
            value: artifacts.length,
            annotation: 'Carved video streams',
            statusBadge: { text: '+CARVED', variant: 'gold' }
          },
          {
            label: 'Structural Confidence',
            value: `${avgConfidence}%`,
            annotation: 'NAL header validity',
            statusBadge: { text: avgConfidence >= 90 ? 'HIGH FIDELITY' : 'VALIDATED', variant: 'green' }
          },
          {
            label: 'Carved Byte Volume',
            value: `${(totalBytesCarved / (1024 * 1024)).toFixed(2)} MB`,
            annotation: 'From unallocated space',
            statusBadge: { text: 'UNALLOCATED', variant: 'blue' }
          },
          {
            label: 'Repaired Streams',
            value: Object.keys(repairNotes).length,
            annotation: 'SPS/PPS GOP injected',
            statusBadge: { text: 'PLAYABLE', variant: 'green' }
          }
        ]}
      />

      <AlertBanner
        type="warning"
        title="Zero-Platter Contamination Standard (ISO/IEC 27037)"
        badge="READ-ONLY CARVING"
        message="Recovery operates exclusively on write-blocked bitstream replicas. Missing GOP headers (SPS 0x67 / PPS 0x68) are synthesized non-destructively."
      />

      <table className="forensic-table">
        <thead>
          <tr>
            <th>Artifact ID & Channel</th>
            <th>Recovery Status</th>
            <th>Physical Sector Offset</th>
            <th>Confidence & Diagnostics</th>
            <th>Hashes</th>
            <th>Forensic Actions</th>
          </tr>
        </thead>
        <tbody>
          {artifacts.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                No carved artifacts yet. Click "Trigger Deep Cluster Carve" to inspect unallocated disk sectors.
              </td>
            </tr>
          ) : (
            artifacts.map((art) => (
              <tr key={art.id}>
                <td>
                  <strong className="mono" style={{ color: 'var(--palette-prussian)' }}>{art.artifact_id}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Channel: {art.channel_id || 'CARVED'} • Method: {art.recovery_method}
                  </div>
                  {repairNotes[art.artifact_id] && (
                    <div style={{ fontSize: '11px', color: 'var(--accent-green)', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} />
                      <span>{repairNotes[art.artifact_id]}</span>
                    </div>
                  )}
                </td>
                <td>
                  <StatusBadge status={art.recovery_status} />
                </td>
                <td className="mono" style={{ fontSize: '12px', color: 'var(--palette-prussian)' }}>
                  Offset 0x{art.source_byte_offset.toString(16).toUpperCase()} ({art.source_byte_length.toLocaleString()} B)
                </td>
                <td style={{ maxWidth: '280px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--accent-green)', fontSize: '12px' }}>
                    {Math.round(art.confidence_score * 100)}% Structural Confidence
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                    {art.explanation_rules?.rationale}
                  </div>
                </td>
                <td>
                  <HashViewer md5={art.md5} sha256={art.sha256} />
                </td>
                <td>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '6px 12px', whiteSpace: 'nowrap' }}
                    onClick={() => handleRepair(art.artifact_id)}
                    disabled={repairingId === art.artifact_id}
                  >
                    <Wrench size={12} />
                    <span>{repairingId === art.artifact_id ? 'Repairing...' : 'Repair Stream'}</span>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

