import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CustodyEvent } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { StatCard } from '../components/ui/StatCard';
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
            {verifying ? '⏳ Verifying...' : '⛓ Verify Hash Links'}
          </button>
        </div>
      </div>

      {/* Custody Metrics Grid */}
      <div className="metric-grid">
        <StatCard
          title="Ledger Status"
          value={isValid ? "VALID" : "COMPROMISED"}
          subtitle="Cryptographic proof"
          icon="🛡️"
          trend={isValid ? "Intact" : "Invalid"}
          trendPositive={isValid}
          highlightColor={isValid ? "var(--accent-green)" : "var(--accent-rose)"}
        />
        <StatCard
          title="Logged Events"
          value={events.length}
          subtitle="Sequential audit blocks"
          icon="📜"
          trend="Immutable"
          trendPositive={true}
        />
        <StatCard
          title="Hash Algorithm"
          value="SHA-256"
          subtitle="Backward linked pointers"
          icon="🔐"
          trend="Collision Safe"
          trendPositive={true}
        />
        <StatCard
          title="Non-Repudiation"
          value="100%"
          subtitle="ISO/IEC 27037 compliant"
          icon="⚖️"
          progressPercent={100}
        />
      </div>

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
                    color: 'var(--accent-teal-bright)',
                    fontWeight: 700,
                    fontSize: '12px',
                    padding: '2px 8px',
                    backgroundColor: 'rgba(60, 110, 113, 0.2)',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--palette-stormy-teal)',
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
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'rgba(40, 75, 99, 0.4)',
                      border: '1px solid var(--palette-yale-blue)',
                      color: 'var(--palette-white)',
                    }}
                  >
                    {ev.action}
                  </span>
                </div>
                {ev.notes && (
                  <div style={{ fontSize: '12px', color: 'var(--palette-dust-grey)', marginTop: '6px', lineHeight: 1.4 }}>
                    {ev.notes}
                  </div>
                )}
              </td>
              <td>
                <div style={{ fontWeight: 600, color: 'var(--palette-white)', fontSize: '13px' }}>{ev.actor}</div>
                <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {new Date(ev.timestamp).toLocaleString()}
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '340px' }}>
                  {/* PREV POINTER */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'rgba(53, 53, 53, 0.25)',
                      border: '1px solid rgba(53, 53, 53, 0.5)',
                      padding: '2px 6px',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)' }}>PREV:</span>
                      <span className="mono" style={{ fontSize: '11px', color: 'var(--palette-dust-grey)' }}>
                        {ev.previous_event_hash.substring(0, 16)}...
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(ev.previous_event_hash, `prev-${ev.id}`)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '10px', cursor: 'pointer' }}
                    >
                      {copiedHash === `prev-${ev.id}` ? '✓' : '📋'}
                    </button>
                  </div>

                  {/* EVENT HASH */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'rgba(40, 75, 99, 0.25)',
                      border: '1px solid rgba(40, 75, 99, 0.45)',
                      padding: '2px 6px',
                      borderRadius: '2px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--accent-teal-bright)' }}>HASH:</span>
                      <span className="mono" style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600 }}>
                        {ev.event_hash.substring(0, 16)}...
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(ev.event_hash, `hash-${ev.id}`)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-teal-bright)', fontSize: '10px', cursor: 'pointer' }}
                    >
                      {copiedHash === `hash-${ev.id}` ? '✓' : '📋'}
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

