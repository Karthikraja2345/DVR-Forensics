from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.config import settings
from app.models.base import get_db
from app.models.case import Case
from app.models.evidence import Evidence
from app.models.recording import Recording, RecoveredArtifact, TimelineEvent
from app.models.custody import CustodyEvent
from app.schemas.report import ReportResponse
from app.reports.pdf_generator import ForensicReportGenerator
from app.forensic.custody.chain import ChainOfCustodyManager

router = APIRouter(tags=["Reports"])


@router.post("/cases/{case_id}/report", response_model=ReportResponse)
def generate_report(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    evidence_items = db.query(Evidence).filter(Evidence.case_id == case_id).all()
    evidence_ids = [e.id for e in evidence_items]

    recordings = db.query(Recording).filter(Recording.evidence_id.in_(evidence_ids)).all() if evidence_ids else []
    recovered_artifacts = db.query(RecoveredArtifact).filter(RecoveredArtifact.evidence_id.in_(evidence_ids)).all() if evidence_ids else []
    timeline = db.query(TimelineEvent).filter(TimelineEvent.case_id == case_id).order_by(TimelineEvent.timestamp_utc.asc()).all()
    custody = db.query(CustodyEvent).filter(CustodyEvent.case_id == case_id).order_by(CustodyEvent.sequence_index.asc()).all()

    is_valid, custody_status_msg, _ = ChainOfCustodyManager.verify_chain(db, case_id)
    custody_badge = "CHAIN VALID" if is_valid else "CHAIN INVALID"

    # Serialize objects to dictionaries for generator
    case_dict = {
        "id": case.id,
        "name": case.name,
        "investigator": case.investigator,
        "agency": case.agency,
        "description": case.description,
        "status": case.status,
    }

    ev_dicts = [
        {
            "id": e.id,
            "label": e.label,
            "original_file_path": e.original_file_path,
            "file_size_bytes": e.file_size_bytes,
            "source_md5": e.source_md5,
            "source_sha256": e.source_sha256,
            "detected_vendor": e.detected_vendor,
            "vendor_profile": e.vendor_profile,
            "vendor_confidence": e.vendor_confidence,
            "working_sha256": e.working_sha256,
        }
        for e in evidence_items
    ]

    rec_dicts = [
        {
            "artifact_id": r.artifact_id,
            "channel_id": r.channel_id,
            "camera_name": r.camera_name,
            "start_time_raw": r.start_time_raw,
            "end_time_raw": r.end_time_raw,
            "start_time_utc": r.start_time_utc.isoformat(),
            "end_time_utc": r.end_time_utc.isoformat(),
            "duration_seconds": r.duration_seconds,
            "codec": r.codec,
            "resolution": r.resolution,
            "source_sector_offset": r.source_sector_offset,
            "source_byte_length": r.source_byte_length,
            "sha256": r.sha256,
        }
        for r in recordings
    ]

    recovered_dicts = [
        {
            "artifact_id": rc.artifact_id,
            "channel_id": rc.channel_id,
            "recovery_status": rc.recovery_status,
            "confidence_score": rc.confidence_score,
            "recovery_method": rc.recovery_method,
            "source_byte_offset": rc.source_byte_offset,
            "source_byte_length": rc.source_byte_length,
            "sha256": rc.sha256,
            "explanation_rules": rc.explanation_rules,
        }
        for rc in recovered_artifacts
    ]

    tl_dicts = [
        {
            "timestamp_utc": t.timestamp_utc.isoformat(),
            "channel_id": t.channel_id,
            "description": t.description,
            "source_artifact_id": t.source_artifact_id,
        }
        for t in timeline
    ]

    custody_dicts = [
        {
            "sequence_index": c.sequence_index,
            "timestamp": c.timestamp.isoformat(),
            "action": c.action,
            "actor": c.actor,
            "event_hash": c.event_hash,
            "previous_event_hash": c.previous_event_hash,
        }
        for c in custody
    ]

    report_result = ForensicReportGenerator.generate_case_report(
        case_data=case_dict,
        evidence_items=ev_dicts,
        recordings=rec_dicts,
        recovered_artifacts=recovered_dicts,
        timeline_events=tl_dicts,
        custody_events=custody_dicts,
        custody_status=custody_badge,
    )

    ChainOfCustodyManager.log_event(
        db=db,
        case_id=case.id,
        action="REPORT_GENERATED",
        actor=case.investigator,
        destination_hash=report_result["sha256"],
        notes=f"Generated court-ready report: {report_result['pdf_path']}",
    )

    return ReportResponse(**report_result)


@router.get("/cases/{case_id}/report/download")
def download_report(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    reports_dir = settings.REPORTS_OUTPUT_PATH
    # Check for PDF first
    pdf_matching = sorted(reports_dir.glob(f"Forensic_Report_{case_id}_*.pdf"), key=lambda p: p.stat().st_mtime, reverse=True)
    if pdf_matching:
        report_file = pdf_matching[0]
        return FileResponse(
            path=str(report_file),
            filename=report_file.name,
            media_type="application/pdf",
        )

    # Fallback to generating report if none exists
    txt_matching = sorted(reports_dir.glob(f"Forensic_Report_{case_id}_*.txt"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not txt_matching:
        generate_report(case_id, db)
        pdf_matching = sorted(reports_dir.glob(f"Forensic_Report_{case_id}_*.pdf"), key=lambda p: p.stat().st_mtime, reverse=True)
        if pdf_matching:
            report_file = pdf_matching[0]
            return FileResponse(
                path=str(report_file),
                filename=report_file.name,
                media_type="application/pdf",
            )
        txt_matching = sorted(reports_dir.glob(f"Forensic_Report_{case_id}_*.txt"), key=lambda p: p.stat().st_mtime, reverse=True)

    if not txt_matching:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No report found for case")

    report_file = txt_matching[0]
    return FileResponse(
        path=str(report_file),
        filename=report_file.name,
        media_type="text/plain; charset=utf-8",
    )

