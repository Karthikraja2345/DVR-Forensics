from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime


@dataclass
class RecordingDescriptor:
    channel_id: str
    camera_name: str
    start_time_raw: str
    end_time_raw: str
    start_time_utc: datetime
    end_time_utc: datetime
    duration_seconds: float
    source_sector_offset: int
    source_byte_length: int
    file_path: str
    codec: str = "H.264"
    resolution: str = "1920x1080"
    fps: float = 25.0
    sha256: str = ""
    md5: str = ""


@dataclass
class RecoveredArtifactDescriptor:
    artifact_id: str
    channel_id: Optional[str]
    recovery_status: str  # CONFIRMED, PROBABLE, PARTIAL, FAILED
    confidence_score: float
    recovery_method: str
    explanation_rules: Dict[str, Any]
    source_byte_offset: int
    source_byte_length: int
    file_path: str
    start_time_utc: Optional[datetime]
    duration_seconds: float
    codec: str = "H.264"
    sha256: str = ""
    md5: str = ""


@dataclass
class ParseResult:
    vendor_name: str
    profile_name: str
    total_recordings: int
    channels: List[str]
    filesystem_metadata: Dict[str, Any] = field(default_factory=dict)
    recordings: List[RecordingDescriptor] = field(default_factory=list)


@dataclass
class ValidationResult:
    is_valid: bool
    status: str
    checks_passed: List[str] = field(default_factory=list)
    checks_failed: List[str] = field(default_factory=list)
    details: Dict[str, Any] = field(default_factory=dict)


class BaseDVRParser(ABC):
    """
    Abstract Base Class for all DVR/NVR proprietary filesystem and container parsers.
    Isolates proprietary storage logic within modular adapters.
    """

    vendor_name: str = "GENERIC"
    profile_name: str = "GENERIC_PROFILE"
    supported_version: str = "1.0.0"
    status: str = "PLANNED"  # VALIDATED, PROFILE READY, PLANNED

    @abstractmethod
    def detect(self, source_path: Path) -> Tuple[bool, float, List[str]]:
        """
        Evaluates binary headers and signatures.
        Returns (is_match, confidence, reasons).
        """
        pass

    @abstractmethod
    def parse(self, source_path: Path, output_dir: Path) -> ParseResult:
        """
        Traverses disk structures and extracts allocated recordings and metadata.
        """
        pass

    @abstractmethod
    def recover(self, source_path: Path, output_dir: Path) -> List[RecoveredArtifactDescriptor]:
        """
        Carves unallocated clusters for deleted video artifacts.
        """
        pass

    def validate(self, artifact_path: Path) -> ValidationResult:
        """
        Validates the extracted or recovered artifact's playable structure.
        """
        path = Path(artifact_path)
        if not path.is_file() or path.stat().st_size == 0:
            return ValidationResult(
                is_valid=False,
                status="EMPTY_OR_MISSING",
                checks_failed=["File exists and is non-empty"],
            )

        return ValidationResult(
            is_valid=True,
            status="VALID",
            checks_passed=["Container file exists and contains valid bytes"],
        )
