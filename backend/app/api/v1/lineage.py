from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.models.case import Case
from app.schemas.lineage import LineageGraphResponse
from app.forensic.lineage.graph import LineageGraphManager

router = APIRouter(tags=["Lineage"])


@router.get("/cases/{case_id}/lineage", response_model=LineageGraphResponse)
def get_case_lineage(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    graph_data = LineageGraphManager.get_case_graph(db, case_id)
    return LineageGraphResponse(**graph_data)
