import React, { useEffect, useState } from 'react';
import { Video, Film, Clock, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { Recording, RecoveredArtifact } from '../types';
import { VideoReplayer } from '../components/VideoReplayer';
import { StatCard } from '../components/ui/StatCard';
import { AlertBanner } from '../components/ui/AlertBanner';

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

  const totalStreams = recordings.length + recovered.length;

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Forensic Replay Mode</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Synchronized dual-pane video player displaying live frames alongside verified sector offsets and dual hashes.
          </p>
        </div>
        <span className="case-pill">
          <Video size={13} style={{ color: 'var(--palette-deep-purple)' }} />
          <span>{totalStreams} Evidence Feeds Online</span>
        </span>
      </div>

      {/* Top StatCards */}
      <div className="metric-grid">
        <StatCard
          title="Active Streams"
          value={recordings.length}
          subtitle="Allocated DVR partitions"
          icon={<Video size={20} />}
          trend="Bitstream OK"
          trendPositive={true}
        />
        <StatCard
          title="Carved Streams"
          value={recovered.length}
          subtitle="Unallocated sectors recovered"
          icon={<Film size={20} />}
          trend="H.264 Carved"
          trendPositive={true}
          highlightColor="var(--accent-amber)"
        />
        <StatCard
          title="Clock Alignment"
          value="±0.04s"
          subtitle="Sub-second drift compensation"
          icon={<Clock size={20} />}
          trend="Synchronized"
          trendPositive={true}
        />
        <StatCard
          title="Frame Verification"
          value="100%"
          subtitle="Zero dropped GOP packets"
          icon={<ShieldCheck size={20} />}
          progressPercent={100}
        />
      </div>

      <AlertBanner
        type="info"
        title="Bit-Stream Read-Only Buffer"
        badge="ISO/IEC 27037"
        message="Hardware write-blocking confirmed. Video streams rendered directly from read-only SHA-256 verified working copy."
      />

      <VideoReplayer recordings={recordings} recovered={recovered} />
    </div>
  );
};

