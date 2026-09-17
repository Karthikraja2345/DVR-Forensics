import pytest
import tempfile
from pathlib import Path
from app.forensic.vendor_detection.detector import VendorDetector


def test_dahua_dhfs_detection():
    with tempfile.NamedTemporaryFile(delete=False) as tf:
        tf.write(b"DHFS\x04\x00\x00\x00" + b"\x00" * 1024)
        tf_path = Path(tf.name)

    try:
        res = VendorDetector.detect(tf_path)
        assert res["vendor"] == "Dahua Technology"
        assert res["profile"] == "DHFS4"
        assert res["confidence"] == 1.0
        assert res["status"] == "VALIDATED"
    finally:
        tf_path.unlink()


def test_unknown_detection():
    with tempfile.NamedTemporaryFile(delete=False) as tf:
        tf.write(b"RANDOM_NON_DVR_HEADER_BYTES_12345" + b"\x00" * 1024)
        tf_path = Path(tf.name)

    try:
        res = VendorDetector.detect(tf_path)
        assert res["vendor"] == "UNKNOWN"
        assert res["confidence"] == 0.0
        assert res["status"] == "UNKNOWN"
    finally:
        tf_path.unlink()
