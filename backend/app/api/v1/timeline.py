from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.models.case import Case
from app.models.recording import Recording, TimelineEvent
from app.schemas.timeline import TimelineResponse, TimelineEventResponse

router = APIRouter(tags=["Timeline"])


@router.get("/cases/{case_id}/timeline", response_model=TimelineResponse)
def get_case_timeline(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    events = (
        db.query(TimelineEvent)
        .filter(TimelineEvent.case_id == case_id)
        .order_by(TimelineEvent.timestamp_utc.asc())
        .all()
    )

    cameras = list({e.channel_id for e in events})

    return TimelineResponse(
        case_id=case_id,
        total_events=len(events),
        cameras_represented=cameras,
        events=[
            TimelineEventResponse(
                id=e.id,
                case_id=e.case_id,
                timestamp_utc=e.timestamp_utc,
                raw_timestamp=e.raw_timestamp,
                channel_id=e.channel_id,
                camera_name=e.camera_name,
                event_type=e.event_type,
                description=e.description,
                source_artifact_id=e.source_artifact_id,
                evidence_id=e.evidence_id,
                confidence=e.confidence,
            )
            for e in events
        ],
    )
