import React, { useState } from 'react';
import { LineageGraph as ILineageGraph, LineageNode } from '../types';

interface Props {
  graph: ILineageGraph;
}

export const LineageGraph: React.FC<Props> = ({ graph }) => {
  const [activeNode, setActiveNode] = useState<LineageNode | null>(graph.nodes[0] || null);
  const [copiedSha, setCopiedSha] = useState(false);

  const handleCopySha = (sha?: string) => {
    if (!sha) return;
    navigator.clipboard.writeText(sha);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  return (
    <div className="dag-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <h3 style={{ fontSize: '16px', color: 'var(--palette-white)', fontWeight: 600 }}>
            Evidence Lineage DAG (Directed Acyclic Graph)
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Mathematical provenance tracing from raw physical platter bytes through carved NAL units to court submission.
          </p>
        </div>
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'rgba(60, 110, 113, 0.25)',
            border: '1px solid var(--palette-stormy-teal)',
            color: 'var(--accent-teal-bright)',
            fontWeight: 600,
          }}
        >
          {graph.total_nodes} Nodes • {graph.total_edges} Transformations
        </span>
      </div>

      {/* Interactive Node Flow */}
      <div className="dag-flow">
        {graph.nodes.map((node, idx) => {
          const isSelected = activeNode?.id === node.id;
          return (
            <React.Fragment key={node.id}>
              <div
                className="dag-node"
                style={{
                  borderColor: isSelected ? 'var(--palette-stormy-teal)' : 'var(--border-color)',
                  backgroundColor: isSelected ? 'rgba(60, 110, 113, 0.15)' : 'var(--bg-card-solid)',
                  boxShadow: isSelected ? 'var(--shadow-glow-teal)' : 'var(--shadow-card)',
                  cursor: 'pointer',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                }}
                onClick={() => setActiveNode(node)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '9px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: '2px',
                      backgroundColor: 'rgba(40, 75, 99, 0.4)',
                      color: 'var(--accent-teal-bright)',
                    }}
                  >
                    {node.node_type.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    #{idx + 1}
                  </span>
                </div>

                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--palette-white)', marginTop: '2px' }}>
                  {node.label}
                </div>

                <div
                  className="mono"
                  style={{
                    fontSize: '10px',
                    color: 'var(--accent-teal-bright)',
                    marginTop: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {node.sha256 ? `${node.sha256.substring(0, 14)}...` : 'Virtual Index Node'}
                </div>
              </div>

              {idx < graph.nodes.length - 1 && (
                <div
                  className="dag-arrow"
                  style={{
                    color: 'var(--palette-stormy-teal)',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ➔
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Selected Node Inspector */}
      {activeNode && (
        <div
          style={{
            marginTop: '28px',
            padding: '20px',
            backgroundColor: 'var(--bg-card-solid)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--palette-white)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔍</span> Lineage Node Inspector: <span style={{ color: 'var(--accent-teal-bright)' }}>{activeNode.label}</span>
            </h4>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--palette-dust-grey)',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              ID: {activeNode.id}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', fontSize: '12px' }}>
            <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Timestamp (UTC)</div>
              <div className="mono" style={{ color: 'var(--palette-white)', fontWeight: 600, marginTop: '2px' }}>
                {new Date(activeNode.timestamp).toUTCString()}
              </div>
            </div>

            <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Actor / Engine</div>
              <div style={{ color: 'var(--palette-white)', fontWeight: 600, marginTop: '2px' }}>
                {activeNode.actor}
              </div>
            </div>

            <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Tool / Algorithm</div>
              <div className="mono" style={{ color: 'var(--palette-white)', fontWeight: 600, marginTop: '2px' }}>
                {activeNode.tool_version}
              </div>
            </div>

            <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Stage Classification</div>
              <div style={{ color: 'var(--accent-teal-bright)', fontWeight: 600, marginTop: '2px' }}>
                {activeNode.node_type.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          </div>

          {activeNode.sha256 && (
            <div
              style={{
                marginTop: '16px',
                padding: '10px 14px',
                backgroundColor: 'rgba(40, 75, 99, 0.25)',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--palette-yale-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '8px' }}>
                  Cryptographic SHA-256 Digest:
                </span>
                <span className="mono" style={{ color: 'var(--accent-green)', fontSize: '12px', fontWeight: 600 }}>
                  {activeNode.sha256}
                </span>
              </div>
              <button
                onClick={() => handleCopySha(activeNode.sha256)}
                style={{
                  backgroundColor: 'var(--palette-stormy-teal)',
                  color: 'var(--palette-white)',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-xs)',
                }}
              >
                {copiedSha ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

