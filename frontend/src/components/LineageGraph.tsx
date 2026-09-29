import React, { useState } from 'react';
import { ArrowRight, Copy, Check, Search } from 'lucide-react';
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
          <h3 style={{ fontSize: '16px', color: 'var(--palette-deep-navy)', fontWeight: 600 }}>
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
            padding: '3px 10px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--palette-lavender)',
            border: '1px solid rgba(82, 21, 78, 0.15)',
            color: 'var(--palette-deep-purple)',
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
                  borderColor: isSelected ? 'var(--palette-deep-purple)' : 'var(--border-color)',
                  backgroundColor: isSelected ? 'rgba(82, 21, 78, 0.05)' : '#FFFFFF',
                  boxShadow: isSelected ? '0 0 0 2px var(--palette-deep-purple), var(--shadow-card)' : 'var(--shadow-card)',
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
                      padding: '2px 6px',
                      borderRadius: '3px',
                      backgroundColor: 'var(--palette-lavender)',
                      color: 'var(--palette-deep-purple)',
                    }}
                  >
                    {node.node_type.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    #{idx + 1}
                  </span>
                </div>

                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--palette-deep-navy)', marginTop: '2px' }}>
                  {node.label}
                </div>

                <div
                  className="mono"
                  style={{
                    fontSize: '10px',
                    color: 'var(--palette-deep-purple)',
                    marginTop: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: 600,
                  }}
                >
                  {node.sha256 ? `${node.sha256.substring(0, 14)}...` : 'Virtual Index Node'}
                </div>
              </div>

              {idx < graph.nodes.length - 1 && (
                <div
                  className="dag-arrow"
                  style={{
                    color: 'var(--palette-deep-purple)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ArrowRight size={18} strokeWidth={2.5} />
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
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--palette-deep-navy)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={15} style={{ color: 'var(--palette-deep-purple)' }} />
              <span>Lineage Node Inspector:</span>
              <span style={{ color: 'var(--palette-deep-purple)' }}>{activeNode.label}</span>
            </h4>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-secondary)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              ID: {activeNode.id}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', fontSize: '12px' }}>
            <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Timestamp (UTC)</div>
              <div className="mono" style={{ color: 'var(--palette-deep-navy)', fontWeight: 600, marginTop: '2px' }}>
                {new Date(activeNode.timestamp).toUTCString()}
              </div>
            </div>

            <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Actor / Engine</div>
              <div style={{ color: 'var(--palette-deep-navy)', fontWeight: 600, marginTop: '2px' }}>
                {activeNode.actor}
              </div>
            </div>

            <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Tool / Algorithm</div>
              <div className="mono" style={{ color: 'var(--palette-deep-navy)', fontWeight: 600, marginTop: '2px' }}>
                {activeNode.tool_version}
              </div>
            </div>

            <div style={{ padding: '10px 14px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Stage Classification</div>
              <div style={{ color: 'var(--palette-deep-purple)', fontWeight: 600, marginTop: '2px' }}>
                {activeNode.node_type.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          </div>

          {activeNode.sha256 && (
            <div
              style={{
                marginTop: '16px',
                padding: '10px 14px',
                backgroundColor: 'var(--palette-lavender)',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid rgba(82, 21, 78, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: 'var(--palette-deep-navy)', marginRight: '8px', fontWeight: 600 }}>
                  Cryptographic SHA-256 Digest:
                </span>
                <span className="mono" style={{ color: 'var(--palette-deep-purple)', fontSize: '12px', fontWeight: 700 }}>
                  {activeNode.sha256}
                </span>
              </div>
              <button
                onClick={() => handleCopySha(activeNode.sha256)}
                className="btn-primary"
                style={{
                  fontSize: '11px',
                  padding: '4px 10px',
                }}
              >
                {copiedSha ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

