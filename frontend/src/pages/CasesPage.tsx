import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Case } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface Props {
  onSelectCase: (caseId: string) => void;
}

export const CasesPage: React.FC<Props> = ({ onSelectCase }) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCases() {
      try {
        const data = await api.getCases();
        setCases(data);
      } catch (err) {
        console.error('Failed to load cases', err);
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading case registry...</div>;
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Case Management</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Official forensic cases, investigator assignments, and evidence intake ledgers.
          </p>
        </div>
      </div>

      <table className="forensic-table">
        <thead>
          <tr>
            <th>Case ID</th>
            <th>Title & Description</th>
            <th>Lead Examiner</th>
            <th>Status</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id}>
              <td>
                <strong className="mono" style={{ color: 'var(--accent-cyan)' }}>{c.id}</strong>
              </td>
              <td>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.description}</div>
              </td>
              <td>
                <div>{c.investigator}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.agency}</div>
              </td>
              <td>
                <StatusBadge status={c.status} />
              </td>
              <td className="mono" style={{ fontSize: '11px' }}>
                {new Date(c.created_at).toLocaleDateString()}
              </td>
              <td>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                  onClick={() => onSelectCase(c.id)}
                >
                  Select Active
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
