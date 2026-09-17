from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class CustodyEventResponse(BaseModel):
    id: str
    case_id: str
    evidence_id: Optional[str] = None
    sequence_index: int
    action: str
    actor: str
    timestamp: datetime
    source_hash: Optional[str] = None
    destination_hash: Optional[str] = None
    tool_version: str
    previous_event_hash: str
    event_hash: str
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CustodyLedgerResponse(BaseModel):
    case_id: str
    total_events: int
    is_valid: bool
    status_message: str
    events: List[CustodyEventResponse]


class CustodyVerifyResponse(BaseModel):
    case_id: str
    is_valid: bool
    status: str  # CHAIN VALID or CHAIN INVALID
    verified_events_count: int
    message: str
