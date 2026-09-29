import React, { useEffect, useState } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Case } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface Props {
  onSelectCase: (caseId: string) => void;
}

export const CasesPage: React.FC<Props> = ({ onSelectCase }) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCase, setNewCase] = useState({
    id: `CASE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    agency: 'State Police Cyber Cell',
    investigator: 'Insp. Rajesh Kumar',
    description: '',
  });

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

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCase.name) return;
    try {
      const created = await api.createCase(newCase);
      setCases([...cases, created]);
      setShowModal(false);
      alert(`Forensic Case Registered: ${created.id}`);
    } catch (err: any) {
      alert(`Failed to create case: ${err.message}`);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading forensic case registry...</div>;
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Forensic Case Registry</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Official case ledgers, investigator chain delegations, and evidence container tracking.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowModal(true)}
        >
          <Plus size={14} />
          <span>Register New Case</span>
        </button>
      </div>

      <table className="forensic-table">
        <thead>
          <tr>
            <th>Case Identifier</th>
            <th>Investigation Title & Context</th>
            <th>Lead Examiner & Agency</th>
            <th>Custody Status</th>
            <th>Date Registered</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id}>
              <td>
                <strong className="mono" style={{ color: 'var(--palette-prussian)' }}>{c.id}</strong>
              </td>
              <td>
                <div style={{ fontWeight: 600, color: 'var(--palette-prussian)' }}>{c.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{c.description}</div>
              </td>
              <td>
                <div style={{ color: 'var(--palette-prussian)', fontWeight: 500 }}>{c.investigator}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{c.agency}</div>
              </td>
              <td>
                <StatusBadge status={c.status} />
              </td>
              <td className="mono" style={{ fontSize: '11px', color: 'var(--palette-prussian)' }}>
                {new Date(c.created_at).toLocaleDateString()}
              </td>
              <td>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                  onClick={() => onSelectCase(c.id)}
                >
                  <span>Set Active</span>
                  <ArrowRight size={11} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create Case Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17, 19, 68, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              width: '100%',
              maxWidth: '480px',
              padding: '24px',
              boxShadow: 'var(--shadow-dropdown)',
            }}
          >
            <h2 style={{ fontSize: '18px', color: 'var(--palette-prussian)', marginBottom: '4px' }}>
              Register Forensic Case
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Complies with ISO/IEC 27037:2012 intake requirements.
            </p>

            <form onSubmit={handleCreateCase} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--palette-prussian)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Case ID
                </label>
                <input
                  type="text"
                  value={newCase.id}
                  disabled
                  style={{ width: '100%', opacity: 0.7, backgroundColor: 'var(--bg-secondary)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--palette-prussian)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Case Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. CCTV Tampering Investigation - Warehouse"
                  value={newCase.name}
                  onChange={(e) => setNewCase({ ...newCase, name: e.target.value })}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--palette-prussian)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Investigating Agency / Unit
                </label>
                <input
                  type="text"
                  value={newCase.agency}
                  onChange={(e) => setNewCase({ ...newCase, agency: e.target.value })}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--palette-prussian)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Lead Examiner
                </label>
                <input
                  type="text"
                  value={newCase.investigator}
                  onChange={(e) => setNewCase({ ...newCase, investigator: e.target.value })}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--palette-prussian)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Brief Incident Description
                </label>
                <textarea
                  rows={3}
                  value={newCase.description}
                  onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Register Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
