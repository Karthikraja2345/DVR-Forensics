"""
Synthetic Forensic Fixture Generator for SIH-26150 DVR/NVR Platform.
Generates a controlled Dahua DHFS4 raw disk image containing:
 - Valid DHFS superblock at Sector 0.
 - Master index at Sector 1 with 4 allocated recordings (CAM-01, CAM-02, CAM-04, CAM-05).
 - 1 deleted recording index (CAM-03) with intact H.264 NAL byte payload in unallocated clusters.
 - Realistic H.264 video streams containing valid SPS, PPS, IDR, and non-IDR NAL units.
"""

import os
import struct
import datetime
from pathlib import Path


def create_mock_h264_stream(num_frames: int = 25) -> bytes:
    """
    Constructs a syntactically valid H.264 elementary stream with SPS, PPS, and IDR/non-IDR slices.
    """
    stream = bytearray()

    # NAL Unit 1: SPS (Sequence Parameter Set) - 0x67
    # Baseline profile, level 3.1, 1920x1080
    sps_payload = bytes.fromhex("000000016742c01fda014016ec0440000003004000000ca03c58bb80")
    stream.extend(sps_payload)

    # NAL Unit 2: PPS (Picture Parameter Set) - 0x68
    pps_payload = bytes.fromhex("0000000168ce3880")
    stream.extend(pps_payload)

    # NAL Unit 3: IDR Keyframe slice (I-Frame) - 0x65
    idr_prefix = bytes.fromhex("00000001658880")
    stream.extend(idr_prefix + (b"\xAA" * 2048))  # 2KB slice data

    # Non-IDR P-frames (0x61)
    for _ in range(num_frames - 1):
        p_prefix = bytes.fromhex("00000001618880")
        stream.extend(p_prefix + (b"\xBB" * 1024))  # 1KB slice data

    return bytes(stream)


def generate_dahua_dhfs_fixture(output_path: Path):
    output_path.parent.mkdir(parents=True, exist_ok=True)

    SECTOR_SIZE = 512
    TOTAL_SECTORS = 16384  # 8 MB raw disk image fixture
    disk_data = bytearray(TOTAL_SECTORS * SECTOR_SIZE)

    # Sector 0: DHFS Superblock
    # Magic bytes "DHFS", Version 4, Total Sectors, Sector Size
    superblock = struct.pack("<4sIIII488s", b"DHFS", 4, TOTAL_SECTORS, SECTOR_SIZE, 0, b"\x00" * 488)
    disk_data[0:SECTOR_SIZE] = superblock

    # Master index starting at Sector 1 (offset 512)
    # Entry format: [16s: channel_id][I: start_sec][I: num_secs][Q: epoch_ts][16s: cam_name][20s: reserved]
    base_epoch = int(datetime.datetime(2026, 9, 11, 14, 31, 4).timestamp())

    # 4 Allocated Recordings
    recordings_info = [
        ("CAM-01", 100, 20, base_epoch, "Gate Entrance"),
        ("CAM-02", 150, 20, base_epoch + 7, "Corridor Hallway"),
        ("CAM-04", 200, 20, base_epoch + 14, "Parking Lot East"),
        ("CAM-05", 250, 20, base_epoch + 21, "Perimeter Exit"),
    ]

    index_offset = SECTOR_SIZE
    for channel_id, start_sec, num_secs, epoch_ts, cam_name in recordings_info:
        entry = struct.pack(
            "<16sIIQ16s20s",
            channel_id.encode("ascii"),
            start_sec,
            num_secs,
            epoch_ts,
            cam_name.encode("ascii"),
            b"\x00" * 20,
        )
        disk_data[index_offset : index_offset + 64] = entry
        index_offset += 64

        # Write video stream at designated sectors
        stream_bytes = create_mock_h264_stream(num_frames=25)
        byte_start = start_sec * SECTOR_SIZE
        disk_data[byte_start : byte_start + len(stream_bytes)] = stream_bytes

    # 1 Deliberately Deleted Recording (CAM-03)
    # Marked with "DEL_" prefix in index, but video payload intact at Sector 300
    del_channel = "DEL_CAM-03"
    del_start_sec = 300
    del_num_secs = 20
    del_epoch = base_epoch + 10
    del_cam_name = "Loading Bay"

    del_entry = struct.pack(
        "<16sIIQ16s20s",
        del_channel.encode("ascii"),
        del_start_sec,
        del_num_secs,
        del_epoch,
        del_cam_name.encode("ascii"),
        b"\x00" * 20,
    )
    disk_data[index_offset : index_offset + 64] = del_entry

    del_stream = create_mock_h264_stream(num_frames=30)
    del_byte_start = del_start_sec * SECTOR_SIZE
    disk_data[del_byte_start : del_byte_start + len(del_stream)] = del_stream

    with open(output_path, "wb") as f:
        f.write(disk_data)

    print(f"[+] Successfully generated synthetic DHFS fixture: {output_path} ({len(disk_data):,} bytes)")


if __name__ == "__main__":
    fixtures_dir = Path(__file__).resolve().parent.parent / "forensic_fixtures" / "sample_images"
    fixture_file = fixtures_dir / "dahua_dhfs_sample_01.raw"
    generate_dahua_dhfs_fixture(fixture_file)
