from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.lineage import LineageNode, LineageEdge
from app.models.recording import Recording, RecoveredArtifact, AIFinding


class LineageGraphManager:
    """
    Evidence Lineage Directed Acyclic Graph (DAG) Engine.
    Represents the full physical-to-logical transformation history.
    """

    @classmethod
    def get_case_graph(cls, db: Session, case_id: str) -> Dict[str, Any]:
        """
        Retrieves all lineage nodes and edges for a case.
        """
        nodes = db.query(LineageNode).filter(LineageNode.case_id == case_id).all()
        edges = db.query(LineageEdge).filter(LineageEdge.case_id == case_id).all()

        return {
            "case_id": case_id,
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "nodes": [
                {
                    "id": n.id,
                    "case_id": n.case_id,
                    "node_type": n.node_type,
                    "label": n.label,
                    "sha256": n.sha256,
                    "timestamp": n.timestamp,
                    "actor": n.actor,
                    "tool_version": n.tool_version,
                    "metadata_json": n.metadata_json,
                }
                for n in nodes
            ],
            "edges": [
                {
                    "id": e.id,
                    "case_id": e.case_id,
                    "source_node_id": e.source_node_id,
                    "target_node_id": e.target_node_id,
                    "transformation_type": e.transformation_type,
                }
                for e in edges
            ],
        }

    @classmethod
    def add_node(
        cls,
        db: Session,
        node_id: str,
        case_id: str,
        node_type: str,
        label: str,
        sha256: str = None,
        actor: str = "SYSTEM",
        metadata: Dict[str, Any] = None,
    ) -> LineageNode:
        """
        Appends a node to the lineage graph.
        """
        node = db.query(LineageNode).filter(LineageNode.id == node_id).first()
        if not node:
            node = LineageNode(
                id=node_id,
                case_id=case_id,
                node_type=node_type,
                label=label,
                sha256=sha256,
                actor=actor,
                metadata_json=metadata,
            )
            db.add(node)
            db.commit()
            db.refresh(node)
        return node

    @classmethod
    def add_edge(
        cls,
        db: Session,
        edge_id: str,
        case_id: str,
        source_id: str,
        target_id: str,
        transformation: str,
    ) -> LineageEdge:
        """
        Appends a directed edge between two lineage nodes.
        """
        edge = db.query(LineageEdge).filter(LineageEdge.id == edge_id).first()
        if not edge:
            edge = LineageEdge(
                id=edge_id,
                case_id=case_id,
                source_node_id=source_id,
                target_node_id=target_id,
                transformation_type=transformation,
            )
            db.add(edge)
            db.commit()
            db.refresh(edge)
        return edge
