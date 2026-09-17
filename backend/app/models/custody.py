import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import Base


class CustodyEvent(Base):
    __tablename__ = "custody_events"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    evidence_id = Column(String(64), ForeignKey("evidence.id", ondelete="CASCADE"), nullable=True, index=True)
    sequence_index = Column(Integer, nullable=False)
    action = Column(String(64), nullable=False)
    actor = Column(String(128), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    source_hash = Column(String(64), nullable=True)
    destination_hash = Column(String(64), nullable=True)
    tool_version = Column(String(32), default="1.0.0-rc1", nullable=False)

    previous_event_hash = Column(String(64), nullable=False)
    event_hash = Column(String(64), unique=True, nullable=False, index=True)
    notes = Column(Text, nullable=True)

    # Relationships
    case = relationship("Case", back_populates="custody_events")
    evidence = relationship("Evidence", back_populates="custody_events")
