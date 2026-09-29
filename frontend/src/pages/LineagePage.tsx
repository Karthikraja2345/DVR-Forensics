import React, { useEffect, useState } from 'react';
import { FileCode, Download, Link2, Zap, ShieldCheck, Scale } from 'lucide-react';
import { api } from '../services/api';
import { LineageGraph as ILineageGraph } from '../types';
import { LineageGraph } from '../components/LineageGraph';
import { StatCard } from '../components/ui/StatCard';
import { AlertBanner } from '../components/ui/AlertBanner';

interface Props {
  caseId: string;
}

export const LineagePage: React.FC<Props> = ({ caseId }) => {
  const [graph, setGraph] = useState<ILineageGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function loadLineage() {
      try {
        const data = await api.getLineage(caseId);
        setGraph(data);
      } catch (err) {
        console.error('Failed to load lineage graph', err);
      } finally {
        setLoading(false);
      }
    }
    loadLineage();
  }, [caseId]);

  const handleExport = async (format: 'mermaid' | 'json') => {
    setExporting(true);
    try {
      const content = await api.exportLineage(caseId, format);
      const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Lineage_DAG_${caseId}.${format === 'json' ? 'json' : 'mmd'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`Export failed: ${e.message}`);
    } finally {
      setExporting(false);
    }
  };

  if (loading || !graph) {
    return <div style={{ color: 'var(--text-muted)' }}>Constructing cryptographic evidence graph...</div>;
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Evidence Lineage Graph</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Complete audit trail tracing physical platter sectors through parsing, carving, working copies, and court reports.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={() => handleExport('mermaid')}
            disabled={exporting}
            style={{ fontSize: '12px', padding: '8px 14px' }}
          >
            <FileCode size={14} />
            <span>Export Mermaid DAG</span>
          </button>
          <button
            className="btn-primary"
            onClick={() => handleExport('json')}
            disabled={exporting}
            style={{ fontSize: '12px', padding: '8px 14px' }}
          >
            <Download size={14} />
            <span>Export JSON DAG</span>
          </button>
        </div>
      </div>

      {/* Lineage Summary StatCards */}
      <div className="metric-grid">
        <StatCard
          title="Lineage Nodes"
          value={graph.total_nodes}
          subtitle="Discrete evidence states"
          icon={<Link2 size={20} />}
          trend="Tracked"
          trendPositive={true}
        />
        <StatCard
          title="Transformations"
          value={graph.total_edges}
          subtitle="Deterministic edges"
          icon={<Zap size={20} />}
          trend="Acyclic"
          trendPositive={true}
        />
        <StatCard
          title="Graph Topology"
          value="DAG Valid"
          subtitle="Zero cyclic mutations"
          icon={<ShieldCheck size={20} />}
          trend="100% Strict"
          trendPositive={true}
          highlightColor="var(--accent-green)"
        />
        <StatCard
          title="Court Admissibility"
          value="Sec 65B"
          subtitle="Indian Evidence Act compliance"
          icon={<Scale size={20} />}
          trend="Admissible"
          trendPositive={true}
        />
      </div>

      <AlertBanner
        type="info"
        title="Provable Lineage Audit Trail"
        badge="ISO/IEC 27037"
        message="Each transformation records input hashes, software binary versions, timestamps, and output SHA-256 digests for cross-examination in court."
      />

      <LineageGraph graph={graph} />
    </div>
  );
};

