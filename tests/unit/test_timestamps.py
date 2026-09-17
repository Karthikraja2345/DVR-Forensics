import pytest
import datetime
from app.forensic.timestamps.normalizer import TimestampNormalizer


def test_timestamp_normalization():
    raw_str = "2026-09-11 14:31:04"
    # Offset: +05:30 = 330 minutes
    res = TimestampNormalizer.normalize(
        raw_timestamp_str=raw_str,
        timezone_offset_minutes=330,
        clock_drift_seconds=0.0,
    )

    assert res["raw_timestamp"] == raw_str
    # 14:31:04 - 5h30m = 09:01:04 UTC
    expected_utc = datetime.datetime(2026, 9, 11, 9, 1, 4)
    assert res["normalized_utc"] == expected_utc


def test_timestamp_drift_compensation():
    raw_str = "2026-09-11 14:31:04"
    # Hardware clock was 4 seconds fast
    res = TimestampNormalizer.normalize(
        raw_timestamp_str=raw_str,
        timezone_offset_minutes=0,
        clock_drift_seconds=4.0,
    )

    expected_utc = datetime.datetime(2026, 9, 11, 14, 31, 0)
    assert res["normalized_utc"] == expected_utc
