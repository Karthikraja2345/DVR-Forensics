"""
Synthetic Hikvision HKMB Fixture Generator for SIH-26150 DVR/NVR Platform.
Generates a controlled Hikvision raw disk image containing:
 - Valid HKMB superblock at Sector 0.
 - Hikvision Master Index table at Sector 1 with allocated channels (CAM-01, CAM-02).
 - 1 deleted recording (DEL_CAM-03) with valid H.264 video payload.
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
    sps_payload = bytes.fromhex("000000016742c01fda014016ec0440000003004000000ca03c58bb80")
    stream.extend(sps_payload)

    # NAL Unit 2: PPS (Picture Parameter Set) - 0x68
    pps_payload = bytes.fromhex("0000000168ce3880")
    stream.extend(pps_payload)

    # NAL Unit 3: IDR Keyframe slice (I-Frame) - 0x65
    idr_prefix = bytes.fromhex("00000001658880")
    stream.extend(idr_prefix + (b"\xDD" * 2048))

    # Non-IDR P-frames (0x61)
    for _ in range(num_frames - 1):
        p_prefix = bytes.fromhex("00000001618880")
        stream.extend(p_prefix + (b"\xEE" * 1024))

    return bytes(stream)


def generate_hikvision_fixture(output_path: Path):
    output_path.parent.mkdir(parents=True, exist_ok=True)

    SECTOR_SIZE = 512
    TOTAL_SECTORS = 8192  # 4 MB raw disk image fixture
    disk_data = bytearray(TOTAL_SECTORS * SECTOR_SIZE)

    # Sector 0: HKMB Superblock
    # Magic bytes "HKMB", Version 2, Total Sectors, Sector Size
    superblock = struct.pack("<4sIIII488s", b"HKMB", 2, TOTAL_SECTORS, SECTOR_SIZE, 0, b"\x00" * 488)
    disk_data[0:SECTOR_SIZE] = superblock

    # Master index starting at Sector 1 (offset 512)
    # Entry format: [16s: channel_id][I: start_sec][I: num_secs][Q: epoch_ts][16s: cam_name][20s: reserved]
    base_epoch = int(datetime.datetime(2026, 9, 11, 14, 30, 0).timestamp())

    # 2 Allocated Recordings
    allocated_info = [
        ("CAM-01", 64, 64, base_epoch, "Hikvision Main Entrance"),
        ("CAM-02", 128, 64, base_epoch + 15, "Hikvision Perimeter North"),
    ]

    index_offset = 512
    for ch_id, sec_start, sec_len, ep_ts, cam_name in allocated_info:
        entry = struct.pack(
            "<16sIIQ16s20s",
            ch_id.encode("ascii"),
            sec_start,
            sec_len,
            ep_ts,
            cam_name.encode("ascii"),
            b"\x00" * 20,
        )
        disk_data[index_offset : index_offset + 64] = entry
        index_offset += 64

        # Write video stream payload
        video_bytes = create_mock_h264_stream(num_frames=25)
        byte_start = sec_start * SECTOR_SIZE
        disk_data[byte_start : byte_start + len(video_bytes)] = video_bytes

    # 1 Deleted Recording (DEL_CAM-03)
    del_entry = struct.pack(
        "<16sIIQ16s20s",
        b"DEL_CAM-03",
        192,
        64,
        base_epoch + 30,
        b"Hikvision Rear Gate",
        b"\x00" * 20,
    )
    disk_data[index_offset : index_offset + 64] = del_entry

    del_video_bytes = create_mock_h264_stream(num_frames=30)
    del_byte_start = 192 * SECTOR_SIZE
    disk_data[del_byte_start : del_byte_start + len(del_video_bytes)] = del_video_bytes

    with open(output_path, "wb") as f:
        f.write(disk_data)

    print(f"[OK] Generated synthetic Hikvision fixture: {output_path} ({len(disk_data):,} bytes)")


if __name__ == "__main__":
    out_file = Path("forensic_fixtures/sample_images/hikvision_sample_01.raw")
    generate_hikvision_fixture(out_file)
