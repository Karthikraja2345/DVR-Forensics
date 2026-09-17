import datetime
from sqlalchemy import Column, String, BigInteger, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    label = Column(String(255), nullable=True)
    original_file_path = Column(String(512), nullable=False)
    working_copy_path = Column(String(512), nullable=True)
    file_size_bytes = Column(BigInteger, default=0, nullable=False)

    # Hashes
    source_md5 = Column(String(32), nullable=False)
    source_sha256 = Column(String(64), nullable=False)
    working_sha256 = Column(String(64), nullable=True)

    # Vendor Detection
    detected_vendor = Column(String(64), default="UNKNOWN", nullable=False)
    vendor_profile = Column(String(64), nullable=True)
    vendor_confidence = Column(Float, default=0.0, nullable=False)
    detection_reasons_json = Column(String(1024), nullable=True)

    is_verified = Column(Boolean, default=False, nullable=False)
    status = Column(String(32), default="ACQUIRED", nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    case = relationship("Case", back_populates="evidence_items")
    recordings = relationship("Recording", back_populates="evidence", cascade="all, delete-orphan")
    recovered_artifacts = relationship("RecoveredArtifact", back_populates="evidence", cascade="all, delete-orphan")
    custody_events = relationship("CustodyEvent", back_populates="evidence", cascade="all, delete-orphan")
