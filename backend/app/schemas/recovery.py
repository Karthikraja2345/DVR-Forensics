from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class RecoveredArtifactResponse(BaseModel):
    id: str
    evidence_id: str
    artifact_id: str
    channel_id: Optional[str] = None
    recovery_status: str  # CONFIRMED, PROBABLE, PARTIAL, FAILED
    confidence_score: float
    recovery_method: str
    explanation_rules: Optional[Dict[str, Any]] = None
    source_byte_offset: int
    source_byte_length: int
    file_path: str
    start_time_utc: Optional[datetime] = None
    duration_seconds: float
    codec: str
    sha256: str
    md5: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RecoveryJobResponse(BaseModel):
    evidence_id: str
    recovered_count: int
    artifacts: List[RecoveredArtifactResponse]
    status: str
    message: str
