from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class LineageNodeResponse(BaseModel):
    id: str
    case_id: str
    node_type: str
    label: str
    sha256: Optional[str] = None
    timestamp: datetime
    actor: str
    tool_version: str
    metadata_json: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class LineageEdgeResponse(BaseModel):
    id: str
    case_id: str
    source_node_id: str
    target_node_id: str
    transformation_type: str

    model_config = ConfigDict(from_attributes=True)


class LineageGraphResponse(BaseModel):
    case_id: str
    total_nodes: int
    total_edges: int
    nodes: List[LineageNodeResponse]
    edges: List[LineageEdgeResponse]
