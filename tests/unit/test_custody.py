import pytest
from app.models.base import SessionLocal
from app.models.case import Case
from app.forensic.custody.chain import ChainOfCustodyManager
from app.models.custody import CustodyEvent


def test_chain_of_custody_verification():
    db = SessionLocal()
    case_id = "TEST-CASE-CUSTODY-01"

    # Setup dummy case
    case = Case(
        id=case_id,
        name="Custody Unit Test Case",
        investigator="Examiner Smith",
        status="OPEN",
    )
    db.add(case)
    db.commit()

    try:
        # Event 1 (Genesis)
        ev1 = ChainOfCustodyManager.log_event(
            db=db,
            case_id=case_id,
            action="EVIDENCE_ACQUIRED",
            actor="Examiner Smith",
            source_hash="a" * 64,
        )
        assert ev1.previous_event_hash == "0" * 64

        # Event 2
        ev2 = ChainOfCustodyManager.log_event(
            db=db,
            case_id=case_id,
            action="WORKING_COPY_CREATED",
            actor="Examiner Smith",
            source_hash="a" * 64,
            destination_hash="a" * 64,
        )
        assert ev2.previous_event_hash == ev1.event_hash

        # Verify unbroken chain
        is_valid, msg, count = ChainOfCustodyManager.verify_chain(db, case_id)
        assert is_valid is True
        assert count == 2
        assert "CHAIN VALID" in msg

        # Inject deliberate tampering on ev1
        ev1.actor = "MALICIOUS_IMPOSTOR"
        db.commit()

        # Verify tamper detection
        is_valid_after_tamper, tamper_msg, _ = ChainOfCustodyManager.verify_chain(db, case_id)
        assert is_valid_after_tamper is False
        assert "TAMPERING DETECTED" in tamper_msg

    finally:
        # Cleanup
        db.query(CustodyEvent).filter(CustodyEvent.case_id == case_id).delete()
        db.query(Case).filter(Case.id == case_id).delete()
        db.commit()
        db.close()
