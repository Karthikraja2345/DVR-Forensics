from app.parsers.base import (
    BaseDVRParser,
    ParseResult,
    RecordingDescriptor,
    RecoveredArtifactDescriptor,
    ValidationResult,
)
from app.parsers.registry import ParserRegistry, parser_registry
from app.parsers.profiles.dahua import DahuaDHFSParser
from app.parsers.profiles.hikvision import HikvisionParser
from app.parsers.profiles.generic import GenericRawParser

# Register default adapters
parser_registry.register(DahuaDHFSParser())
parser_registry.register(HikvisionParser())
parser_registry.register(GenericRawParser())

__all__ = [
    "BaseDVRParser",
    "ParseResult",
    "RecordingDescriptor",
    "RecoveredArtifactDescriptor",
    "ValidationResult",
    "ParserRegistry",
    "parser_registry",
    "DahuaDHFSParser",
    "HikvisionParser",
    "GenericRawParser",
]
