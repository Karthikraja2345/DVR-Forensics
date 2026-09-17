export interface Case {
  id: string;
  name: string;
  investigator: string;
  agency?: string;
  description?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'SEALED' | 'CLOSED';
  created_at: string;
  updated_at: string;
  evidence_count?: number;
}

export interface Evidence {
  id: string;
  case_id: string;
  label?: string;
  original_file_path: string;
  working_copy_path?: string;
  file_size_bytes: number;
  source_md5: string;
  source_sha256: string;
  working_sha256?: string;
  detected_vendor: string;
  vendor_profile?: string;
  vendor_confidence: number;
  is_verified: boolean;
  status: string;
  created_at: string;
}

export interface Recording {
  id: string;
  evidence_id: string;
  artifact_id: string;
  channel_id: string;
  camera_name?: string;
  start_time_raw: string;
  end_time_raw: string;
  start_time_utc: string;
  end_time_utc: string;
  duration_seconds: number;
  source_sector_offset: number;
  source_byte_length: number;
  file_path: string;
  codec: string;
  resolution: string;
  fps: number;
  sha256: string;
  md5: string;
  created_at: string;
}

export interface RecoveredArtifact {
  id: string;
  evidence_id: string;
  artifact_id: string;
  channel_id?: string;
  recovery_status: 'CONFIRMED' | 'PROBABLE' | 'PARTIAL' | 'FAILED';
  confidence_score: number;
  recovery_method: string;
  explanation_rules?: {
    valid_sps?: boolean;
    valid_pps?: boolean;
    valid_idr?: boolean;
    rationale?: string;
    [key: string]: any;
  };
  source_byte_offset: number;
  source_byte_length: number;
  file_path: string;
  start_time_utc?: string;
  duration_seconds: number;
  codec: string;
  sha256: string;
  md5: string;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  case_id: string;
  timestamp_utc: string;
  raw_timestamp: string;
  channel_id: string;
  camera_name?: string;
  event_type: string;
  description: string;
  source_artifact_id?: string;
  evidence_id?: string;
  confidence: number;
}

export interface CustodyEvent {
  id: string;
  case_id: string;
  evidence_id?: string;
  sequence_index: number;
  action: string;
  actor: string;
  timestamp: string;
  source_hash?: string;
  destination_hash?: string;
  tool_version: string;
  previous_event_hash: string;
  event_hash: string;
  notes?: string;
}

export interface LineageNode {
  id: string;
  case_id: string;
  node_type: string;
  label: string;
  sha256?: string;
  timestamp: string;
  actor: string;
  tool_version: string;
  metadata_json?: Record<string, any>;
}

export interface LineageEdge {
  id: string;
  case_id: string;
  source_node_id: string;
  target_node_id: string;
  transformation_type: string;
}

export interface LineageGraph {
  case_id: string;
  total_nodes: number;
  total_edges: number;
  nodes: LineageNode[];
  edges: LineageEdge[];
}

export interface OEMMatrixItem {
  oem: string;
  detection: string;
  parser_status: string;
  recovery_status: string;
  metadata_status: string;
  status: 'VALIDATED' | 'PROFILE READY' | 'PLANNED';
  fixture_reference?: string;
}

export interface ValidationMetric {
  benchmark_id: string;
  name: string;
  target: string;
  actual: string;
  passed: boolean;
  details: string;
}

export interface ValidationRun {
  run_id: string;
  executed_at: string;
  total_benchmarks: number;
  passed_benchmarks: number;
  success_rate_percent: number;
  metrics: ValidationMetric[];
}
