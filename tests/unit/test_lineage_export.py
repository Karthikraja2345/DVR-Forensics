import json
import pytest
from app.forensic.lineage.exporter import LineageGraphExporter


@pytest.fixture
def sample_graph():
    return {
        "case_id": "CASE-TEST-001",
        "total_nodes": 4,
        "total_edges": 3,
        "nodes": [
            {"id": "EV-001", "node_type": "ORIGINAL_EVIDENCE", "label": "Dahua Disk Image"},
            {"id": "IMG-001", "node_type": "WORKING_COPY", "label": "Verified Working Copy"},
            {"id": "ART-001", "node_type": "RECORDING", "label": "CAM-01 Stream"},
            {"id": "REP-001", "node_type": "REPORT", "label": "Court Report Bundle"},
        ],
        "edges": [
            {"source_node_id": "EV-001", "target_node_id": "IMG-001", "transformation_type": "BIT_STREAM_DUPLICATION"},
            {"source_node_id": "IMG-001", "target_node_id": "ART-001", "transformation_type": "DHFS4_PARSING"},
            {"source_node_id": "ART-001", "target_node_id": "REP-001", "transformation_type": "EVIDENCE_COMPILATION"},
        ],
    }


def test_export_json(sample_graph):
    json_str = LineageGraphExporter.export_json(sample_graph)
    parsed = json.loads(json_str)
    assert parsed["case_id"] == "CASE-TEST-001"
    assert parsed["summary"]["total_nodes"] == 4
    assert len(parsed["nodes"]) == 4


def test_export_mermaid(sample_graph):
    mermaid_str = LineageGraphExporter.export_mermaid(sample_graph)
    assert "graph LR" in mermaid_str
    assert "EV_001" in mermaid_str
    assert "IMG_001" in mermaid_str
    assert "BIT_STREAM_DUPLICATION" in mermaid_str


def test_export_dot(sample_graph):
    dot_str = LineageGraphExporter.export_dot(sample_graph)
    assert "digraph ForensicLineage {" in dot_str
    assert '"EV-001"' in dot_str
    assert '"IMG-001"' in dot_str


def test_dag_acyclic_validation(sample_graph):
    assert LineageGraphExporter.verify_dag_acyclic(sample_graph) is True

    # Inject cycle
    cyclic_graph = {
        "nodes": [{"id": "A"}, {"id": "B"}],
        "edges": [
            {"source_node_id": "A", "target_node_id": "B"},
            {"source_node_id": "B", "target_node_id": "A"},
        ],
    }
    assert LineageGraphExporter.verify_dag_acyclic(cyclic_graph) is False
