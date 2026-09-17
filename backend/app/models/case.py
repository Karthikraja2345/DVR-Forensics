import datetime
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base


class Case(Base):
    __tablename__ = "cases"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    investigator = Column(String(128), nullable=False)
    agency = Column(String(128), nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String(32), default="OPEN", nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    evidence_items = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")
    custody_events = relationship("CustodyEvent", back_populates="case", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="case", cascade="all, delete-orphan")
    lineage_nodes = relationship("LineageNode", back_populates="case", cascade="all, delete-orphan")
