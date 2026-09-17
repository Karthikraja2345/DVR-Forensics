import pytest
import tempfile
from pathlib import Path
from app.forensic.hashing.hasher import DualHasher


def test_dual_hasher_deterministic():
    with tempfile.NamedTemporaryFile(delete=False) as tf:
        tf.write(b"SIH 2026 PS-26150 Forensic Test Vector Evidence Stream")
        tf_path = Path(tf.name)

    try:
        md5_1, sha_1, size_1 = DualHasher.hash_file(tf_path)
        md5_2, sha_2, size_2 = DualHasher.hash_file(tf_path)

        assert md5_1 == md5_2, "MD5 hash must be completely deterministic"
        assert sha_1 == sha_2, "SHA-256 hash must be completely deterministic"
        assert size_1 == size_2
        assert len(md5_1) == 32
        assert len(sha_1) == 64

        assert DualHasher.verify_file_hash(tf_path, sha_1) is True
        assert DualHasher.verify_file_hash(tf_path, "0" * 64) is False
    finally:
        tf_path.unlink()


def test_hash_bytes():
    data = b"Arbitrary raw frame block 0x0000000167"
    md5, sha256 = DualHasher.hash_bytes(data)
    assert len(md5) == 32
    assert len(sha256) == 64
