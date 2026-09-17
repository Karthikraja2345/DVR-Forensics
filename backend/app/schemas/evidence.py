from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class EvidenceCreate(BaseModel):
    id: str
    label: Optional[str] = None
    file_path: str  # Path to raw disk image or media


class EvidenceResponse(BaseModel):
    id: str
    case_id: str
    label: Optional[str] = None
    original_file_path: str
    working_copy_path: Optional[str] = None
    file_size_bytes: int
    source_md5: str
    source_sha256: str
    working_sha256: Optional[str] = None
    detected_vendor: str
    vendor_profile: Optional[str] = None
    vendor_confidence: float
    is_verified: bool
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HashResponse(BaseModel):
    evidence_id: str
    md5: str
    sha256: str
    file_size_bytes: int
    calculated_at: datetime
    is_deterministic: bool = True


class VerificationResponse(BaseModel):
    evidence_id: str
    source_sha256: str
    current_sha256: str
    matches: bool
    status: str  # VERIFIED or TAMPERED
    verified_at: datetime


class VendorDetectionResponse(BaseModel):
    evidence_id: str
    vendor: str
    profile: Optional[str] = None
    confidence: float
    detection_reasons: List[str]
    status: str  # VALIDATED, PROFILE_READY, PLANNED, UNKNOWN
