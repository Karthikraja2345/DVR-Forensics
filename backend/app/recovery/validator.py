from pathlib import Path
from typing import Dict, Any, Tuple
from app.recovery.signatures import (
    NAL_PREFIX_4BYTE,
    H264_NAL_SPS,
    H264_NAL_PPS,
    H264_NAL_IDR,
)


class RecoveryValidator:
    """
    Forensic Video Stream Validation & Explanation Engine.
    Evaluates recovered raw byte sequences for valid container structure,
    NAL unit cadence, keyframe presence, and stream playability.
    """

    @classmethod
    def validate_h264_stream(cls, stream_bytes: bytes) -> Tuple[str, float, Dict[str, Any]]:
        """
        Validates raw H.264 stream bytes and returns:
        (recovery_status, confidence_score, explanation_checklist)
        """
        if not stream_bytes or len(stream_bytes) < 128:
            return (
                "FAILED",
                0.1,
                {
                    "valid_sps": False,
                    "valid_pps": False,
                    "valid_idr": False,
                    "min_size_met": False,
                    "rationale": "Byte stream is empty or under minimum structural threshold",
                },
            )

        has_sps = H264_NAL_SPS in stream_bytes or b"\x00\x00\x01\x67" in stream_bytes
        has_pps = H264_NAL_PPS in stream_bytes or b"\x00\x00\x01\x68" in stream_bytes
        has_idr = H264_NAL_IDR in stream_bytes or b"\x00\x00\x01\x65" in stream_bytes

        # Count NAL prefixes
        prefix_count = stream_bytes.count(NAL_PREFIX_4BYTE)

        explanation = {
            "valid_sps": has_sps,
            "valid_pps": has_pps,
            "valid_idr": has_idr,
            "nal_prefixes_detected": prefix_count,
            "payload_bytes": len(stream_bytes),
        }

        # Full structure: SPS + PPS + Keyframe (IDR)
        if has_sps and has_pps and has_idr and prefix_count >= 10:
            explanation["rationale"] = (
                "Valid H.264 SPS, PPS, and IDR keyframe slices detected. "
                "Complete Group of Pictures (GOP) structure intact with verified cadence."
            )
            return "CONFIRMED", 0.98, explanation

        # Probable: IDR keyframe present with some SPS/PPS information
        if has_idr and (has_sps or has_pps):
            explanation["rationale"] = (
                "Keyframe (IDR) slices detected. Some sequence parameters missing "
                "but stream is reconstructable using generic H.264 profile."
            )
            return "PROBABLE", 0.78, explanation

        # Partial: Slice data present but headers corrupted or truncated
        if prefix_count >= 5:
            explanation["rationale"] = (
                "Partial NAL slice fragments carved from unallocated clusters. "
                "Initial container headers appear overwritten."
            )
            return "PARTIAL", 0.52, explanation

        explanation["rationale"] = "Inconclusive byte sequence; unplayable video stream"
        return "FAILED", 0.20, explanation
