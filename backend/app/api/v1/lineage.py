from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.models.case import Case
from app.schemas.lineage import LineageGraphResponse
from app.forensic.lineage.graph import LineageGraphManager
from app.forensic.lineage.exporter import LineageGraphExporter

router = APIRouter(tags=["Lineage"])


@router.get("/cases/{case_id}/lineage", response_model=LineageGraphResponse)
def get_case_lineage(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    graph_data = LineageGraphManager.get_case_graph(db, case_id)
    return LineageGraphResponse(**graph_data)


@router.get("/cases/{case_id}/lineage/export")
def export_case_lineage(
    case_id: str,
    export_format: str = Query("json", alias="format", description="Export format: json, mermaid, or dot"),
    db: Session = Depends(get_db),
):
    """
    Exports the Evidence Lineage DAG into structured JSON, Mermaid diagram syntax,
    or Graphviz DOT for presentation exhibits and court packages.
    """
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    graph_data = LineageGraphManager.get_case_graph(db, case_id)
    fmt = export_format.lower().strip()

    if fmt == "mermaid":
        mermaid_content = LineageGraphExporter.export_mermaid(graph_data)
        return Response(content=mermaid_content, media_type="text/plain; charset=utf-8")
    elif fmt == "dot":
        dot_content = LineageGraphExporter.export_dot(graph_data)
        return Response(content=dot_content, media_type="text/vnd.graphviz; charset=utf-8")
    else:
        json_content = LineageGraphExporter.export_json(graph_data)
        return Response(content=json_content, media_type="application/json")
