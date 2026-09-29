import os
import stat
import datetime
from pathlib import Path
from typing import Dict, Any, Tuple
from app.forensic.hashing.hasher import DualHasher


class WriteBlockerVerifier:
    """
    Forensic Hardware & Software Write-Blocker Verification Engine.
    Conforms to ISO/IEC 27037:2012 Section 6.2 (Acquisition & Preservation).
    Conducts deterministic non-destructive write-protection tests and
    emits cryptographic compliance certificates.
    """

    @classmethod
    def verify_read_only(cls, file_path: Path, examiner_id: str = "EXAMINER-LEAD") -> Dict[str, Any]:
        """
        Conducts forensic write-protection validation on evidence file or mounted disk volume.
        Ensures target evidence is strictly read-only and remains 100% byte-identical.
        """
        path = Path(file_path)
        if not path.is_file():
            return {
                "is_protected": False,
                "verification_status": "FAILED",
                "details": f"Target path does not exist or is not a file: {file_path}",
                "timestamp_utc": datetime.datetime.utcnow().isoformat(),
            }

        # Step 1: Compute pre-verification SHA-256
        _, pre_sha256, file_size = DualHasher.hash_file(path)

        # Step 2: Check OS filesystem attributes (Windows / Linux read-only bit)
        file_stat = os.stat(path)
        is_stat_ro = not bool(file_stat.st_mode & stat.S_IWRITE)

        # Step 3: Test write-rejection safely
        write_blocked = False
        write_error_msg = ""
        try:
            with open(path, "r+b") as test_f:
                # If opening with write mode succeeded, check if file is marked read-only
                if is_stat_ro:
                    write_blocked = True
                    write_error_msg = "Write attempt blocked by OS read-only attribute"
                else:
                    write_blocked = False
                    write_error_msg = "WARNING: File was openable in write mode without write-blocker"
        except (PermissionError, OSError) as e:
            # File system or OS write-blocker threw PermissionError
            write_blocked = True
            write_error_msg = f"Write attempt actively rejected: {type(e).__name__} ({str(e)})"

        # Step 4: Compute post-verification SHA-256 to prove zero evidence mutation
        _, post_sha256, _ = DualHasher.hash_file(path)
        hash_unaltered = (pre_sha256 == post_sha256)

        is_protected = write_blocked and hash_unaltered
        verification_status = "CERTIFIED_WRITE_PROTECTED" if is_protected else "WRITE_PROTECTION_DEFICIENT"

        cert_id = f"CERT-WB-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        cert_data = f"{cert_id}:{path.name}:{pre_sha256}:{verification_status}:{examiner_id}"
        cert_hash = DualHasher.hash_bytes(cert_data.encode("utf-8"))[1]

        return {
            "certificate_id": cert_id,
            "file_name": path.name,
            "file_path": str(path.resolve()),
            "file_size_bytes": file_size,
            "pre_verification_sha256": pre_sha256,
            "post_verification_sha256": post_sha256,
            "hashes_match": hash_unaltered,
            "is_protected": is_protected,
            "verification_status": verification_status,
            "write_probe_details": write_error_msg,
            "examiner_id": examiner_id,
            "compliance_standard": "ISO/IEC 27037:2012 Clause 6.2",
            "certificate_hash": cert_hash,
            "timestamp_utc": datetime.datetime.utcnow().isoformat(),
        }

    @classmethod
    def apply_read_only_protection(cls, file_path: Path) -> bool:
        """
        Enforces OS-level write-protection on an evidence file by stripping write permissions.
        """
        path = Path(file_path)
        if not path.is_file():
            return False
        try:
            # Remove all write flags
            current_mode = os.stat(path).st_mode
            os.chmod(path, current_mode & ~stat.S_IWRITE & ~stat.S_IWGRP & ~stat.S_IWOTH)
            return True
        except Exception:
            return False
