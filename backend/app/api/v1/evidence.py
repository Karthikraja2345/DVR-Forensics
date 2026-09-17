import datetime
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.models.case import Case
from app.models.evidence import Evidence
from app.models.recording import Recording
from app.schemas.evidence import (
    EvidenceCreate,
    EvidenceResponse,
    HashResponse,
    VerificationResponse,
    VendorDetectionResponse,
)
from app.schemas.recording import RecordingResponse, MetadataResponse, ParseResultResponse
from app.forensic.acquisition.image_manager import EvidenceImageManager
from app.forensic.hashing.hasher import DualHasher
from app.forensic.vendor_detection.detector import VendorDetector
from app.forensic.custody.chain import ChainOfCustodyManager
from app.parsers.registry import parser_registry

router = APIRouter(tags=["Evidence"])


@router.post("/cases/{case_id}/evidence", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED)
def intake_evidence(case_id: str, payload: EvidenceCreate, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Case {case_id} not found")

    existing = db.query(Evidence).filter(Evidence.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Evidence {payload.id} already exists")

    src_path = Path(payload.file_path)
    if not src_path.is_file():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Source file not found: {payload.file_path}")

    # Isolate original evidence, calculate dual hashes, and create verified working copy
    orig_path, working_copy_path, md5, sha256 = EvidenceImageManager.ingest_original_evidence(
        case_id=case_id,
        evidence_id=payload.id,
        source_path=src_path,
    )

    file_size = orig_path.stat().st_size

    evidence = Evidence(
        id=payload.id,
        case_id=case_id,
        label=payload.label or src_path.name,
        original_file_path=str(orig_path),
        working_copy_path=str(working_copy_path),
        file_size_bytes=file_size,
        source_md5=md5,
        source_sha256=sha256,
        working_sha256=sha256,  # Verified duplicate
        is_verified=True,
        status="ACQUIRED",
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    # Log custody event
    ChainOfCustodyManager.log_event(
        db=db,
        case_id=case_id,
        evidence_id=evidence.id,
        action="EVIDENCE_ACQUIRED_AND_HASHED",
        actor=case.investigator,
        source_hash=sha256,
        destination_hash=sha256,
        notes=f"Acquired {src_path.name} ({file_size:,} bytes). MD5: {md5}",
    )

    return evidence


@router.get("/cases/{case_id}/evidence", response_model=List[EvidenceResponse])
def list_case_evidence(case_id: str, db: Session = Depends(get_db)):
    return db.query(Evidence).filter(Evidence.case_id == case_id).all()


@router.post("/evidence/{evidence_id}/hash", response_model=HashResponse)
def compute_evidence_hash(evidence_id: str, db: Session = Depends(get_db)):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")

    md5, sha256, size = DualHasher.hash_file(Path(evidence.original_file_path))
    return HashResponse(
        evidence_id=evidence.id,
        md5=md5,
        sha256=sha256,
        file_size_bytes=size,
        calculated_at=datetime.datetime.utcnow(),
        is_deterministic=True,
    )


@router.post("/evidence/{evidence_id}/verify", response_model=VerificationResponse)
def verify_evidence_integrity(evidence_id: str, db: Session = Depends(get_db)):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")

    _, current_sha256, _ = DualHasher.hash_file(Path(evidence.original_file_path))
    matches = current_sha256.lower() == evidence.source_sha256.lower()
    return VerificationResponse(
        evidence_id=evidence.id,
        source_sha256=evidence.source_sha256,
        current_sha256=current_sha256,
        matches=matches,
        status="VERIFIED" if matches else "TAMPERED",
        verified_at=datetime.datetime.utcnow(),
    )


@router.post("/evidence/{evidence_id}/detect-vendor", response_model=VendorDetectionResponse)
def detect_vendor(evidence_id: str, db: Session = Depends(get_db)):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")

    target_path = Path(evidence.working_copy_path or evidence.original_file_path)
    result = VendorDetector.detect(target_path)

    evidence.detected_vendor = result["vendor"]
    evidence.vendor_profile = result.get("profile")
    evidence.vendor_confidence = result["confidence"]
    evidence.status = "VENDOR_DETECTED"
    db.commit()

    ChainOfCustodyManager.log_event(
        db=db,
        case_id=evidence.case_id,
        evidence_id=evidence.id,
        action="VENDOR_DETECTION_EXECUTED",
        actor="AUTOMATED_SYSTEM",
        notes=f"Detected OEM: {result['vendor']} ({result.get('profile')}) with {result['confidence']*100:.1f}% confidence",
    )

    return VendorDetectionResponse(
        evidence_id=evidence.id,
        vendor=result["vendor"],
        profile=result.get("profile"),
        confidence=result["confidence"],
        detection_reasons=result["reasons"],
        status=result["status"],
    )


@router.post("/evidence/{evidence_id}/parse", response_model=ParseResultResponse)
def parse_evidence(evidence_id: str, db: Session = Depends(get_db)):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")

    target_path = Path(evidence.working_copy_path or evidence.original_file_path)

    # Resolve appropriate parser adapter
    parser, confidence, reasons = parser_registry.find_best_parser(target_path)
    if not parser:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="UNSUPPORTED_FORMAT: No registered parser adapter matched this image",
        )

    out_dir = Path(evidence.working_copy_path).parent.parent / "04_parsed_metadata"
    parse_result = parser.parse(target_path, out_dir)

    # Save recordings to database
    for r in parse_result.recordings:
        existing_rec = db.query(Recording).filter(Recording.artifact_id == f"ART-{r.channel_id}-{r.source_sector_offset}").first()
        if not existing_rec:
            rec = Recording(
                id=f"REC-{evidence.id}-{r.channel_id}-{r.source_sector_offset}",
                evidence_id=evidence.id,
                artifact_id=f"ART-{r.channel_id}-{r.source_sector_offset}",
                channel_id=r.channel_id,
                camera_name=r.camera_name,
                start_time_raw=r.start_time_raw,
                end_time_raw=r.end_time_raw,
                start_time_utc=r.start_time_utc,
                end_time_utc=r.end_time_utc,
                duration_seconds=r.duration_seconds,
                source_sector_offset=r.source_sector_offset,
                source_byte_length=r.source_byte_length,
                file_path=r.file_path,
                codec=r.codec,
                resolution=r.resolution,
                fps=r.fps,
                sha256=r.sha256,
                md5=r.md5,
            )
            db.add(rec)

    evidence.status = "PARSED"
    db.commit()

    ChainOfCustodyManager.log_event(
        db=db,
        case_id=evidence.case_id,
        evidence_id=evidence.id,
        action="PARSER_EXECUTED",
        actor="AUTOMATED_SYSTEM",
        notes=f"Parsed with {parser.vendor_name} adapter. Extracted {len(parse_result.recordings)} recordings.",
    )

    return ParseResultResponse(
        evidence_id=evidence.id,
        parser_used=f"{parser.vendor_name} ({parser.profile_name})",
        status="SUCCESS",
        recordings_extracted=len(parse_result.recordings),
        channels_found=parse_result.channels,
        message=f"Successfully extracted {len(parse_result.recordings)} active recordings across {len(parse_result.channels)} channels.",
    )


@router.get("/evidence/{evidence_id}/recordings", response_model=List[RecordingResponse])
def get_evidence_recordings(evidence_id: str, db: Session = Depends(get_db)):
    return db.query(Recording).filter(Recording.evidence_id == evidence_id).all()
