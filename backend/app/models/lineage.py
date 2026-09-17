import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base


class LineageNode(Base):
    __tablename__ = "lineage_nodes"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    node_type = Column(String(64), nullable=False)  # ORIGINAL_EVIDENCE, FORENSIC_IMAGE, PARSED_RECORDING, RECOVERED_CLIP, etc.
    label = Column(String(255), nullable=False)
    sha256 = Column(String(64), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    actor = Column(String(128), default="SYSTEM", nullable=False)
    tool_version = Column(String(32), default="1.0.0-rc1", nullable=False)
    metadata_json = Column(JSON, nullable=True)

    case = relationship("Case", back_populates="lineage_nodes")


class LineageEdge(Base):
    __tablename__ = "lineage_edges"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False, index=True)
    source_node_id = Column(String(64), ForeignKey("lineage_nodes.id", ondelete="CASCADE"), nullable=False)
    target_node_id = Column(String(64), ForeignKey("lineage_nodes.id", ondelete="CASCADE"), nullable=False)
    transformation_type = Column(String(64), nullable=False)  # HASH_VERIFY, PARSE, CARVE, NORMALIZE, ANALYZE, EXPORT
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
