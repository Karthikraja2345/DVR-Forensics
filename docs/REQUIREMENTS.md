# Project Requirements & Traceability Matrix
## SIH 2026 – Problem Statement 26150
### Multi-Vendor DVR/NVR Forensic Analysis Tool

---

## 1. Traceability Matrix

| Req ID | Requirement | Priority | Description | Implementation Status | Owner | Validation Method |
| :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| **REQ-01** | Case & Evidence Intake | **P0** | Assign unique `case_id` and `evidence_id`; record device/OEM/model/storage metadata. | **IMPLEMENTED** | Member 1 / Member 3 | Automated API test + DB persistence |
| **REQ-02** | Source Dual Hashing | **P0** | Compute deterministic MD5 and SHA-256 hashes of original raw evidence stream. | **IMPLEMENTED** | Member 1 | 100% repeatability test on known fixture |
| **REQ-03** | Working Copy Isolation | **P0** | Ensure original evidence is mounted/marked strictly read-only; generate bit-stream verified working image. | **IMPLEMENTED** | Member 1 | File write permission check + SHA-256 match |
| **REQ-04** | Multi-Signal Vendor Detection | **P0** | Identify OEM via magic bytes, superblock, and partition structures (not filename). | **IMPLEMENTED** | Member 1 | Sample classification against ground truth fixtures |
| **REQ-05** | Extensible Parser Plugin Engine | **P0** | Abstract base parser interface supporting modular vendor adapters (DHFS, Hikvision, etc.). | **IMPLEMENTED** | Member 1 / Member 2 | Plugin interface compliance unit tests |
| **REQ-06** | Allocated Recording Extraction | **P0** | Parse active video index, channel mapping, duration, and frame metadata from raw disk image. | **IMPLEMENTED** | Member 2 | Compare extracted clip count & duration against fixture |
| **REQ-07** | Deleted Video Recovery | **P0** | Carve unallocated clusters for H.264/H.265 NAL unit signatures and reconstruct deleted footage. | **IMPLEMENTED** | Member 2 | Recover intentionally deleted clip in controlled image |
| **REQ-08** | Recovery Confidence & Explanation | **P1** | Classify recovery as `CONFIRMED`, `PROBABLE`, or `PARTIAL` with human-readable rationale. | **IMPLEMENTED** | Member 2 | Verify validation rules output for clean vs corrupted clips |
| **REQ-09** | Timestamp Normalization | **P0** | Retain raw device clock while calculating normalized UTC timestamp with documented offset/drift. | **IMPLEMENTED** | Member 2 | Unit test with simulated timezone and clock drift |
| **REQ-10** | Cross-Camera Incident Timeline | **P0** | Unify multi-channel recordings into chronological order showing physical movement across cameras. | **IMPLEMENTED** | Member 2 | Test chronological sorting across 4 distinct camera clocks |
| **REQ-11** | Universal Evidence Fingerprint | **P1** | Assign immutable forensic metadata block (ID, offsets, timestamps, hashes, confidence) to each clip. | **IMPLEMENTED** | Member 2 / Member 3 | Verify schema integrity and source byte trace |
| **REQ-12** | Cryptographic Chain of Custody | **P0** | Append-only audit log linking each action with SHA-256 previous hash pointer; verify chain integrity. | **IMPLEMENTED** | Member 1 | Chain tamper detection test (modify record $\to$ fail) |
| **REQ-13** | Evidence Lineage Graph | **P1** | Interactive DAG showing complete transformation pipeline from physical sector to court report. | **IMPLEMENTED** | Member 3 | Verify DAG node connectivity and metadata inspection |
| **REQ-14** | Isolated AI Analytical Layer | **P1** | Run OpenCV motion/object detection strictly on working copies; save findings as separate auxiliary layer. | **IMPLEMENTED** | Member 3 | Verify original and working copies remain unmodified |
| **REQ-15** | Forensic Replay Mode | **P1** | Dual-pane video player displaying video alongside real-time forensic metadata, byte offsets, and hashes. | **IMPLEMENTED** | Member 3 | Manual UI playback check with synchronized metadata |
| **REQ-16** | Standardized Forensic Report | **P0** | Generate court-ready PDF bundle with case summary, hashes, custody ledger, and recovery explanation. | **IMPLEMENTED** | Member 3 | Verify PDF output contains all mandatory ISO fields |
| **REQ-17** | Honest OEM Coverage Matrix | **P1** | Transparent dashboard matrix showing status (`VALIDATED`, `PROFILE READY`, `PLANNED`) for 8 OEMs. | **IMPLEMENTED** | Member 3 | Verify UI matrix accurately reflects automated test status |
| **REQ-18** | Fully Offline Demo Mode | **P0** | Single command seeds `DEMO-CASE-001` with synthetic fixtures; zero external cloud dependencies. | **IMPLEMENTED** | Member 3 | Execute `python scripts/create_demo_case.py` offline |

---

## 2. Requirement Classification

### A. Mandatory (P0 - Prototype Core)
1. Unique Case & Evidence registration.
2. Source Hashing (MD5 + SHA-256).
3. Forensic Image / Working Copy generation.
4. Multi-signal OEM detection.
5. Filesystem / Container parsing for 2 validated profiles (Dahua DHFS, CP Plus).
6. Video and metadata extraction.
7. Deleted video carving from controlled image.
8. Raw and normalized timestamp preservation.
9. Cross-camera chronological timeline.
10. Hash-chained chain of custody log.
11. Standardized forensic report generation.
12. Deterministic, fully offline reproducible demo.

### B. Recommended & Winning Differentiators (P1 - High Impact)
1. Universal Forensic Evidence Fingerprint (byte offset to court attribution).
2. Evidence Lineage Graph (visual DAG from raw bytes to report).
3. Recovery Confidence & Explanation Engine (`CONFIRMED`, `PROBABLE`, `PARTIAL`).
4. Cross-Camera Incident Narrative.
5. Forensic Replay Mode (synchronized metadata & video).
6. Honest OEM coverage matrix (8 OEMs explicitly categorized).
7. AI motion analysis strictly separated from primary evidence.

### C. Stretch Features (P2/P3 - Planned Future Work)
1. **P2**: Profile Ready adapter for Hikvision proprietary container parsing.
2. **P2**: Damaged-file stream repair for partial GOP fragments.
3. **P3**: Live hardware direct acquisition over physical write-blocker bridges.
4. **P3**: Cloud enterprise cluster scaling.

---

## 3. Team Member Allocation Summary

* **Member 1 (Forensics Core & Integrity)**:
  - `REQ-01` (Part), `REQ-02`, `REQ-03`, `REQ-04`, `REQ-05` (Core), `REQ-12`.
* **Member 2 (Parsers, Recovery & Timeline)**:
  - `REQ-05` (Profiles), `REQ-06`, `REQ-07`, `REQ-08`, `REQ-09`, `REQ-10`, `REQ-11`.
* **Member 3 (Platform, UI, AI & Reporting)**:
  - `REQ-01` (API/DB), `REQ-13`, `REQ-14`, `REQ-15`, `REQ-16`, `REQ-17`, `REQ-18`.
