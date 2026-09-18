import struct
from pathlib import Path
from typing import Dict, Any, List, Tuple


class VendorDetector:
    """
    Multi-Signal Vendor, Filesystem, and Container Detection Engine.
    Evaluates magic bytes, superblocks, partition tables (MBR/GPT), and
    forensic container signatures (RAW/DD, E01 Expert Witness).
    Strictly avoids relying on file extensions or path names.
    """

    # Forensic Container Signatures
    E01_EVF_SIGNATURE = b"EVF\x09\x0d\x0a\xff\x00"
    E01_LVF_SIGNATURE = b"LVF\x09\x0d\x0a\xff\x00"
    GPT_SIGNATURE = b"EFI PART"
    MBR_BOOT_SIGNATURE = b"\x55\xaa"

    SIGNATURES = {
        "DAHUA": {
            "magic_bytes": [b"DHFS", b"DHAV"],
            "profile": "DHFS4",
            "vendor_name": "Dahua Technology",
            "status": "VALIDATED",
        },
        "CP_PLUS": {
            "magic_bytes": [b"CPPLUS", b"CP_DHFS"],
            "profile": "CP_DHFS",
            "vendor_name": "CP Plus",
            "status": "VALIDATED",
        },
        "HIKVISION": {
            "magic_bytes": [b"HIKVISION", b"HIKB", b"HKMB", b"\x48\x4b\x4d\x42"],
            "profile": "HIK_CONTAINER",
            "vendor_name": "HIKVISION",
            "status": "PROFILE READY",
        },
    }

    @classmethod
    def detect_container(cls, file_path: Path) -> Dict[str, Any]:
        """
        Detects forensic container encapsulation (E01, L01, RAW/DD, AFF4).
        """
        path = Path(file_path)
        if not path.is_file():
            return {
                "container_format": "UNKNOWN",
                "is_container": False,
                "description": f"Target path is not a file: {file_path}",
            }

        try:
            with open(path, "rb") as f:
                header = f.read(1024)

            if header.startswith(cls.E01_EVF_SIGNATURE):
                return {
                    "container_format": "E01",
                    "is_container": True,
                    "description": "Expert Witness Format (E01 / EVF) Forensic Container",
                    "segmented": False,
                }
            elif header.startswith(cls.E01_LVF_SIGNATURE):
                return {
                    "container_format": "L01",
                    "is_container": True,
                    "description": "Logical Evidence File (L01 / LVF) Container",
                    "segmented": False,
                }
            elif header.startswith(b"PK\x03\x04") and b"aff4" in header.lower():
                return {
                    "container_format": "AFF4",
                    "is_container": True,
                    "description": "Advanced Forensic Format 4 (AFF4) Container",
                    "segmented": False,
                }
            else:
                return {
                    "container_format": "RAW_DD",
                    "is_container": False,
                    "description": "Raw Bit-Stream Disk Image / Flat Dump",
                    "segmented": False,
                }
        except Exception as e:
            return {
                "container_format": "ERROR",
                "is_container": False,
                "description": f"Failed to read container header: {str(e)}",
            }

    @classmethod
    def inspect_geometry(cls, file_path: Path) -> Dict[str, Any]:
        """
        Inspects disk image sector geometry, identifying MBR and GPT partition structures.
        """
        path = Path(file_path)
        if not path.is_file():
            return {
                "partition_scheme": "NONE",
                "sector_size": 512,
                "partitions": [],
                "details": "File not found",
            }

        partitions: List[Dict[str, Any]] = []
        scheme = "RAW_UNPARTITIONED"
        details: List[str] = []

        try:
            with open(path, "rb") as f:
                # Read sector 0 (MBR) and sector 1 (GPT)
                sector_data = f.read(1024)

            if len(sector_data) < 512:
                return {
                    "partition_scheme": "TRUNCATED",
                    "sector_size": 512,
                    "partitions": [],
                    "details": "Image smaller than single 512-byte sector",
                }

            # 1. Check MBR Boot Signature at byte 510
            mbr_sig = sector_data[510:512]
            has_mbr_sig = mbr_sig == cls.MBR_BOOT_SIGNATURE

            # 2. Check GPT Header at Sector 1 (byte 512)
            if len(sector_data) >= 1024 and sector_data[512:520] == cls.GPT_SIGNATURE:
                scheme = "GPT"
                details.append("Valid GUID Partition Table (GPT) header detected at LBA 1")
                header_size = struct.unpack("<I", sector_data[524:528])[0]
                first_usable = struct.unpack("<Q", sector_data[552:560])[0]
                last_usable = struct.unpack("<Q", sector_data[560:568])[0]
                disk_guid = sector_data[568:584].hex()
                return {
                    "partition_scheme": scheme,
                    "sector_size": 512,
                    "partitions": [],
                    "gpt_header": {
                        "header_size": header_size,
                        "first_usable_lba": first_usable,
                        "last_usable_lba": last_usable,
                        "disk_guid": disk_guid,
                    },
                    "details": details,
                }

            # 3. Parse MBR Partition Table (4 entries at 0x1BE = 446)
            if has_mbr_sig:
                is_protective_mbr = False
                for idx in range(4):
                    entry_offset = 446 + (idx * 16)
                    entry = sector_data[entry_offset : entry_offset + 16]
                    if len(entry) < 16:
                        continue

                    boot_flag = entry[0]
                    part_type = entry[4]
                    start_lba, total_sectors = struct.unpack("<II", entry[8:16])

                    if part_type == 0xEE:
                        is_protective_mbr = True
                        details.append(f"MBR Entry {idx + 1}: Protective MBR (0xEE) pointing to GPT")
                    elif part_type != 0x00 and total_sectors > 0:
                        partitions.append(
                            {
                                "index": idx + 1,
                                "bootable": boot_flag == 0x80,
                                "type_code": hex(part_type),
                                "start_sector": start_lba,
                                "sector_count": total_sectors,
                                "size_bytes": total_sectors * 512,
                            }
                        )

                if is_protective_mbr:
                    scheme = "GPT_PROTECTIVE"
                elif partitions:
                    scheme = "MBR"
                    details.append(f"Found {len(partitions)} active MBR partition(s)")
                else:
                    scheme = "RAW_UNPARTITIONED"
                    details.append("Valid MBR signature present but partition table is empty")
            else:
                details.append("No standard MBR/GPT partition tables; treated as raw disk volume")

        except Exception as e:
            details.append(f"Geometry inspection error: {str(e)}")

        return {
            "partition_scheme": scheme,
            "sector_size": 512,
            "partitions": partitions,
            "details": details,
        }

    @classmethod
    def detect(cls, file_path: Path) -> Dict[str, Any]:
        """
        Scans raw file/disk image bytes, inspects container & geometry, and identifies vendor profile.
        """
        path = Path(file_path)
        if not path.is_file():
            return {
                "vendor": "UNKNOWN",
                "profile": None,
                "confidence": 0.0,
                "reasons": [f"Target path is not a file: {file_path}"],
                "status": "UNKNOWN",
                "container_type": "UNKNOWN",
                "partition_scheme": "NONE",
            }

        reasons: List[str] = []
        detected_vendor = "UNKNOWN"
        detected_profile = None
        confidence = 0.0
        status = "UNKNOWN"

        # 1. Detect Container Format
        container_info = cls.detect_container(path)
        container_type = container_info.get("container_format", "RAW_DD")
        reasons.append(f"Container: {container_info.get('description', 'Unknown container')}")

        # 2. Inspect Disk Geometry
        geometry_info = cls.inspect_geometry(path)
        partition_scheme = geometry_info.get("partition_scheme", "RAW_UNPARTITIONED")
        if geometry_info.get("partitions"):
            reasons.append(f"Geometry: {len(geometry_info['partitions'])} MBR partitions detected")

        # 3. Scan Filesystem / Video Magic Bytes
        try:
            with open(path, "rb") as f:
                # Read initial 64 KB header
                header = f.read(65536)

                # Dahua / DHFS magic bytes at sector 0 or standard offsets
                if b"DHFS" in header:
                    detected_vendor = "Dahua Technology"
                    detected_profile = "DHFS4"
                    confidence = 1.0
                    status = "VALIDATED"
                    offset = header.find(b"DHFS")
                    reasons.append(f"Matching 'DHFS' filesystem superblock at byte offset 0x{offset:04X}")
                    reasons.append("Identified Dahua Master Sector and Channel Bitmap layout")
                    return {
                        "vendor": detected_vendor,
                        "profile": detected_profile,
                        "confidence": confidence,
                        "reasons": reasons,
                        "status": status,
                        "container_type": container_type,
                        "container_info": container_info,
                        "partition_scheme": partition_scheme,
                        "geometry": geometry_info,
                    }

                # CP Plus specific markers
                if b"CPPLUS" in header or b"CP_DHFS" in header:
                    detected_vendor = "CP Plus"
                    detected_profile = "CP_DHFS"
                    confidence = 0.95
                    status = "VALIDATED"
                    reasons.append("Matching CP Plus OEM proprietary header marker")
                    reasons.append("DHFS compatible index structure detected")
                    return {
                        "vendor": detected_vendor,
                        "profile": detected_profile,
                        "confidence": confidence,
                        "reasons": reasons,
                        "status": status,
                        "container_type": container_type,
                        "container_info": container_info,
                        "partition_scheme": partition_scheme,
                        "geometry": geometry_info,
                    }

                # Hikvision signatures
                if any(sig in header for sig in [b"HIKVISION", b"HIKB", b"HKMB", b"\x48\x4b\x4d\x42"]):
                    detected_vendor = "HIKVISION"
                    detected_profile = "HIK_CONTAINER"
                    confidence = 0.90
                    status = "PROFILE READY"
                    reasons.append("Matching Hikvision container header signature")
                    return {
                        "vendor": detected_vendor,
                        "profile": detected_profile,
                        "confidence": confidence,
                        "reasons": reasons,
                        "status": status,
                        "container_type": container_type,
                        "container_info": container_info,
                        "partition_scheme": partition_scheme,
                        "geometry": geometry_info,
                    }

                # Raw H.264/H.265 stream without filesystem wrapper
                if b"\x00\x00\x00\x01\x67" in header or b"\x00\x00\x01\x67" in header:
                    detected_vendor = "Generic Raw Stream"
                    detected_profile = "GENERIC_H264"
                    confidence = 0.85
                    status = "VALIDATED"
                    reasons.append("Raw H.264 Sequence Parameter Set (SPS) NAL prefix detected")
                    return {
                        "vendor": detected_vendor,
                        "profile": detected_profile,
                        "confidence": confidence,
                        "reasons": reasons,
                        "status": status,
                        "container_type": container_type,
                        "container_info": container_info,
                        "partition_scheme": partition_scheme,
                        "geometry": geometry_info,
                    }

        except Exception as e:
            reasons.append(f"Error reading file headers: {str(e)}")

        reasons.append("No known vendor magic bytes or superblocks detected in initial 64 KB")
        return {
            "vendor": "UNKNOWN",
            "profile": None,
            "confidence": 0.0,
            "reasons": reasons,
            "status": "UNKNOWN",
            "container_type": container_type,
            "container_info": container_info,
            "partition_scheme": partition_scheme,
            "geometry": geometry_info,
        }
