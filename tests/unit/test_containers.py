import struct
import tempfile
from pathlib import Path
import pytest
from app.forensic.vendor_detection.detector import VendorDetector


def test_e01_container_detection():
    with tempfile.NamedTemporaryFile(delete=False) as tf:
        tf.write(VendorDetector.E01_EVF_SIGNATURE + b"\x01\x00\x00\x00" + b"\x00" * 1024)
        tf_path = Path(tf.name)

    try:
        container = VendorDetector.detect_container(tf_path)
        assert container["container_format"] == "E01"
        assert container["is_container"] is True
        assert "Expert Witness" in container["description"]

        # Full detector also reflects container
        full_res = VendorDetector.detect(tf_path)
        assert full_res["container_type"] == "E01"
    finally:
        tf_path.unlink()


def test_l01_container_detection():
    with tempfile.NamedTemporaryFile(delete=False) as tf:
        tf.write(VendorDetector.E01_LVF_SIGNATURE + b"\x00" * 1024)
        tf_path = Path(tf.name)

    try:
        container = VendorDetector.detect_container(tf_path)
        assert container["container_format"] == "L01"
        assert container["is_container"] is True
    finally:
        tf_path.unlink()


def test_raw_dd_container_detection():
    with tempfile.NamedTemporaryFile(delete=False) as tf:
        tf.write(b"RANDOM_DISK_SECTOR_DATA" + b"\x00" * 1024)
        tf_path = Path(tf.name)

    try:
        container = VendorDetector.detect_container(tf_path)
        assert container["container_format"] == "RAW_DD"
        assert container["is_container"] is False
    finally:
        tf_path.unlink()


def test_mbr_partition_geometry():
    # Construct 512-byte MBR sector with 1 partition
    sector = bytearray(512)
    # Boot signature at 510-512
    sector[510:512] = b"\x55\xaa"
    # Entry 1 at offset 446
    # [boot=0x80, start_chs(3), type=0x83 (Linux), end_chs(3), start_lba=2048, sectors=16384]
    entry = bytearray(16)
    entry[0] = 0x80  # Bootable
    entry[4] = 0x83  # Linux native
    struct.pack_into("<II", entry, 8, 2048, 16384)
    sector[446:462] = entry

    with tempfile.NamedTemporaryFile(delete=False) as tf:
        tf.write(sector)
        tf_path = Path(tf.name)

    try:
        geom = VendorDetector.inspect_geometry(tf_path)
        assert geom["partition_scheme"] == "MBR"
        assert len(geom["partitions"]) == 1
        part = geom["partitions"][0]
        assert part["bootable"] is True
        assert part["type_code"] == "0x83"
        assert part["start_sector"] == 2048
        assert part["sector_count"] == 16384
        assert part["size_bytes"] == 16384 * 512
    finally:
        tf_path.unlink()


def test_gpt_partition_geometry():
    # Construct 1024-byte image: sector 0 dummy, sector 1 GPT header
    data = bytearray(1024)
    data[510:512] = b"\x55\xaa"
    # GPT header at 512: "EFI PART"
    data[512:520] = b"EFI PART"
    # header_size = 92
    struct.pack_into("<I", data, 524, 92)
    # first_usable_lba = 34, last_usable_lba = 20000
    struct.pack_into("<QQ", data, 552, 34, 20000)

    with tempfile.NamedTemporaryFile(delete=False) as tf:
        tf.write(data)
        tf_path = Path(tf.name)

    try:
        geom = VendorDetector.inspect_geometry(tf_path)
        assert geom["partition_scheme"] == "GPT"
        assert "gpt_header" in geom
        assert geom["gpt_header"]["first_usable_lba"] == 34
        assert geom["gpt_header"]["last_usable_lba"] == 20000
    finally:
        tf_path.unlink()
