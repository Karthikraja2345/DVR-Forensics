import React, { useState } from 'react';
import { LineageGraph as ILineageGraph, LineageNode } from '../types';

interface Props {
  graph: ILineageGraph;
}

export const LineageGraph: React.FC<Props> = ({ graph }) => {
  const [activeNode, setActiveNode] = useState<LineageNode | null>(graph.nodes[0] || null);

  return (
    <div className="dag-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '16px', color: 'var(--accent-cyan)' }}>Evidence Lineage DAG (Directed Acyclic Graph)</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Traceable cryptographic provenance from physical DVR platter sectors to court-ready forensic report.
          </p>
        </div>
        <span className="badge badge-cyan">{graph.total_nodes} Nodes • {graph.total_edges} Transformations</span>
      </div>

      {/* Interactive Node Flow */}
      <div className="dag-flow">
        {graph.nodes.map((node, idx) => (
          <React.Fragment key={node.id}>
            <div
              className="dag-node"
              style={{
                borderColor: activeNode?.id === node.id ? 'var(--accent-cyan)' : 'var(--border-color)',
                cursor: 'pointer',
              }}
              onClick={() => setActiveNode(node)}
            >
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {node.node_type.replace('_', ' ')}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                {node.label}
              </div>
              <div
                className="mono"
                style={{
                  fontSize: '10px',
                  color: 'var(--accent-cyan)',
                  marginTop: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {node.sha256 ? `${node.sha256.substring(0, 16)}...` : 'N/A (Virtual Index)'}
              </div>
            </div>

            {idx < graph.nodes.length - 1 && <div className="dag-arrow">➔</div>}
          </React.Fragment>
        ))}
      </div>

      {/* Selected Node Inspector */}
      {activeNode && (
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '13px', color: 'var(--accent-cyan)', marginBottom: '8px' }}>
            Node Inspector: {activeNode.label}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '12px' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Node ID: </span>
              <span className="mono">{activeNode.id}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Timestamp: </span>
              <span className="mono">{new Date(activeNode.timestamp).toLocaleString()}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Actor / Engine: </span>
              <span>{activeNode.actor}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Tool Version: </span>
              <span className="mono">{activeNode.tool_version}</span>
            </div>
          </div>
          {activeNode.sha256 && (
            <div style={{ marginTop: '10px', fontSize: '11px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Cryptographic SHA-256 Digest: </span>
              <span className="mono" style={{ color: 'var(--accent-green)' }}>{activeNode.sha256}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
