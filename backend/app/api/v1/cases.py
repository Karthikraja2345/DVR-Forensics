from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.models.case import Case
from app.schemas.case import CaseCreate, CaseResponse, CaseDetailResponse
from app.forensic.acquisition.image_manager import EvidenceImageManager
from app.forensic.custody.chain import ChainOfCustodyManager
from app.config import settings

router = APIRouter(prefix="/cases", tags=["Cases"])


@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(payload: CaseCreate, db: Session = Depends(get_db)):
    existing = db.query(Case).filter(Case.id == payload.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Case ID {payload.id} already exists",
        )

    case = Case(
        id=payload.id,
        name=payload.name,
        investigator=payload.investigator,
        agency=payload.agency,
        description=payload.description,
        status="OPEN",
    )
    db.add(case)
    db.commit()
    db.refresh(case)

    # Initialize directory structure
    EvidenceImageManager.initialize_case_directory(case.id)

    # Log initial custody genesis event
    ChainOfCustodyManager.log_event(
        db=db,
        case_id=case.id,
        action="CASE_REGISTERED",
        actor=payload.investigator,
        notes=f"Forensic case {case.id} officially opened",
    )

    return case


@router.get("", response_model=List[CaseResponse])
def list_cases(db: Session = Depends(get_db)):
    cases = db.query(Case).order_by(Case.created_at.desc()).all()
    res = []
    for c in cases:
        ev_count = len(c.evidence_items)
        res.append(
            CaseResponse(
                id=c.id,
                name=c.name,
                investigator=c.investigator,
                agency=c.agency,
                description=c.description,
                status=c.status,
                created_at=c.created_at,
                updated_at=c.updated_at,
                evidence_count=ev_count,
            )
        )
    return res


@router.get("/{case_id}", response_model=CaseDetailResponse)
def get_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    return CaseDetailResponse(
        id=case.id,
        name=case.name,
        investigator=case.investigator,
        agency=case.agency,
        description=case.description,
        status=case.status,
        created_at=case.created_at,
        updated_at=case.updated_at,
        evidence_count=len(case.evidence_items),
    )


@router.patch("/{case_id}/close", response_model=CaseResponse)
def close_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    case.status = "CLOSED"
    db.commit()
    db.refresh(case)

    ChainOfCustodyManager.log_event(
        db=db,
        case_id=case.id,
        action="CASE_CLOSED_AND_SEALED",
        actor=case.investigator,
        notes="Evidence package sealed against further modifications",
    )

    return case
