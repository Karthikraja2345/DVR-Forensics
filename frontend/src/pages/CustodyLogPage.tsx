import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CustodyEvent } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface Props {
  caseId: string;
}

export const CustodyLogPage: React.FC<Props> = ({ caseId }) => {
  const [events, setEvents] = useState<CustodyEvent[]>([]);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

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
          <button className="btn-secondary" onClick={handleVerify} disabled={verifying}>
            {verifying ? 'Verifying...' : '⛓ Verify Hash Links'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '12px' }}>
        <strong>Integrity Status: </strong>
        <span style={{ color: isValid ? 'var(--accent-green)' : 'var(--accent-red)' }}>
          {statusMsg || 'All cryptographic backward pointers validated against genesis block.'}
        </span>
      </div>

      <table className="forensic-table">
        <thead>
          <tr>
            <th>Seq</th>
            <th>Action</th>
            <th>Actor & Timestamp</th>
            <th>Cryptographic Backward Hash Pointer & Event Hash</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev) => (
            <tr key={ev.id}>
              <td className="mono" style={{ color: 'var(--accent-cyan)' }}>
                #{ev.sequence_index.toString().padStart(3, '0')}
              </td>
              <td>
                <span className="badge badge-cyan">{ev.action}</span>
                {ev.notes && (
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {ev.notes}
                  </div>
                )}
              </td>
              <td>
                <div style={{ fontWeight: 600 }}>{ev.actor}</div>
                <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {new Date(ev.timestamp).toLocaleString()}
                </div>
              </td>
              <td>
                <div style={{ fontSize: '11px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>PREV: </span>
                  <span className="mono" style={{ color: 'var(--text-secondary)' }}>
                    {ev.previous_event_hash.substring(0, 24)}...
                  </span>
                </div>
                <div style={{ fontSize: '11px', marginTop: '2px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>HASH: </span>
                  <span className="mono" style={{ color: 'var(--accent-green)' }}>
                    {ev.event_hash.substring(0, 24)}...
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
