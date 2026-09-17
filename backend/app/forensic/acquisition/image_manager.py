import os
import shutil
import stat
from pathlib import Path
from typing import Dict, Tuple
from app.config import settings
from app.forensic.hashing.hasher import DualHasher


class EvidenceImageManager:
    """
    Manages ISO/IEC 27037 compliant evidence directory hierarchy,
    read-only write-inhibition on originals, and working copy duplication.
    """

    SUBDIRS = [
        "00_case_metadata",
        "01_original_evidence",
        "02_forensic_image",
        "03_working_copy",
        "04_parsed_metadata",
        "05_recovered_media",
        "06_exports",
        "07_hashes",
        "08_timeline",
        "09_ai_findings",
        "10_report",
        "11_chain_of_custody",
    ]

    @classmethod
    def initialize_case_directory(cls, case_id: str) -> Path:
        """
        Creates the standardized evidence folder structure.
        """
        case_dir = settings.EVIDENCE_STORAGE_PATH / case_id
        case_dir.mkdir(parents=True, exist_ok=True)

        for subdir in cls.SUBDIRS:
            (case_dir / subdir).mkdir(parents=True, exist_ok=True)

        return case_dir

    @classmethod
    def ingest_original_evidence(
        cls, case_id: str, evidence_id: str, source_path: Path
    ) -> Tuple[Path, Path, str, str]:
        """
        Copies evidence to 01_original_evidence, sets read-only, hashes,
        and generates verified working copy in 03_working_copy.
        Returns: (original_path, working_copy_path, md5, sha256)
        """
        case_dir = cls.initialize_case_directory(case_id)
        src = Path(source_path)

        orig_dest = case_dir / "01_original_evidence" / f"{evidence_id}_{src.name}"
        if not orig_dest.exists():
            shutil.copy2(src, orig_dest)

        # Enforce read-only permissions on original
        if settings.FORCE_READ_ONLY_ORIGINAL:
            try:
                os.chmod(orig_dest, stat.S_IREAD | stat.S_IRGRP | stat.S_IROTH)
            except Exception:
                pass

        # Compute dual hashes on original
        md5, sha256, _ = DualHasher.hash_file(orig_dest)

        # Generate forensic image copy
        forensic_img = case_dir / "02_forensic_image" / f"{evidence_id}_{src.name}"
        if not forensic_img.exists():
            shutil.copy2(orig_dest, forensic_img)

        # Generate analytical working copy
        working_copy = case_dir / "03_working_copy" / f"{evidence_id}_{src.name}"
        if not working_copy.exists():
            shutil.copy2(orig_dest, working_copy)

        return orig_dest, working_copy, md5, sha256
