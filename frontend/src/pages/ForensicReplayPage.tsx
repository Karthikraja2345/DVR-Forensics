import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Recording, RecoveredArtifact } from '../types';
import { VideoReplayer } from '../components/VideoReplayer';

interface Props {
  caseId: string;
}

export const ForensicReplayPage: React.FC<Props> = ({ caseId }) => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [recovered, setRecovered] = useState<RecoveredArtifact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecordings() {
      try {
        const evList = await api.getEvidence(caseId);
        if (evList.length > 0) {
          const recs = await api.getRecordings(evList[0].id);
          const recsCarved = await api.getRecoveredArtifacts(evList[0].id);
          setRecordings(recs);
          setRecovered(recsCarved);
        }
      } catch (err) {
        console.error('Failed to load replay streams', err);
      } finally {
        setLoading(false);
      }
    }
    loadRecordings();
  }, [caseId]);

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading synchronized evidence player...</div>;
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Forensic Replay Mode</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Synchronized dual-pane video player displaying live frames alongside verified sector offsets and dual hashes.
          </p>
        </div>
      </div>

      <VideoReplayer recordings={recordings} recovered={recovered} />
    </div>
  );
};
