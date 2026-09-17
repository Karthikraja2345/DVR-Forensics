import datetime
from pathlib import Path
from typing import List, Dict, Any
from app.recovery.signatures import H264_NAL_SPS, NAL_PREFIX_4BYTE
from app.recovery.validator import RecoveryValidator
from app.parsers.base import RecoveredArtifactDescriptor
from app.forensic.hashing.hasher import DualHasher


class VideoCarver:
    """
    Forensic Video Stream Carver.
    Performs raw sliding byte window scans across unallocated sectors to identify
    H.264/H.265 GOP boundaries and reconstruct deleted footage.
    """

    @classmethod
    def carve_raw_image(
        cls,
        image_path: Path,
        output_dir: Path,
        min_clip_bytes: int = 1024,
        max_clip_bytes: int = 10485760,  # 10 MB default max per clip
    ) -> List[RecoveredArtifactDescriptor]:
        """
        Carves H.264 video streams from raw disk image.
        """
        path = Path(image_path)
        out_dir = Path(output_dir)
        out_dir.mkdir(parents=True, exist_ok=True)

        recovered: List[RecoveredArtifactDescriptor] = []

        with open(path, "rb") as f:
            data = f.read()

        # Find all occurrences of H.264 SPS (Sequence Parameter Set)
        sps_indices = []
        pos = 0
        while True:
            idx = data.find(H264_NAL_SPS, pos)
            if idx == -1:
                break
            sps_indices.append(idx)
            pos = idx + len(H264_NAL_SPS)

        for i, start_offset in enumerate(sps_indices):
            # Clip ends at the next SPS or max_clip_bytes
            if i + 1 < len(sps_indices):
                end_offset = sps_indices[i + 1]
            else:
                end_offset = min(start_offset + max_clip_bytes, len(data))

            clip_len = end_offset - start_offset
            if clip_len < min_clip_bytes:
                continue

            clip_bytes = data[start_offset:end_offset]

            # Validate structural integrity
            status, score, explanation = RecoveryValidator.validate_h264_stream(clip_bytes)
            if status == "FAILED":
                continue

            artifact_id = f"ART-CARVED-OFFSET-{start_offset:08X}"
            clip_file = out_dir / f"{artifact_id}.mp4"
            with open(clip_file, "wb") as out_f:
                out_f.write(clip_bytes)

            md5_hex, sha256_hex = DualHasher.hash_bytes(clip_bytes)

            recovered.append(
                RecoveredArtifactDescriptor(
                    artifact_id=artifact_id,
                    channel_id="CARVED",
                    recovery_status=status,
                    confidence_score=score,
                    recovery_method="RAW_H264_NAL_CARVING",
                    explanation_rules=explanation,
                    source_byte_offset=start_offset,
                    source_byte_length=clip_len,
                    file_path=str(clip_file),
                    start_time_utc=datetime.datetime.utcnow(),
                    duration_seconds=round(clip_len / (1024 * 64), 2),  # Estimated duration
                    codec="H.264",
                    sha256=sha256_hex,
                    md5=md5_hex,
                )
            )

        return recovered
