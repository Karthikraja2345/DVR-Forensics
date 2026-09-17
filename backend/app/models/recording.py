import datetime
from sqlalchemy import Column, String, BigInteger, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base


class Recording(Base):
    __tablename__ = "recordings"

    id = Column(String(64), primary_key=True, index=True)
    evidence_id = Column(String(64), ForeignKey("evidence.id", ondelete="CASCADE"), nullable=False, index=True)
    artifact_id = Column(String(128), unique=True, nullable=False, index=True)
    channel_id = Column(String(32), nullable=False, index=True)  # e.g., CAM-01
    camera_name = Column(String(128), nullable=True)

    # Timestamps
    start_time_raw = Column(String(64), nullable=False)
    end_time_raw = Column(String(64), nullable=False)
    start_time_utc = Column(DateTime, nullable=False, index=True)
    end_time_utc = Column(DateTime, nullable=False)
    duration_seconds = Column(Float, default=0.0, nullable=False)

    # Physical Sourcing
    source_sector_offset = Column(BigInteger, default=0, nullable=False)
    source_byte_length = Column(BigInteger, default=0, nullable=False)
    file_path = Column(String(512), nullable=False)

    # Technical Specs
    codec = Column(String(32), default="H.264", nullable=False)
    resolution = Column(String(32), default="1920x1080", nullable=False)
    fps = Column(Float, default=25.0, nullable=False)

    # Hashes
    sha256 = Column(String(64), nullable=False)
    md5 = Column(String(32), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    evidence = relationship("Evidence", back_populates="recordings")
    ai_findings = relationship("AIFinding", back_populates="recording", cascade="all, delete-orphan")


class RecoveredArtifact(Base):
    __tablename__ = "recovered_artifacts"

    id = Column(String(64), primary_key=True, index=True)
    evidence_id = Column(String(64), ForeignKey("evidence.id", ondelete="CASCADE"), nullable=False, index=True)
    artifact_id = Column(String(128), unique=True, nullable=False, index=True)
    channel_id = Column(String(32), nullable=True)

    # Recovery Evaluation
    recovery_status = Column(String(32), nullable=False)  # CONFIRMED, PROBABLE, PARTIAL, FAILED
    confidence_score = Column(Float, default=0.0, nullable=False)
    recovery_method = Column(String(64), nullable=False)  # e.g. NAL_CARVING_H264
    explanation_rules = Column(JSON, nullable=True)  # Detailed verification checklist

    # Physical Sourcing
    source_byte_offset = Column(BigInteger, default=0, nullable=False)
    source_byte_length = Column(BigInteger, default=0, nullable=False)
    file_path = Column(String(512), nullable=False)

    # Technical Details
    start_time_utc = Column(DateTime, nullable=True)
    duration_seconds = Column(Float, default=0.0, nullable=False)
    codec = Column(String(32), default="H.264", nullable=False)

    # Hashes
    sha256 = Column(String(64), nullable=False)
    md5 = Column(String(32), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    evidence = relationship("Evidence", back_populates="recovered_artifacts")
    ai_findings = relationship("AIFinding", back_populates="recovered_artifact", cascade="all, delete-orphan")


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp_utc = Column(DateTime, nullable=False, index=True)
    raw_timestamp = Column(String(64), nullable=False)
    channel_id = Column(String(32), nullable=False)
    camera_name = Column(String(128), nullable=True)
    event_type = Column(String(64), nullable=False)  # MOTION, OBJECT, TRANSIT, INCIDENT
    description = Column(Text, nullable=False)
    source_artifact_id = Column(String(128), nullable=True)
    evidence_id = Column(String(64), nullable=True)
    confidence = Column(Float, default=1.0, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    case = relationship("Case", back_populates="timeline_events")


class AIFinding(Base):
    __tablename__ = "ai_findings"

    id = Column(String(64), primary_key=True, index=True)
    recording_id = Column(String(64), ForeignKey("recordings.id", ondelete="CASCADE"), nullable=True)
    recovered_artifact_id = Column(String(64), ForeignKey("recovered_artifacts.id", ondelete="CASCADE"), nullable=True)
    model_name = Column(String(64), nullable=False)
    finding_type = Column(String(64), nullable=False)  # MOTION_DETECTED, OBJECT_DETECTED
    frame_timestamp = Column(DateTime, nullable=True)
    confidence = Column(Float, default=0.0, nullable=False)
    bounding_box = Column(JSON, nullable=True)  # [x, y, w, h]
    is_primary_evidence = Column(Boolean, default=False, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    recording = relationship("Recording", back_populates="ai_findings")
    recovered_artifact = relationship("RecoveredArtifact", back_populates="ai_findings")
