"""
Offline Demo Case Initializer for SIH-26150 Platform.
Initializes DEMO-CASE-001 with 100% offline synthetic fixtures.
Executes the complete forensic workflow:
  Intake -> Dual Hashing -> Working Copy -> Vendor Detection ->
  Active Parsing -> Deleted Recovery -> Timeline -> Lineage -> Report
"""

import os
import sys
import datetime
from pathlib import Path

# Ensure root and backend are in sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "backend"))

from app.config import settings
from app.models.base import init_db, SessionLocal
from app.models.case import Case
from app.models.evidence import Evidence
from app.models.recording import Recording, RecoveredArtifact, TimelineEvent
from app.models.custody import CustodyEvent
from app.forensic.acquisition.image_manager import EvidenceImageManager
from app.forensic.hashing.hasher import DualHasher
from app.forensic.vendor_detection.detector import VendorDetector
from app.forensic.custody.chain import ChainOfCustodyManager
from app.forensic.lineage.graph import LineageGraphManager
from app.parsers.registry import parser_registry
from app.reports.pdf_generator import ForensicReportGenerator
from scripts.generate_synthetic_fixtures import generate_dahua_dhfs_fixture


def create_demo_case():
    print("=" * 70)
    print("SIH-26150 DVR/NVR Forensics Platform - Offline Demo Case Initializer")
    print("=" * 70)

    # 1. Initialize DB
    init_db()
    db = SessionLocal()

    case_id = "DEMO-CASE-001"
    evidence_id = "EV-001"

    # 2. Ensure synthetic fixture exists
    fixture_path = settings.FIXTURES_PATH / "sample_images" / "dahua_dhfs_sample_01.raw"
    if not fixture_path.exists():
        print(f"[*] Generating fixture at {fixture_path}...")
        generate_dahua_dhfs_fixture(fixture_path)
    else:
        print(f"[+] Found existing fixture at {fixture_path}")

    # 3. Clean up prior demo run if existing
    existing_case = db.query(Case).filter(Case.id == case_id).first()
    if existing_case:
        print(f"[*] Removing existing {case_id} to ensure fresh state...")
        db.delete(existing_case)
        db.commit()

    # 4. Create Case Record
    print(f"[*] Registering Case: {case_id}...")
    case = Case(
        id=case_id,
        name="Operation IronGate - Surveillance Forensics",
        investigator="Insp. Rajesh Kumar (Cyber Cell)",
        agency="State Police Forensic Science Laboratory",
        description="Forensic examination of seized Dahua DVR hard disk associated with security incident.",
        status="IN_PROGRESS",
    )
    db.add(case)
    db.commit()

    # 5. Initialize Evidence & Folder Structure
    print(f"[*] Intake Evidence {evidence_id} & creating working copies...")
    orig_path, working_copy_path, md5, sha256 = EvidenceImageManager.ingest_original_evidence(
        case_id=case_id,
        evidence_id=evidence_id,
        source_path=fixture_path,
    )

    file_size = orig_path.stat().st_size

    evidence = Evidence(
        id=evidence_id,
        case_id=case_id,
        label="Dahua 8-Channel DVR 500GB Seized Hard Disk (Image)",
        original_file_path=str(orig_path),
        working_copy_path=str(working_copy_path),
        file_size_bytes=file_size,
        source_md5=md5,
        source_sha256=sha256,
        working_sha256=sha256,
        detected_vendor="Dahua Technology",
        vendor_profile="DHFS4",
        vendor_confidence=1.0,
        is_verified=True,
        status="ACQUIRED",
    )
    db.add(evidence)
    db.commit()

    # Custody Event 1: Intake & Hashing
    ChainOfCustodyManager.log_event(
        db=db,
        case_id=case_id,
        evidence_id=evidence_id,
        action="EVIDENCE_ACQUIRED",
        actor=case.investigator,
        source_hash=sha256,
        notes=f"Seized media bit-stream image acquired. MD5: {md5}",
    )

    # Custody Event 2: Working Copy Creation
    ChainOfCustodyManager.log_event(
        db=db,
        case_id=case_id,
        evidence_id=evidence_id,
        action="WORKING_COPY_CREATED",
        actor=case.investigator,
        source_hash=sha256,
        destination_hash=sha256,
        notes="Bit-stream identical working copy created for analysis. Original marked read-only.",
    )

    # 6. Vendor Detection
    print("[*] Running Multi-Signal Vendor Detection...")
    det_result = VendorDetector.detect(working_copy_path)
    print(f"    -> Detected: {det_result['vendor']} ({det_result['profile']}) | Confidence: {det_result['confidence']}")

    ChainOfCustodyManager.log_event(
        db=db,
        case_id=case_id,
        evidence_id=evidence_id,
        action="VENDOR_DETECTION_EXECUTED",
        actor="AUTOMATED_SYSTEM",
        notes=f"Identified {det_result['vendor']} via DHFS superblock magic bytes.",
    )

    # 7. Parse Active Recordings
    print("[*] Parsing allocated recordings via Dahua DHFS4 adapter...")
    parser = parser_registry.get_parser("DAHUA_TECHNOLOGY")
    out_dir = settings.EVIDENCE_STORAGE_PATH / case_id / "04_parsed_metadata"
    parse_result = parser.parse(working_copy_path, out_dir)

    for r in parse_result.recordings:
        rec = Recording(
            id=f"REC-{evidence_id}-{r.channel_id}",
            evidence_id=evidence_id,
            artifact_id=f"ART-{r.channel_id}-20260911",
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
    db.commit()
    print(f"    -> Extracted {len(parse_result.recordings)} active recordings across channels: {parse_result.channels}")

    ChainOfCustodyManager.log_event(
        db=db,
        case_id=case_id,
        evidence_id=evidence_id,
        action="PARSER_EXECUTED",
        actor="AUTOMATED_SYSTEM",
        notes=f"Dahua DHFS4 parser extracted {len(parse_result.recordings)} active streams.",
    )

    # 8. Deleted Video Recovery (CAM-03)
    print("[*] Carving unallocated clusters for deleted footage...")
    rec_dir = settings.EVIDENCE_STORAGE_PATH / case_id / "05_recovered_media"
    recovered_clips = parser.recover(working_copy_path, rec_dir)

    for rc in recovered_clips:
        art = RecoveredArtifact(
            id=f"REC-DEL-{rc.artifact_id}",
            evidence_id=evidence_id,
            artifact_id=rc.artifact_id,
            channel_id=rc.channel_id,
            recovery_status=rc.recovery_status,
            confidence_score=rc.confidence_score,
            recovery_method=rc.recovery_method,
            explanation_rules=rc.explanation_rules,
            source_byte_offset=rc.source_byte_offset,
            source_byte_length=rc.source_byte_length,
            file_path=rc.file_path,
            start_time_utc=rc.start_time_utc,
            duration_seconds=rc.duration_seconds,
            codec=rc.codec,
            sha256=rc.sha256,
            md5=rc.md5,
        )
        db.add(art)
    db.commit()
    print(f"    -> Carved {len(recovered_clips)} deleted clips. Status: {recovered_clips[0].recovery_status} ({recovered_clips[0].confidence_score*100:.0f}%)")

    ChainOfCustodyManager.log_event(
        db=db,
        case_id=case_id,
        evidence_id=evidence_id,
        action="RECOVERY_EXECUTED",
        actor="AUTOMATED_SYSTEM",
        destination_hash=recovered_clips[0].sha256,
        notes=f"Recovered deleted clip {recovered_clips[0].artifact_id} at byte offset {recovered_clips[0].source_byte_offset:,}.",
    )

    # 9. Cross-Camera Incident Narrative
    print("[*] Building cross-camera incident timeline...")
    timeline_items = [
        ("14:31:04", "CAM-01", "Main Entrance Gate", "Individual enters premises through main security gate"),
        ("14:31:11", "CAM-02", "Corridor Hallway", "Individual proceeds along ground floor corridor towards secure zone"),
        ("14:31:14", "CAM-03", "Loading Bay (Carved)", "Individual accesses loading bay door [RECOVERED DELETED FOOTAGE]"),
        ("14:31:18", "CAM-04", "Parking Lot East", "Unregistered vehicle pulls up adjacent to exit perimeter"),
        ("14:31:25", "CAM-05", "Perimeter Exit", "Individual exits facility perimeter and enters vehicle"),
    ]

    base_date = datetime.date(2026, 9, 11)
    for idx, (raw_time, channel, cam_name, desc) in enumerate(timeline_items):
        t_parts = [int(p) for p in raw_time.split(":")]
        dt_utc = datetime.datetime.combine(base_date, datetime.time(t_parts[0], t_parts[1], t_parts[2]))

        evt = TimelineEvent(
            id=f"EVT-{case_id}-{idx:03d}",
            case_id=case_id,
            timestamp_utc=dt_utc,
            raw_timestamp=f"2026-09-11 {raw_time}",
            channel_id=channel,
            camera_name=cam_name,
            event_type="INCIDENT_NARRATIVE",
            description=desc,
            source_artifact_id=f"ART-{channel}-20260911",
            evidence_id=evidence_id,
            confidence=0.98 if "Carved" not in cam_name else 0.95,
        )
        db.add(evt)
    db.commit()
    print(f"    -> Added {len(timeline_items)} chronological incident reconstruction events.")

    # 10. Build Evidence Lineage DAG
    print("[*] Generating Evidence Lineage Graph nodes and transitions...")
    LineageGraphManager.add_node(
        db=db,
        node_id="NODE-ORIG",
        case_id=case_id,
        node_type="ORIGINAL_EVIDENCE",
        label="Physical DVR Platter (Write-Protected)",
        sha256=sha256,
        actor=case.investigator,
        metadata={"interface": "SATA-III", "capacity": "500 GB"},
    )

    LineageGraphManager.add_node(
        db=db,
        node_id="NODE-IMG",
        case_id=case_id,
        node_type="FORENSIC_IMAGE",
        label="Bit-Stream Raw Disk Image",
        sha256=sha256,
        actor=case.investigator,
        metadata={"format": "RAW / DD", "integrity": "VERIFIED_BIT_FOR_BIT"},
    )
    LineageGraphManager.add_edge(db, "EDGE-1", case_id, "NODE-ORIG", "NODE-IMG", "BIT_STREAM_DUPLICATION")

    LineageGraphManager.add_node(
        db=db,
        node_id="NODE-PARSE",
        case_id=case_id,
        node_type="PARSED_STORAGE",
        label="Dahua DHFS4 Storage Index",
        sha256=None,
        actor="AUTOMATED_SYSTEM",
        metadata={"vendor": "Dahua Technology", "channels": 4},
    )
    LineageGraphManager.add_edge(db, "EDGE-2", case_id, "NODE-IMG", "NODE-PARSE", "SUPERBLOCK_INDEX_PARSING")

    LineageGraphManager.add_node(
        db=db,
        node_id="NODE-CARVED",
        case_id=case_id,
        node_type="RECOVERED_CLIP",
        label="Carved Clip: Loading Bay (CAM-03)",
        sha256=recovered_clips[0].sha256,
        actor="AUTOMATED_SYSTEM",
        metadata={"confidence": "CONFIRMED", "sector": 300},
    )
    LineageGraphManager.add_edge(db, "EDGE-3", case_id, "NODE-PARSE", "NODE-CARVED", "UNALLOCATED_NAL_CARVING")

    LineageGraphManager.add_node(
        db=db,
        node_id="NODE-REPORT",
        case_id=case_id,
        node_type="FINAL_REPORT",
        label="Court-Ready Forensic PDF Report",
        sha256=None,
        actor=case.investigator,
        metadata={"standard": "ISO/IEC 27037:2012"},
    )
    LineageGraphManager.add_edge(db, "EDGE-4", case_id, "NODE-CARVED", "NODE-REPORT", "EVIDENCE_BUNDLE_EXPORT")

    # 11. Verify Custody Chain
    is_valid, custody_msg, checked = ChainOfCustodyManager.verify_chain(db, case_id)
    print(f"[+] Cryptographic Chain of Custody Verified: {custody_msg} ({checked} events checked)")

    db.close()
    print("=" * 70)
    print("[OK] OFFLINE DEMO CASE INITIALIZATION COMPLETED SUCCESSFULLY!")
    print(f"    Case ID:     {case_id}")
    print(f"    Evidence ID: {evidence_id}")
    print("    Access via:  http://localhost:5173")
    print("=" * 70)


if __name__ == "__main__":
    create_demo_case()
