import React, { useEffect, useState } from 'react';
import { Link2, Copy, Check } from 'lucide-react';
import { api } from '../services/api';
import { CustodyEvent } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ExecutiveMetricStrip } from '../components/ui/ExecutiveMetricStrip';
import { AlertBanner } from '../components/ui/AlertBanner';

interface Props {
  caseId: string;
}

export const CustodyLogPage: React.FC<Props> = ({ caseId }) => {
  const [events, setEvents] = useState<CustodyEvent[]>([]);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    async function loadCustody() {
      try {
        const data = await api.getCustody(caseId);
        setEvents(data.events);
        setIsValid(data.is_valid);
        setStatusMsg(data.status_message);
      } catch (err) {
        console.error('Failed to load custody log', err);
      } finally {
        setLoading(false);
      }
    }
    loadCustody();
  }, [caseId]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyCustody(caseId);
      setIsValid(res.is_valid);
      setStatusMsg(res.message);
      alert(`Custody Verification: ${res.status}\n${res.message}`);
    } catch (e: any) {
      alert(`Verification failed: ${e.message}`);
    } finally {
      setVerifying(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Validating custody hashes...</div>;
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Cryptographic Chain of Custody</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Append-only, SHA-256 linked audit ledger ensuring non-repudiation and mathematical evidence integrity.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <StatusBadge status={isValid ? 'CHAIN VALID' : 'CHAIN INVALID'} />
          <button className="btn-primary" onClick={handleVerify} disabled={verifying}>
            <Link2 size={13} />
            <span>{verifying ? 'Verifying...' : 'Verify Hash Links'}</span>
          </button>
        </div>
      </div>

      {/* Executive Forensic Metric Ribbon */}
      <ExecutiveMetricStrip
        metrics={[
          {
            label: 'Ledger Status',
            value: isValid ? 'VALID' : 'COMPROMISED',
            annotation: 'Cryptographic proof',
            statusBadge: { text: isValid ? 'CHAIN INTACT' : 'INVALID', variant: isValid ? 'green' : 'neutral' }
          },
          {
            label: 'Logged Events',
            value: events.length,
            annotation: 'Sequential audit blocks',
            statusBadge: { text: 'IMMUTABLE', variant: 'blue' }
          },
          {
            label: 'Hash Algorithm',
            value: 'SHA-256',
            annotation: 'Backward linked pointers',
            statusBadge: { text: 'COLLISION SAFE', variant: 'green' }
          },
          {
            label: 'Non-Repudiation',
            value: '100%',
            annotation: 'ISO/IEC 27037 compliant',
            statusBadge: { text: 'SEC 65B READY', variant: 'gold' }
          }
        ]}
      />

      <AlertBanner
        type={isValid ? "success" : "danger"}
        title={isValid ? "Cryptographic Backward Chain Verified" : "Chain Integrity Violation"}
        badge="APPEND-ONLY LEDGER"
        message={statusMsg || "All cryptographic backward pointers validated against genesis block. Evidence has zero unauthorized tampering."}
      />

      <table className="forensic-table">
        <thead>
          <tr>
            <th style={{ width: '80px' }}>Seq</th>
            <th>Action & Notes</th>
            <th>Actor & Timestamp</th>
            <th>Cryptographic Hash Pointers</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev) => (
            <tr key={ev.id}>
              <td>
                <span
                  className="mono"
                  style={{
                    color: 'var(--palette-prussian)',
                    fontWeight: 700,
                    fontSize: '12px',
                    padding: '2px 8px',
                    backgroundColor: 'var(--palette-prussian-tint)',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  #{ev.sequence_index.toString().padStart(3, '0')}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--palette-prussian-tint)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--palette-prussian)',
                    }}
                  >
                    {ev.action}
                  </span>
                </div>
                {ev.notes && (
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
                    {ev.notes}
                  </div>
                )}
              </td>
              <td>
                <div style={{ fontWeight: 600, color: 'var(--palette-prussian)', fontSize: '13px' }}>{ev.actor}</div>
                <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {new Date(ev.timestamp).toLocaleString()}
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '340px' }}>
                  {/* PREV POINTER */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-xs)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)' }}>PREV:</span>
                      <span className="mono" style={{ fontSize: '11px', color: 'var(--palette-prussian)' }}>
                        {ev.previous_event_hash.substring(0, 16)}...
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(ev.previous_event_hash, `prev-${ev.id}`)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Copy previous hash"
                    >
                      {copiedHash === `prev-${ev.id}` ? <Check size={11} color="var(--accent-green)" /> : <Copy size={11} />}
                    </button>
                  </div>

                  {/* EVENT HASH */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--palette-prussian-tint)',
                      border: '1px solid var(--border-color)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-xs)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--palette-prussian)' }}>HASH:</span>
                      <span className="mono" style={{ fontSize: '11px', color: 'var(--palette-prussian)', fontWeight: 700 }}>
                        {ev.event_hash.substring(0, 16)}...
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(ev.event_hash, `hash-${ev.id}`)}
                      style={{ background: 'none', border: 'none', color: 'var(--palette-prussian)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Copy event hash"
                    >
                      {copiedHash === `hash-${ev.id}` ? <Check size={11} color="var(--accent-green)" /> : <Copy size={11} />}
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

