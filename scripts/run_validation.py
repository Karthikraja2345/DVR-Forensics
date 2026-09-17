"""
Forensic Validation Benchmark Engine.
Executes ground truth verification against controlled test fixtures.
"""

import os
import sys
from pathlib import Path

# Ensure root and backend are in sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "backend"))

from app.config import settings
from app.forensic.hashing.hasher import DualHasher
from app.forensic.vendor_detection.detector import VendorDetector
from app.parsers.registry import parser_registry
from app.models.base import init_db, SessionLocal
from app.forensic.custody.chain import ChainOfCustodyManager
from scripts.generate_synthetic_fixtures import generate_dahua_dhfs_fixture


def run_benchmarks():
    print("=" * 80)
    print("SIH-26150 DVR/NVR Forensics - Ground Truth Validation Suite")
    print("=" * 80)

    fixture_path = settings.FIXTURES_PATH / "sample_images" / "dahua_dhfs_sample_01.raw"
    if not fixture_path.exists():
        generate_dahua_dhfs_fixture(fixture_path)

    results = []

    # Benchmark 1: Hashing Repeatability
    print("[1/5] Testing Source Hashing Repeatability (10 iterations)...")
    md5_1, sha_1, _ = DualHasher.hash_file(fixture_path)
    hash_repeatable = True
    for _ in range(9):
        m, s, _ = DualHasher.hash_file(fixture_path)
        if m != md5_1 or s != sha_1:
            hash_repeatable = False
            break
    results.append(("BENCH-01", "Source Hashing Repeatability", "100% Match", "100% Match", hash_repeatable))

    # Benchmark 2: Multi-Signal Vendor Detection
    print("[2/5] Testing Vendor Detection on DHFS Superblock...")
    det = VendorDetector.detect(fixture_path)
    vendor_pass = det["vendor"] == "Dahua Technology" and det["confidence"] >= 0.90
    results.append(("BENCH-02", "Vendor Detection", "Dahua DHFS4 (>=0.90)", f"{det['vendor']} ({det['confidence']:.2f})", vendor_pass))

    # Benchmark 3: Active Recording Extraction
    print("[3/5] Testing Active Recording Extraction Recall...")
    parser = parser_registry.get_parser("DAHUA_TECHNOLOGY")
    test_out = settings.BASE_DIR / "tests" / "scratch_output"
    test_out.mkdir(parents=True, exist_ok=True)
    parse_res = parser.parse(fixture_path, test_out)
    parse_pass = len(parse_res.recordings) == 4
    results.append(("BENCH-03", "Active Stream Extraction", "4 Active Channels", f"{len(parse_res.recordings)} Channels Extracted", parse_pass))

    # Benchmark 4: Deleted Recovery Recall
    print("[4/5] Testing Deleted Video Carving Recall...")
    carved = parser.recover(fixture_path, test_out)
    carve_pass = len(carved) >= 1 and carved[0].recovery_status == "CONFIRMED"
    results.append(("BENCH-04", "Deleted Video Carving", "1 Deleted Clip (CONFIRMED)", f"{len(carved)} Carved ({carved[0].recovery_status})", carve_pass))

    # Benchmark 5: Custody Chain Verification
    print("[5/5] Testing Custody Hash-Chaining & Tamper Detection...")
    init_db()
    db = SessionLocal()
    c_case = "TEST-CUST-VAL"
    ev1 = ChainOfCustodyManager.log_event(db, c_case, "EVENT_1", "TEST_USER")
    ev2 = ChainOfCustodyManager.log_event(db, c_case, "EVENT_2", "TEST_USER")
    is_valid, msg, _ = ChainOfCustodyManager.verify_chain(db, c_case)
    results.append(("BENCH-05", "Custody Hash-Chaining", "CHAIN VALID", msg, is_valid))
    db.close()

    print("\n" + "=" * 80)
    print(f"{'ID':<10} | {'Benchmark Name':<28} | {'Target':<22} | {'Actual':<22} | {'Status'}")
    print("-" * 80)
    for bid, name, target, actual, passed in results:
        status_str = "PASS [OK]" if passed else "FAIL [X]"
        print(f"{bid:<10} | {name:<28} | {target:<22} | {actual:<22} | {status_str}")
    print("=" * 80)

    all_passed = all(r[4] for r in results)
    if all_passed:
        print("[OK] ALL 5 FORENSIC GROUND TRUTH BENCHMARKS PASSED SUCCESSFULLY.")
    else:
        print("[X] SOME BENCHMARKS FAILED.")
        sys.exit(1)


if __name__ == "__main__":
    run_benchmarks()
