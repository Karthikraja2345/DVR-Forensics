from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.models.evidence import Evidence
from app.models.recording import RecoveredArtifact
from app.schemas.recovery import RecoveredArtifactResponse, RecoveryJobResponse
from app.parsers.registry import parser_registry
from app.recovery.carver import VideoCarver
from app.forensic.custody.chain import ChainOfCustodyManager

router = APIRouter(tags=["Recovery"])


@router.post("/evidence/{evidence_id}/recover", response_model=RecoveryJobResponse)
def trigger_deleted_recovery(evidence_id: str, db: Session = Depends(get_db)):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")

    target_path = Path(evidence.working_copy_path or evidence.original_file_path)
    out_dir = target_path.parent.parent / "05_recovered_media"

    # Try vendor-specific recovery adapter first
    recovered_descriptors = []
    parser, _, _ = parser_registry.find_best_parser(target_path)
    if parser:
        recovered_descriptors = parser.recover(target_path, out_dir)

    # Fallback to generic carving if vendor adapter found 0 or isn't specialized
    if not recovered_descriptors:
        recovered_descriptors = VideoCarver.carve_raw_image(target_path, out_dir)

    results: List[RecoveredArtifact] = []
    for r in recovered_descriptors:
        existing = db.query(RecoveredArtifact).filter(RecoveredArtifact.artifact_id == r.artifact_id).first()
        if not existing:
            artifact = RecoveredArtifact(
                id=f"REC-DEL-{r.artifact_id}",
                evidence_id=evidence.id,
                artifact_id=r.artifact_id,
                channel_id=r.channel_id,
                recovery_status=r.recovery_status,
                confidence_score=r.confidence_score,
                recovery_method=r.recovery_method,
                explanation_rules=r.explanation_rules,
                source_byte_offset=r.source_byte_offset,
                source_byte_length=r.source_byte_length,
                file_path=r.file_path,
                start_time_utc=r.start_time_utc,
                duration_seconds=r.duration_seconds,
                codec=r.codec,
                sha256=r.sha256,
                md5=r.md5,
            )
            db.add(artifact)
            results.append(artifact)
        else:
            existing.repair_applied = False
            existing.repair_log = None
            results.append(existing)

    evidence.status = "RECOVERY_COMPLETED"
    db.commit()

    ChainOfCustodyManager.log_event(
        db=db,
        case_id=evidence.case_id,
        evidence_id=evidence.id,
        action="DELETED_RECOVERY_EXECUTED",
        actor="AUTOMATED_SYSTEM",
        notes=f"Carved {len(results)} deleted video streams from unallocated clusters",
    )

    response_items = [
        RecoveredArtifactResponse(
            id=item.id,
            evidence_id=item.evidence_id,
            artifact_id=item.artifact_id,
            channel_id=item.channel_id,
            recovery_status=item.recovery_status,
            confidence_score=item.confidence_score,
            recovery_method=item.recovery_method,
            explanation_rules=item.explanation_rules,
            source_byte_offset=item.source_byte_offset,
            source_byte_length=item.source_byte_length,
            file_path=item.file_path,
            start_time_utc=item.start_time_utc,
            duration_seconds=item.duration_seconds,
            codec=item.codec,
            sha256=item.sha256,
            md5=item.md5,
            repair_applied=bool(item.repair_applied),
            repair_log=item.repair_log,
            created_at=item.created_at,
        )
        for item in results
    ]

    return RecoveryJobResponse(
        evidence_id=evidence.id,
        recovered_count=len(results),
        artifacts=response_items,
        status="SUCCESS",
        message=f"Successfully carved {len(results)} candidate video artifacts from unallocated clusters.",
    )


from app.forensic.repair.stream_repair import StreamRepairEngine
from app.forensic.lineage.graph import LineageGraphManager


@router.get("/evidence/{evidence_id}/recovery", response_model=List[RecoveredArtifactResponse])
def list_recovered_artifacts(evidence_id: str, db: Session = Depends(get_db)):
    return db.query(RecoveredArtifact).filter(RecoveredArtifact.evidence_id == evidence_id).all()


@router.post("/recovery/{artifact_id}/repair")
def repair_recovered_stream(artifact_id: str, db: Session = Depends(get_db)):
    """
    Executes forensic stream repair on a carved video artifact.
    Injects valid SPS/PPS headers and resolves broken GOPs without mutating raw evidence.
    """
    artifact = db.query(RecoveredArtifact).filter(
        (RecoveredArtifact.artifact_id == artifact_id) | (RecoveredArtifact.id == artifact_id)
    ).first()
    if not artifact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artifact not found")

    in_path = Path(artifact.file_path)
    if not in_path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Source stream file not found on disk: {artifact.file_path}")

    evidence = db.query(Evidence).filter(Evidence.id == artifact.evidence_id).first()
    case_id = evidence.case_id if evidence else "CASE-UNKNOWN"

    out_dir = in_path.parent / "repaired"
    out_path = out_dir / f"REPAIRED_{in_path.name}"

    repair_result = StreamRepairEngine.repair_stream(in_path, out_path, channel_id=artifact.channel_id or "CARVED")

    # Add Lineage node & edge
    repaired_node_id = f"NODE-REPAIR-{artifact.artifact_id}"
    LineageGraphManager.add_node(
        db=db,
        node_id=repaired_node_id,
        case_id=case_id,
        node_type="REPAIRED_WORKING_COPY",
        label=f"Repaired Stream ({artifact.channel_id or 'Carved'})",
        sha256=repair_result["repaired_sha256"],
        actor="FORENSIC_STREAM_REPAIRER",
        metadata={"repair_actions": repair_result["repair_actions"], "is_playable": True},
    )
    LineageGraphManager.add_edge(
        db=db,
        edge_id=f"EDGE-REPAIR-{artifact.artifact_id}",
        case_id=case_id,
        source_id="NODE-CARVED",
        target_id=repaired_node_id,
        transformation="SPS_PPS_PARAMETER_INJECTION",
    )

    # Log in Chain of Custody
    ChainOfCustodyManager.log_event(
        db=db,
        case_id=case_id,
        evidence_id=artifact.evidence_id,
        action="STREAM_REPAIRED_DERIVED_COPY",
        actor="FORENSIC_STREAM_REPAIRER",
        source_hash=repair_result["original_sha256"],
        destination_hash=repair_result["repaired_sha256"],
        notes=f"Repaired {artifact.artifact_id}: {'; '.join(repair_result['repair_actions'])}",
    )

    return repair_result
