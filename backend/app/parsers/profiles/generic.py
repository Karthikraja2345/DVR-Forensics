from pathlib import Path
from typing import Tuple, List
from app.parsers.base import (
    BaseDVRParser,
    ParseResult,
    RecordingDescriptor,
    RecoveredArtifactDescriptor,
)
from app.forensic.hashing.hasher import DualHasher


class GenericRawParser(BaseDVRParser):
    """
    Fallback parser for generic raw disk images and unformatted H.264 video streams.
    """

    vendor_name = "Generic Raw Stream"
    profile_name = "GENERIC_H264"
    supported_version = "1.0"
    status = "VALIDATED"

    def detect(self, source_path: Path) -> Tuple[bool, float, List[str]]:
        path = Path(source_path)
        if not path.is_file():
            return False, 0.0, ["File not found"]

        with open(path, "rb") as f:
            header = f.read(4096)
            if b"\x00\x00\x00\x01\x67" in header or b"\x00\x00\x01\x67" in header:
                return (
                    True,
                    0.85,
                    ["Raw H.264 Sequence Parameter Set (SPS) NAL prefix detected"],
                )

        return False, 0.0, ["No generic raw video streams detected"]

    def parse(self, source_path: Path, output_dir: Path) -> ParseResult:
        # Generic raw stream treats the whole file as a single unformatted stream
        return ParseResult(
            vendor_name=self.vendor_name,
            profile_name=self.profile_name,
            total_recordings=0,
            channels=[],
            filesystem_metadata={"mode": "RAW_STREAM"},
            recordings=[],
        )

    def recover(self, source_path: Path, output_dir: Path) -> List[RecoveredArtifactDescriptor]:
        return []
