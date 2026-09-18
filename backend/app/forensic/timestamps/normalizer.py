import datetime
from typing import Tuple, Optional, Dict, Any, List


class TimestampNormalizer:
    """
    Forensic Timestamp Normalization & Drift Compensation Engine.
    Preserves raw DVR hardware clocks while calculating verified UTC timestamps
    with documented timezone offsets and sub-second hardware drift compensation curves.
    Never overwrites the raw hardware timestamp.
    """

    @staticmethod
    def normalize(
        raw_timestamp_str: str,
        timezone_offset_minutes: int = 330,  # Default IST (+05:30)
        clock_drift_seconds: float = 0.0,
        datetime_format: str = "%Y-%m-%d %H:%M:%S",
    ) -> Dict[str, Any]:
        """
        Normalizes a raw device timestamp string to UTC using static drift.
        """
        try:
            dt_local = datetime.datetime.strptime(raw_timestamp_str, datetime_format)
        except ValueError:
            dt_local = datetime.datetime.fromisoformat(raw_timestamp_str)

        # Apply drift correction: True Local Time = Device Time - Drift
        dt_adjusted = dt_local - datetime.timedelta(seconds=clock_drift_seconds)

        # Convert to UTC by subtracting timezone offset
        dt_utc = dt_adjusted - datetime.timedelta(minutes=timezone_offset_minutes)

        return {
            "raw_timestamp": raw_timestamp_str,
            "normalized_utc": dt_utc,
            "timezone_offset_minutes": timezone_offset_minutes,
            "clock_drift_seconds": clock_drift_seconds,
            "formatted_raw": raw_timestamp_str,
            "formatted_utc": dt_utc.strftime("%Y-%m-%d %H:%M:%S UTC"),
        }

    @staticmethod
    def calculate_drift_rate_per_hour(
        start_sync_device_time: datetime.datetime,
        start_sync_reference_utc: datetime.datetime,
        end_sync_device_time: datetime.datetime,
        end_sync_reference_utc: datetime.datetime,
        timezone_offset_minutes: int = 330,
    ) -> float:
        """
        Calculates the hourly clock drift rate (seconds/hour) between two calibration points.
        Positive rate indicates device clock is running FAST (gaining time).
        Negative rate indicates device clock is running SLOW (losing time).
        """
        tz_delta = datetime.timedelta(minutes=timezone_offset_minutes)

        # Convert device timestamps to effective local UTC
        start_device_utc = start_sync_device_time - tz_delta
        end_device_utc = end_sync_device_time - tz_delta

        drift_start = (start_device_utc - start_sync_reference_utc).total_seconds()
        drift_end = (end_device_utc - end_sync_reference_utc).total_seconds()

        elapsed_reference_seconds = (end_sync_reference_utc - start_sync_reference_utc).total_seconds()
        if elapsed_reference_seconds <= 0:
            raise ValueError("Reference end time must be after reference start time")

        elapsed_hours = elapsed_reference_seconds / 3600.0
        drift_rate_per_hour = (drift_end - drift_start) / elapsed_hours
        return drift_rate_per_hour

    @staticmethod
    def normalize_with_drift_curve(
        raw_timestamp_str: str,
        base_device_time: datetime.datetime,
        base_drift_seconds: float,
        drift_rate_seconds_per_hour: float,
        timezone_offset_minutes: int = 330,
        datetime_format: str = "%Y-%m-%d %H:%M:%S",
    ) -> Dict[str, Any]:
        """
        Normalizes a device timestamp by applying dynamic linear drift curve compensation.
        High-precision (microsecond) output suitable for cross-camera synchronization.
        """
        try:
            dt_device = datetime.datetime.strptime(raw_timestamp_str, datetime_format)
        except ValueError:
            dt_device = datetime.datetime.fromisoformat(raw_timestamp_str)

        # Elapsed hours since base calibration checkpoint
        elapsed_seconds = (dt_device - base_device_time).total_seconds()
        elapsed_hours = elapsed_seconds / 3600.0

        # Dynamic accumulated drift at this exact moment
        accumulated_drift = base_drift_seconds + (elapsed_hours * drift_rate_seconds_per_hour)

        # Corrected device time
        dt_adjusted = dt_device - datetime.timedelta(seconds=accumulated_drift)

        # Normalized UTC
        dt_utc = dt_adjusted - datetime.timedelta(minutes=timezone_offset_minutes)

        return {
            "raw_timestamp": raw_timestamp_str,
            "normalized_utc": dt_utc,
            "timezone_offset_minutes": timezone_offset_minutes,
            "base_drift_seconds": base_drift_seconds,
            "drift_rate_per_hour": drift_rate_seconds_per_hour,
            "accumulated_drift_seconds": round(accumulated_drift, 4),
            "formatted_raw": raw_timestamp_str,
            "formatted_utc": dt_utc.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3] + " UTC",
        }
