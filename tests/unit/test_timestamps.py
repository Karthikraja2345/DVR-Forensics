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


def test_calculate_drift_rate_per_hour():
    # Calibration point 1: device clock matches reference exactly
    t1_ref = datetime.datetime(2026, 9, 1, 0, 0, 0)
    t1_dev = datetime.datetime(2026, 9, 1, 5, 30, 0)  # With IST offset (+05:30)

    # Calibration point 2: 48 hours later, device is 12 seconds fast
    t2_ref = datetime.datetime(2026, 9, 3, 0, 0, 0)  # 48 hours later
    t2_dev = datetime.datetime(2026, 9, 3, 5, 30, 12)  # 12 seconds fast

    rate = TimestampNormalizer.calculate_drift_rate_per_hour(
        start_sync_device_time=t1_dev,
        start_sync_reference_utc=t1_ref,
        end_sync_device_time=t2_dev,
        end_sync_reference_utc=t2_ref,
        timezone_offset_minutes=330,
    )

    # 12 seconds / 48 hours = 0.25 seconds/hour
    assert pytest.approx(rate, 0.001) == 0.25


def test_normalize_with_drift_curve():
    base_device = datetime.datetime(2026, 9, 1, 5, 30, 0)
    base_drift = 2.0  # Already 2 seconds fast at base
    drift_rate = 0.5  # Gains 0.5 seconds every hour

    # Incident occurs 10 hours after base:
    # 2026-09-01 15:30:00 device time
    # Accumulated drift = 2.0 + (10 * 0.5) = 7.0 seconds fast
    raw_str = "2026-09-01 15:30:00"

    res = TimestampNormalizer.normalize_with_drift_curve(
        raw_timestamp_str=raw_str,
        base_device_time=base_device,
        base_drift_seconds=base_drift,
        drift_rate_seconds_per_hour=drift_rate,
        timezone_offset_minutes=330,  # IST
    )

    assert res["accumulated_drift_seconds"] == 7.0
    # Device local 15:30:00 - 7s = 15:29:53 Local. Minus 5h30m = 09:59:53 UTC
    expected_utc = datetime.datetime(2026, 9, 1, 9, 59, 53)
    assert res["normalized_utc"] == expected_utc
