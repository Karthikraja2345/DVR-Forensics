import tempfile
import pytest
from pathlib import Path
from app.forensic.acquisition.write_blocker import WriteBlockerVerifier
from app.forensic.hashing.hasher import DualHasher


def test_write_blocker_verification_clean():
    with tempfile.NamedTemporaryFile(delete=False) as tf:
        tf.write(b"RAW_EVIDENCE_STREAM_DATA_SECTOR_01" * 32)
        tf_path = Path(tf.name)

    try:
        # Enforce read-only protection
        WriteBlockerVerifier.apply_read_only_protection(tf_path)

        cert = WriteBlockerVerifier.verify_read_only(tf_path, examiner_id="EXAMINER-TEST-01")

        assert cert["certificate_id"].startswith("CERT-WB-")
        assert cert["hashes_match"] is True
        assert cert["pre_verification_sha256"] == cert["post_verification_sha256"]
        assert "ISO/IEC 27037" in cert["compliance_standard"]
        assert len(cert["certificate_hash"]) == 64
    finally:
        # Restore write permissions so cleanup succeeds
        try:
            import os, stat
            os.chmod(tf_path, stat.S_IWRITE)
        except Exception:
            pass
        tf_path.unlink()
