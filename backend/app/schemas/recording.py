from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class RecordingResponse(BaseModel):
    id: str
    evidence_id: str
    artifact_id: str
    channel_id: str
    camera_name: Optional[str] = None
    start_time_raw: str
    end_time_raw: str
    start_time_utc: datetime
    end_time_utc: datetime
    duration_seconds: float
    source_sector_offset: int
    source_byte_length: int
    file_path: str
    codec: str
    resolution: str
    fps: float
    sha256: str
    md5: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MetadataResponse(BaseModel):
    evidence_id: str
    total_recordings: int
    channels: List[str]
    earliest_time_utc: Optional[datetime] = None
    latest_time_utc: Optional[datetime] = None
    total_duration_seconds: float
    codecs_detected: List[str]
    filesystem_info: Dict[str, Any]


class ParseResultResponse(BaseModel):
    evidence_id: str
    parser_used: str
    status: str
    recordings_extracted: int
    channels_found: List[str]
    message: str
