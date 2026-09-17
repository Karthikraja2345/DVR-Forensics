import hashlib
import datetime
from typing import Tuple, List, Optional
from sqlalchemy.orm import Session
from app.models.custody import CustodyEvent
from app.config import settings


class ChainOfCustodyManager:
    """
    Cryptographic Append-Only Chain of Custody Ledger.
    Ensures mathematical tamper detection via SHA-256 backward pointer linking.
    """

    GENESIS_HASH = "0" * 64

    @classmethod
    def calculate_event_hash(
        cls,
        case_id: str,
        evidence_id: Optional[str],
        sequence_index: int,
        action: str,
        actor: str,
        timestamp_iso: str,
        source_hash: Optional[str],
        destination_hash: Optional[str],
        tool_version: str,
        previous_event_hash: str,
    ) -> str:
        """
        Computes SHA-256 of the concatenated event payload.
        """
        payload = (
            f"{case_id}|"
            f"{evidence_id or ''}|"
            f"{sequence_index}|"
            f"{action}|"
            f"{actor}|"
            f"{timestamp_iso}|"
            f"{source_hash or ''}|"
            f"{destination_hash or ''}|"
            f"{tool_version}|"
            f"{previous_event_hash}"
        )
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    @classmethod
    def log_event(
        cls,
        db: Session,
        case_id: str,
        action: str,
        actor: str,
        evidence_id: Optional[str] = None,
        source_hash: Optional[str] = None,
        destination_hash: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> CustodyEvent:
        """
        Appends a cryptographically signed event to the ledger.
        """
        last_event = (
            db.query(CustodyEvent)
            .filter(CustodyEvent.case_id == case_id)
            .order_by(CustodyEvent.sequence_index.desc())
            .first()
        )

        if last_event:
            sequence_index = last_event.sequence_index + 1
            previous_hash = last_event.event_hash
        else:
            sequence_index = 0
            previous_hash = cls.GENESIS_HASH

        now = datetime.datetime.utcnow()
        timestamp_iso = now.isoformat()
        tool_version = settings.TOOL_VERSION

        event_hash = cls.calculate_event_hash(
            case_id=case_id,
            evidence_id=evidence_id,
            sequence_index=sequence_index,
            action=action,
            actor=actor,
            timestamp_iso=timestamp_iso,
            source_hash=source_hash,
            destination_hash=destination_hash,
            tool_version=tool_version,
            previous_event_hash=previous_hash,
        )

        event_id = f"CUST-{case_id}-{sequence_index:04d}"
        event = CustodyEvent(
            id=event_id,
            case_id=case_id,
            evidence_id=evidence_id,
            sequence_index=sequence_index,
            action=action,
            actor=actor,
            timestamp=now,
            source_hash=source_hash,
            destination_hash=destination_hash,
            tool_version=tool_version,
            previous_event_hash=previous_hash,
            event_hash=event_hash,
            notes=notes,
        )

        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    @classmethod
    def verify_chain(cls, db: Session, case_id: str) -> Tuple[bool, str, int]:
        """
        Verifies the cryptographic integrity of the entire event ledger for a case.
        Returns: (is_valid: bool, message: str, total_events_checked: int)
        """
        events = (
            db.query(CustodyEvent)
            .filter(CustodyEvent.case_id == case_id)
            .order_by(CustodyEvent.sequence_index.asc())
            .all()
        )

        if not events:
            return True, "No custody events recorded for case (Valid)", 0

        # Verify Genesis
        if events[0].previous_event_hash != cls.GENESIS_HASH:
            return False, f"Genesis link corrupted at Event {events[0].id}", 1

        for i, event in enumerate(events):
            expected_hash = cls.calculate_event_hash(
                case_id=event.case_id,
                evidence_id=event.evidence_id,
                sequence_index=event.sequence_index,
                action=event.action,
                actor=event.actor,
                timestamp_iso=event.timestamp.isoformat(),
                source_hash=event.source_hash,
                destination_hash=event.destination_hash,
                tool_version=event.tool_version,
                previous_event_hash=event.previous_event_hash,
            )

            if expected_hash != event.event_hash:
                return (
                    False,
                    f"TAMPERING DETECTED: Hash mismatch at Event {event.id} (Seq: {event.sequence_index})",
                    i + 1,
                )

            if i > 0:
                prev_event = events[i - 1]
                if event.previous_event_hash != prev_event.event_hash:
                    return (
                        False,
                        f"BROKEN CHAIN LINK: Event {event.id} does not link to previous {prev_event.id}",
                        i + 1,
                    )

        return True, "CHAIN VALID: All cryptographic links verified intact", len(events)
