from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.models.case import Case
from app.models.custody import CustodyEvent
from app.schemas.custody import CustodyLedgerResponse, CustodyVerifyResponse, CustodyEventResponse
from app.forensic.custody.chain import ChainOfCustodyManager

router = APIRouter(tags=["Custody"])


@router.get("/cases/{case_id}/custody", response_model=CustodyLedgerResponse)
def get_custody_ledger(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    events = (
        db.query(CustodyEvent)
        .filter(CustodyEvent.case_id == case_id)
        .order_by(CustodyEvent.sequence_index.asc())
        .all()
    )

    is_valid, msg, _ = ChainOfCustodyManager.verify_chain(db, case_id)

    return CustodyLedgerResponse(
        case_id=case_id,
        total_events=len(events),
        is_valid=is_valid,
        status_message=msg,
        events=[
            CustodyEventResponse(
                id=e.id,
                case_id=e.case_id,
                evidence_id=e.evidence_id,
                sequence_index=e.sequence_index,
                action=e.action,
                actor=e.actor,
                timestamp=e.timestamp,
                source_hash=e.source_hash,
                destination_hash=e.destination_hash,
                tool_version=e.tool_version,
                previous_event_hash=e.previous_event_hash,
                event_hash=e.event_hash,
                notes=e.notes,
            )
            for e in events
        ],
    )


@router.post("/cases/{case_id}/custody/verify", response_model=CustodyVerifyResponse)
def verify_custody(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    is_valid, message, count = ChainOfCustodyManager.verify_chain(db, case_id)

    return CustodyVerifyResponse(
        case_id=case_id,
        is_valid=is_valid,
        status="CHAIN VALID" if is_valid else "CHAIN INVALID",
        verified_events_count=count,
        message=message,
    )
