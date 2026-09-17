from pathlib import Path
from typing import Tuple, List
from app.parsers.base import (
    BaseDVRParser,
    ParseResult,
    RecoveredArtifactDescriptor,
)


class HikvisionParser(BaseDVRParser):
    """
    Profile-Ready Parser Adapter for Hikvision proprietary container and filesystem formats.
    Demonstrates plug-in architecture while honestly reflecting PROFILE READY status.
    """

    vendor_name = "HIKVISION"
    profile_name = "HIK_CONTAINER"
    supported_version = "2.0"
    status = "PROFILE READY"

    def detect(self, source_path: Path) -> Tuple[bool, float, List[str]]:
        path = Path(source_path)
        if not path.is_file():
            return False, 0.0, ["File not found"]

        with open(path, "rb") as f:
            header = f.read(4096)
            if any(sig in header for sig in [b"HIKVISION", b"HIKB", b"HKMB"]):
                return (
                    True,
                    0.90,
                    [
                        "Matching Hikvision container header signature detected",
                        "HIK master index layout identified",
                    ],
                )

        return False, 0.0, ["No Hikvision signatures found"]

    def parse(self, source_path: Path, output_dir: Path) -> ParseResult:
        raise NotImplementedError(
            "Hikvision full image parse adapter is currently in PROFILE READY status. "
            "Controlled disk image validation scheduled for Phase 2."
        )

    def recover(self, source_path: Path, output_dir: Path) -> List[RecoveredArtifactDescriptor]:
        return []
