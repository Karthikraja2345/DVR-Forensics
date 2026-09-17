import {
  Case,
  Evidence,
  Recording,
  RecoveredArtifact,
  TimelineEvent,
  CustodyEvent,
  LineageGraph,
  OEMMatrixItem,
  ValidationRun,
} from '../types';

const API_BASE = '/api/v1';

export const api = {
  // Cases
  async getCases(): Promise<Case[]> {
    const res = await fetch(`${API_BASE}/cases`);
    if (!res.ok) throw new Error('Failed to fetch cases');
    return res.json();
  },

  async getCase(caseId: string): Promise<Case> {
    const res = await fetch(`${API_BASE}/cases/${caseId}`);
    if (!res.ok) throw new Error(`Failed to fetch case ${caseId}`);
    return res.json();
  },

  async createCase(data: Partial<Case>): Promise<Case> {
    const res = await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create case');
    return res.json();
  },

  // Evidence
  async getEvidence(caseId: string): Promise<Evidence[]> {
    const res = await fetch(`${API_BASE}/cases/${caseId}/evidence`);
    if (!res.ok) throw new Error('Failed to fetch evidence');
    return res.json();
  },

  async detectVendor(evidenceId: string) {
    const res = await fetch(`${API_BASE}/evidence/${evidenceId}/detect-vendor`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to detect vendor');
    return res.json();
  },

  async parseEvidence(evidenceId: string) {
    const res = await fetch(`${API_BASE}/evidence/${evidenceId}/parse`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to parse evidence');
    return res.json();
  },

  async getRecordings(evidenceId: string): Promise<Recording[]> {
    const res = await fetch(`${API_BASE}/evidence/${evidenceId}/recordings`);
    if (!res.ok) throw new Error('Failed to fetch recordings');
    return res.json();
  },

  // Recovery
  async triggerRecovery(evidenceId: string) {
    const res = await fetch(`${API_BASE}/evidence/${evidenceId}/recover`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to trigger recovery');
    return res.json();
  },

  async getRecoveredArtifacts(evidenceId: string): Promise<RecoveredArtifact[]> {
    const res = await fetch(`${API_BASE}/evidence/${evidenceId}/recovery`);
    if (!res.ok) throw new Error('Failed to fetch recovery artifacts');
    return res.json();
  },

  // Timeline
  async getTimeline(caseId: string): Promise<{ events: TimelineEvent[] }> {
    const res = await fetch(`${API_BASE}/cases/${caseId}/timeline`);
    if (!res.ok) throw new Error('Failed to fetch timeline');
    return res.json();
  },

  // Lineage
  async getLineage(caseId: string): Promise<LineageGraph> {
    const res = await fetch(`${API_BASE}/cases/${caseId}/lineage`);
    if (!res.ok) throw new Error('Failed to fetch lineage graph');
    return res.json();
  },

  // Custody
  async getCustody(caseId: string): Promise<{ is_valid: boolean; status_message: string; events: CustodyEvent[] }> {
    const res = await fetch(`${API_BASE}/cases/${caseId}/custody`);
    if (!res.ok) throw new Error('Failed to fetch custody ledger');
    return res.json();
  },

  async verifyCustody(caseId: string) {
    const res = await fetch(`${API_BASE}/cases/${caseId}/custody/verify`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to verify custody');
    return res.json();
  },

  // OEM Matrix & Validation
  async getOEMMatrix(): Promise<{ matrix: OEMMatrixItem[] }> {
    const res = await fetch(`${API_BASE}/validation/matrix`);
    if (!res.ok) throw new Error('Failed to fetch OEM matrix');
    return res.json();
  },

  async runValidation(): Promise<ValidationRun> {
    const res = await fetch(`${API_BASE}/validation/run`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to run validation');
    return res.json();
  },

  // Reports
  async generateReport(caseId: string) {
    const res = await fetch(`${API_BASE}/cases/${caseId}/report`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to generate report');
    return res.json();
  },
};
