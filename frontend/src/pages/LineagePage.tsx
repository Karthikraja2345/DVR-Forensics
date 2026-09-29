import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { LineageGraph as ILineageGraph } from '../types';
import { LineageGraph } from '../components/LineageGraph';

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
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            📋 Export Mermaid DAG
          </button>
          <button
            className="btn-secondary"
            onClick={() => handleExport('json')}
            disabled={exporting}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            📥 Export JSON DAG
          </button>
        </div>
      </div>

      <LineageGraph graph={graph} />
    </div>
  );
};
