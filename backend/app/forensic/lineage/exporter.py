import json
import datetime
from typing import Dict, Any, List


class LineageGraphExporter:
    """
    Evidence Lineage DAG Exporter.
    Generates structured JSON exhibits, Mermaid diagrams, and Graphviz DOT representations
    for court exhibits and forensic presentation materials.
    """

    @classmethod
    def export_json(cls, graph_data: Dict[str, Any]) -> str:
        """
        Exports the DAG into a formatted JSON audit bundle.
        """
        export_payload = {
            "forensic_provenance_schema_version": "1.0",
            "exported_at": datetime.datetime.utcnow().isoformat() + "Z",
            "case_id": graph_data.get("case_id"),
            "summary": {
                "total_nodes": graph_data.get("total_nodes", len(graph_data.get("nodes", []))),
                "total_edges": graph_data.get("total_edges", len(graph_data.get("edges", []))),
            },
            "nodes": graph_data.get("nodes", []),
            "edges": graph_data.get("edges", []),
        }
        return json.dumps(export_payload, indent=2, default=str)

    @classmethod
    def export_mermaid(cls, graph_data: Dict[str, Any]) -> str:
        """
        Exports the DAG into Mermaid flowchart syntax (graph LR) for presentation slides.
        """
        lines = ["graph LR"]
        lines.append("  %% Forensic Evidence Lineage DAG")
        lines.append("  classDef source fill:#0284c7,stroke:#38bdf8,stroke-width:2px,color:#fff;")
        lines.append("  classDef working fill:#475569,stroke:#94a3b8,stroke-width:2px,color:#fff;")
        lines.append("  classDef artifact fill:#059669,stroke:#34d399,stroke-width:2px,color:#fff;")
        lines.append("  classDef carved fill:#d97706,stroke:#fbbf24,stroke-width:2px,color:#fff;")
        lines.append("  classDef ai fill:#7c3aed,stroke:#a78bfa,stroke-width:2px,color:#fff;")
        lines.append("  classDef report fill:#e11d48,stroke:#fb7185,stroke-width:2px,color:#fff;")

        nodes = graph_data.get("nodes", [])
        edges = graph_data.get("edges", [])

        # Sanitize node identifiers for Mermaid
        def clean_id(raw_id: str) -> str:
            return raw_id.replace("-", "_").replace(".", "_").replace(" ", "_")

        for n in nodes:
            nid = clean_id(n.get("id", "NODE"))
            label = n.get("label", n.get("id", "Node")).replace('"', "'")
            ntype = n.get("node_type", "UNKNOWN")
            lines.append(f'  {nid}["{label}<br/><small>({ntype})</small>"]')

            # Assign styling class
            if ntype in ["ORIGINAL_EVIDENCE", "RAW_IMAGE"]:
                lines.append(f"  class {nid} source;")
            elif ntype in ["WORKING_COPY", "IMAGE"]:
                lines.append(f"  class {nid} working;")
            elif ntype in ["RECORDING", "ALLOCATED_STREAM"]:
                lines.append(f"  class {nid} artifact;")
            elif ntype in ["RECOVERED_ARTIFACT", "CARVED_STREAM"]:
                lines.append(f"  class {nid} carved;")
            elif ntype in ["AI_FINDING", "MOTION_EVENT"]:
                lines.append(f"  class {nid} ai;")
            elif ntype in ["REPORT", "FORENSIC_REPORT"]:
                lines.append(f"  class {nid} report;")

        for e in edges:
            src = clean_id(e.get("source_node_id", ""))
            tgt = clean_id(e.get("target_node_id", ""))
            transform = e.get("transformation_type", "TRANSFORMED")
            lines.append(f'  {src} -->|"{transform}"| {tgt}')

        return "\n".join(lines)

    @classmethod
    def export_dot(cls, graph_data: Dict[str, Any]) -> str:
        """
        Exports the DAG into Graphviz DOT syntax for generating PDF / SVG exhibits.
        """
        lines = [
            'digraph ForensicLineage {',
            '  rankdir="LR";',
            '  node [shape=box, style="filled,rounded", fontname="Helvetica", fontsize=10];',
            '  edge [fontname="Helvetica", fontsize=9];',
        ]

        def clean_id(raw_id: str) -> str:
            return f'"{raw_id}"'

        for n in graph_data.get("nodes", []):
            nid = clean_id(n.get("id", "NODE"))
            label = f'{n.get("label", "")}\\n({n.get("node_type", "")})'
            lines.append(f'  {nid} [label="{label}", fillcolor="#f1f5f9", color="#0f172a"];')

        for e in graph_data.get("edges", []):
            src = clean_id(e.get("source_node_id", ""))
            tgt = clean_id(e.get("target_node_id", ""))
            trans = e.get("transformation_type", "")
            lines.append(f'  {src} -> {tgt} [label="{trans}"];')

        lines.append('}')
        return "\n".join(lines)

    @classmethod
    def verify_dag_acyclic(cls, graph_data: Dict[str, Any]) -> bool:
        """
        Verifies that the lineage graph contains zero cycles (is a true DAG).
        """
        adj: Dict[str, List[str]] = {}
        all_nodes = set()

        for n in graph_data.get("nodes", []):
            nid = n.get("id")
            adj[nid] = []
            all_nodes.add(nid)

        for e in graph_data.get("edges", []):
            src = e.get("source_node_id")
            tgt = e.get("target_node_id")
            if src in adj:
                adj[src].append(tgt)

        visited = set()
        rec_stack = set()

        def is_cyclic(v: str) -> bool:
            visited.add(v)
            rec_stack.add(v)
            for neighbor in adj.get(v, []):
                if neighbor not in visited:
                    if is_cyclic(neighbor):
                        return True
                elif neighbor in rec_stack:
                    return True
            rec_stack.remove(v)
            return False

        for node in all_nodes:
            if node not in visited:
                if is_cyclic(node):
                    return False
        return True
