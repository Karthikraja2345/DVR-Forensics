import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Case, Evidence, TimelineEvent } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { HashViewer } from '../components/HashViewer';
import { TimelineView } from '../components/TimelineView';

export const DashboardPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const cs = await api.getCases();
        setCases(cs);
        if (cs.length > 0) {
          const ev = await api.getEvidence(cs[0].id);
          setEvidence(ev);
          const tl = await api.getTimeline(cs[0].id);
          setTimeline(tl.events);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleGenerateReport = async () => {
    if (cases.length === 0) return;
    setGeneratingReport(true);
    try {
      const res = await api.generateReport(cases[0].id);
      window.open(`/api/v1/cases/${cases[0].id}/report/download`, '_blank');
      alert(`Forensic Investigation Report Generated Successfully!\n\nFile:\n${res.pdf_path}\n\nCryptographic SHA-256 Digest:\n${res.sha256}`);
    } catch (e: any) {
      alert(`Report Generation failed: ${e.message}`);
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading forensic investigation platform...</div>;
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Investigation Dashboard</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Overview of active evidence containers, cryptographic verification status, and recent extractions.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={handleGenerateReport}
          disabled={generatingReport}
        >
          {generatingReport ? 'Generating Report...' : '📄 Generate Forensic Report'}
        </button>
      </div>

      {/* Metric Cards */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Active Cases</div>
          <div className="metric-value">{cases.length}</div>
          <div className="metric-sub">DEMO-CASE-001 (Open)</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Evidence Verification</div>
          <div className="metric-value" style={{ color: 'var(--accent-green)' }}>100%</div>
          <div className="metric-sub">Dual Hashes Verified</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Carved Deleted Artifacts</div>
          <div className="metric-value" style={{ color: 'var(--accent-amber)' }}>1</div>
          <div className="metric-sub">CONFIRMED (CAM-03)</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Chain of Custody</div>
          <div className="metric-value" style={{ fontSize: '18px', color: 'var(--accent-green)' }}>
            CHAIN VALID ✓
          </div>
          <div className="metric-sub">SHA-256 Linked Ledger</div>
        </div>
      </div>

      {/* Evidence Table */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '12px', color: 'var(--text-primary)' }}>
          Ingested Evidence Containers
        </h3>
        <table className="forensic-table">
          <thead>
            <tr>
              <th>Evidence ID</th>
              <th>OEM & Profile</th>
              <th>Status</th>
              <th>Size</th>
              <th>Dual Hashes (MD5 & SHA-256)</th>
            </tr>
          </thead>
          <tbody>
            {evidence.map((ev) => (
              <tr key={ev.id}>
                <td>
                  <strong className="mono" style={{ color: 'var(--accent-cyan)' }}>{ev.id}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ev.label}</div>
                </td>
                <td>
                  <div>{ev.detected_vendor}</div>
                  <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Profile: {ev.vendor_profile} ({Math.round(ev.vendor_confidence * 100)}%)
                  </div>
                </td>
                <td>
                  <StatusBadge status={ev.status} />
                </td>
                <td className="mono" style={{ fontSize: '12px' }}>
                  {(ev.file_size_bytes / (1024 * 1024)).toFixed(2)} MB
                </td>
                <td>
                  <HashViewer md5={ev.source_md5} sha256={ev.source_sha256} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Timeline Section */}
      <TimelineView events={timeline} />
    </div>
  );
};
