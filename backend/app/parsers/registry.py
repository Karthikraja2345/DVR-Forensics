from pathlib import Path
from typing import Dict, List, Optional, Tuple
from app.parsers.base import BaseDVRParser


class ParserRegistry:
    """
    Plugin Registry for DVR/NVR vendor adapters.
    Allows runtime discovery and dispatch based on multi-signal detection.
    """

    def __init__(self):
        self._parsers: Dict[str, BaseDVRParser] = {}

    def register(self, parser: BaseDVRParser) -> None:
        """
        Registers a new vendor parser adapter.
        """
        key = parser.vendor_name.upper().replace(" ", "_")
        self._parsers[key] = parser

    def get_parser(self, vendor_name: str) -> Optional[BaseDVRParser]:
        """
        Retrieves a parser by vendor name.
        """
        key = vendor_name.upper().replace(" ", "_")
        return self._parsers.get(key)

    def list_parsers(self) -> List[BaseDVRParser]:
        """
        Returns all registered parser plugins.
        """
        return list(self._parsers.values())

    def find_best_parser(self, file_path: Path) -> Tuple[Optional[BaseDVRParser], float, List[str]]:
        """
        Tests all registered parsers against file_path and selects the highest confidence match.
        """
        best_parser: Optional[BaseDVRParser] = None
        best_confidence: float = 0.0
        best_reasons: List[str] = []

        for parser in self._parsers.values():
            matched, confidence, reasons = parser.detect(file_path)
            if matched and confidence > best_confidence:
                best_parser = parser
                best_confidence = confidence
                best_reasons = reasons

        return best_parser, best_confidence, best_reasons


# Global registry instance
parser_registry = ParserRegistry()
