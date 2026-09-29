import tempfile
import pytest
from pathlib import Path
from app.forensic.repair.stream_repair import StreamRepairEngine
from app.forensic.hashing.hasher import DualHasher


def test_stream_repair_missing_sps_pps():
    # Construct a truncated stream containing ONLY an IDR keyframe without SPS/PPS
    idr_prefix = bytes.fromhex("00000001658880")
    dummy_payload = idr_prefix + (b"\xCC" * 1024)

    with tempfile.NamedTemporaryFile(delete=False) as tf_in:
        tf_in.write(dummy_payload)
        in_path = Path(tf_in.name)

    with tempfile.NamedTemporaryFile(delete=False) as tf_out:
        out_path = Path(tf_out.name)

    try:
        _, orig_sha, _ = DualHasher.hash_file(in_path)

        res = StreamRepairEngine.repair_stream(in_path, out_path, channel_id="CAM-REPAIR-TEST")

        assert res["injected_sps"] is True
        assert res["injected_pps"] is True
        assert res["is_playable"] is True
        assert res["original_sha256"] == orig_sha
        assert res["repaired_sha256"] != orig_sha
        assert len(res["repair_actions"]) >= 2

        # Verify repaired file bytes have SPS & PPS at offset 0
        with open(out_path, "rb") as f:
            repaired_bytes = f.read()

        nal_index = StreamRepairEngine.scan_nal_units(repaired_bytes)
        assert any(n["is_sps"] for n in nal_index)
        assert any(n["is_pps"] for n in nal_index)
        assert any(n["is_idr"] for n in nal_index)

        # Confirm original was not touched
        _, post_orig_sha, _ = DualHasher.hash_file(in_path)
        assert post_orig_sha == orig_sha
    finally:
        in_path.unlink()
        out_path.unlink()


def test_stream_repair_already_valid_stream():
    # Stream with SPS, PPS, and IDR
    sps = bytes.fromhex("000000016742c01fda014016ec0440000003004000000ca03c58bb80")
    pps = bytes.fromhex("0000000168ce3880")
    idr = bytes.fromhex("00000001658880") + (b"\xFF" * 512)
    stream = sps + pps + idr

    with tempfile.NamedTemporaryFile(delete=False) as tf_in:
        tf_in.write(stream)
        in_path = Path(tf_in.name)

    with tempfile.NamedTemporaryFile(delete=False) as tf_out:
        out_path = Path(tf_out.name)

    try:
        res = StreamRepairEngine.repair_stream(in_path, out_path, channel_id="CAM-INTACT-TEST")
        assert res["injected_sps"] is False
        assert res["injected_pps"] is False
        assert res["has_idr_keyframe"] is True
    finally:
        in_path.unlink()
        out_path.unlink()
