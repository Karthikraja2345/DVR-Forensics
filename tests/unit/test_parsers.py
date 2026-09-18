import tempfile
from pathlib import Path
import pytest
from app.parsers.registry import parser_registry
from app.parsers.profiles.hikvision import HikvisionParser


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
    assert "PROFILE READY" in hik.status


def test_hikvision_fixture_parsing():
    fixture_path = Path("forensic_fixtures/sample_images/hikvision_sample_01.raw")
    if not fixture_path.is_file():
        pytest.skip("Hikvision fixture not yet generated")

    parser = HikvisionParser()
    detected, conf, reasons = parser.detect(fixture_path)
    assert detected is True
    assert conf >= 0.90
    assert any("Hikvision" in r for r in reasons)

    with tempfile.TemporaryDirectory() as tmp_out:
        out_dir = Path(tmp_out)
        result = parser.parse(fixture_path, out_dir)
        assert result.vendor_name == "HIKVISION"
        assert result.total_recordings == 2
        assert "CAM-01" in result.channels
        assert "CAM-02" in result.channels

        # Recover deleted streams
        carved = parser.recover(fixture_path, out_dir)
        assert len(carved) == 1
        assert carved[0].channel_id == "CAM-03"
        assert carved[0].recovery_status == "CONFIRMED"
        assert carved[0].confidence_score >= 0.95
