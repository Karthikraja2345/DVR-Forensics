import pytest
from app.parsers.registry import parser_registry


def test_parser_registry_loaded():
    parsers = parser_registry.list_parsers()
    vendor_names = [p.vendor_name for p in parsers]

    assert "Dahua Technology" in vendor_names
    assert "HIKVISION" in vendor_names
    assert "Generic Raw Stream" in vendor_names


def test_dahua_parser_status():
    dahua = parser_registry.get_parser("DAHUA_TECHNOLOGY")
    assert dahua is not None
    assert dahua.status == "VALIDATED"
    assert dahua.profile_name == "DHFS4"


def test_hikvision_parser_status():
    hik = parser_registry.get_parser("HIKVISION")
    assert hik is not None
    assert hik.status == "PROFILE READY"
