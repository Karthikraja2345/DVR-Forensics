import datetime
from typing import Tuple, Optional, Dict, Any


class TimestampNormalizer:
    """
    Forensic Timestamp Normalization Engine.
    Preserves raw DVR hardware clocks while calculating verified UTC timestamps
    with documented timezone offsets and hardware drift compensation.
    Never overwrites the raw timestamp.
    """

    @staticmethod
    def normalize(
        raw_timestamp_str: str,
        timezone_offset_minutes: int = 330,  # Default IST (+05:30)
        clock_drift_seconds: float = 0.0,
        datetime_format: str = "%Y-%m-%d %H:%M:%S",
    ) -> Dict[str, Any]:
        """
        Normalizes a raw device timestamp string to UTC.
        """
        try:
            # Parse raw device timestamp
            dt_local = datetime.datetime.strptime(raw_timestamp_str, datetime_format)
        except ValueError:
            # Fallback to ISO format parsing
            dt_local = datetime.datetime.fromisoformat(raw_timestamp_str)

        # Apply drift correction: True Time = Device Time - Drift
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
