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
      </div>

      <LineageGraph graph={graph} />
    </div>
  );
};
