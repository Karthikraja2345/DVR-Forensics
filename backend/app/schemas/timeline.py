from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class TimelineEventResponse(BaseModel):
    id: str
    case_id: str
    timestamp_utc: datetime
    raw_timestamp: str
    channel_id: str
    camera_name: Optional[str] = None
    event_type: str
    description: str
    source_artifact_id: Optional[str] = None
    evidence_id: Optional[str] = None
    confidence: float

    model_config = ConfigDict(from_attributes=True)


class TimelineResponse(BaseModel):
    case_id: str
    total_events: int
    cameras_represented: List[str]
    events: List[TimelineEventResponse]


class AIFindingResponse(BaseModel):
    id: str
    artifact_id: str
    model_name: str
    finding_type: str
    frame_timestamp: Optional[datetime] = None
    confidence: float
    bounding_box: Optional[List[int]] = None
    is_primary_evidence: bool = False
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
