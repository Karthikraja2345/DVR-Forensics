"""
Development Environment Setup Script for SIH-26150 Platform.
"""

import sys
from pathlib import Path

# Ensure root and backend are in sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "backend"))

from app.config import settings
from app.models.base import init_db
from scripts.generate_synthetic_fixtures import generate_dahua_dhfs_fixture


def setup():
    print("[*] Initializing directory topology...")
    settings.EVIDENCE_STORAGE_PATH.mkdir(parents=True, exist_ok=True)
    settings.FIXTURES_PATH.mkdir(parents=True, exist_ok=True)
    settings.REPORTS_OUTPUT_PATH.mkdir(parents=True, exist_ok=True)

    print("[*] Initializing SQLite database schema...")
    init_db()

    fixture_path = settings.FIXTURES_PATH / "sample_images" / "dahua_dhfs_sample_01.raw"
    if not fixture_path.exists():
        print("[*] Generating synthetic Dahua DHFS4 test fixture...")
        generate_dahua_dhfs_fixture(fixture_path)
    else:
        print("[+] Synthetic fixture already present.")

    print("[OK] Dev environment initialized successfully.")


if __name__ == "__main__":
    setup()
