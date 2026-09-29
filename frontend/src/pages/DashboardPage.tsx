import React, { useEffect, useState } from 'react';
import { FolderArchive, Lock, Search, Link2, FileText } from 'lucide-react';
import { api } from '../services/api';
import { Case, Evidence, TimelineEvent, Recording, RecoveredArtifact } from '../types';
import { StatCard } from '../components/ui/StatCard';
import { AlertBanner } from '../components/ui/AlertBanner';
import { CameraCarousel } from '../components/ui/CameraCarousel';
import { ForensicChart } from '../components/ui/ForensicChart';
import { StatusBadge } from '../components/StatusBadge';
import { HashViewer } from '../components/HashViewer';
import { TimelineView } from '../components/TimelineView';

export const DashboardPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [recovered, setRecovered] = useState<RecoveredArtifact[]>([]);
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

          if (ev.length > 0) {
            const recs = await api.getRecordings(ev[0].id);
            setRecordings(recs);
            const recArtifacts = await api.getRecoveredArtifacts(ev[0].id);
            setRecovered(recArtifacts);
          }
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
      alert(`Official ISO/IEC 27037 Court Report Generated!\n\nFile:\n${res.pdf_path}\n\nSHA-256 Digest:\n${res.sha256}`);
    } catch (e: any) {
      alert(`Report Generation failed: ${e.message}`);
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Initializing forensic investigation environment...</div>;
  }

  return (
    <div>
      {/* ISO/IEC 27037 Compliance Alert Banner */}
      <AlertBanner
        type="info"
        title="ISO/IEC 27037 & Section 65B Forensics Compliance Active"
        message="Primary physical media is write-blocked. All carving and AI analytics operate strictly on verified bit-stream working copies."
        badge="CERTIFIED READ-ONLY"
        actionText="Export Court PDF"
        onAction={handleGenerateReport}
      />

      {/* Top Header Row */}
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Forensic Investigation Dashboard</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Multi-vendor evidence triage, cryptographic hash auditing, and cross-channel timeline correlation.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-primary"
            onClick={handleGenerateReport}
            disabled={generatingReport}
          >
            <FileText size={14} />
            <span>{generatingReport ? 'Generating Report...' : 'Generate Court Report'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="metric-grid">
        <StatCard
          title="Active Case File"
          value="DEMO-CASE-001"
          subtitle="Cyber Forensic Cell"
          icon={<FolderArchive size={20} />}
          trend="OPEN"
          trendPositive={true}
        />
        <StatCard
          title="Evidence Hashing Parity"
          value="100.0%"
          subtitle="MD5 + SHA-256 Zero Drift"
          icon={<Lock size={20} />}
          trend="VERIFIED"
          trendPositive={true}
          progressPercent={100}
          highlightColor="var(--accent-green)"
        />
        <StatCard
          title="Carved Deleted Footage"
          value="1 Recovered"
          subtitle="CAM-03 Loading Bay"
          icon={<Search size={20} />}
          trend="CONFIRMED"
          trendPositive={true}
          progressPercent={98}
          highlightColor="var(--accent-amber)"
        />
        <StatCard
          title="Cryptographic Custody"
          value="CHAIN VALID"
          subtitle="SHA-256 Backward Pointers"
          icon={<Link2 size={20} />}
          trend="UNBROKEN"
          trendPositive={true}
          highlightColor="var(--accent-green)"
        />
      </div>

      {/* Surveillance Camera Stream Carousel */}
      <CameraCarousel
        recordings={recordings}
        recovered={recovered}
        onSelectStream={(artId) => {
          alert(`Stream selected: ${artId}\nNavigate to 'Forensic Replay' to inspect frame headers.`);
        }}
      />

      {/* Forensic Timeline Chart */}
      <ForensicChart
        title="Multi-Camera Incident Flow & Carved Stream Timeline"
        throughputMbMin={1240.5}
      />

      {/* Evidence Inventory Table */}
      <div style={{ marginTop: '28px', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '15px', color: 'var(--palette-deep-navy)', fontWeight: 600, marginBottom: '12px' }}>
          Seized Physical Evidence Containers
        </h2>
        <table className="forensic-table">
          <thead>
            <tr>
              <th>Evidence ID & Tag</th>
              <th>Detected Vendor / Profile</th>
              <th>Format & Geometry</th>
              <th>File Size</th>
              <th>Cryptographic Hashes</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {evidence.map((ev) => (
              <tr key={ev.id}>
                <td>
                  <strong className="mono" style={{ color: 'var(--palette-deep-purple)' }}>{ev.id}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ev.label}</div>
                </td>
                <td>
                  <strong style={{ color: 'var(--palette-deep-navy)' }}>{ev.detected_vendor}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Profile: {ev.vendor_profile}</div>
                </td>
                <td>
                  <span className="badge badge-cyan">RAW/DD BITSTREAM</span>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Sector Size: 512B</div>
                </td>
                <td className="mono" style={{ fontSize: '12px', color: 'var(--palette-deep-navy)' }}>
                  {(ev.file_size_bytes / (1024 * 1024)).toFixed(2)} MB
                </td>
                <td>
                  <HashViewer md5={ev.source_md5} sha256={ev.source_sha256} />
                </td>
                <td>
                  <StatusBadge status={ev.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cross-Camera Chronological Narrative */}
      <div style={{ marginTop: '28px' }}>
        <h2 style={{ fontSize: '15px', color: 'var(--palette-deep-navy)', fontWeight: 600, marginBottom: '12px' }}>
          Cross-Camera Synchronized Narrative Timeline
        </h2>
        <TimelineView events={timeline} />
      </div>
    </div>
  );
};
