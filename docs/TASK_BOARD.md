# Task Board & 15-Day Milestone Tracking
## SIH 2026 – Problem Statement 26150
### Multi-Vendor DVR/NVR Forensic Analysis Tool

---

## 1. Sprint Task Board

| Task ID | Task Description | Owner | Priority | Status | Dependency | Acceptance Criteria |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **M1-001** | Repository Architecture & Docs Suite | Member 1 | P0 | **DONE** | None | Full `/docs` specs, Makefile, and docker configs present |
| **M1-002** | Deterministic Dual Hasher (MD5+SHA256) | Member 1 | P0 | **DONE** | None | Streaming chunk hasher matches system hashes; unit tests pass |
| **M1-003** | Evidence Working Copy Isolation Engine | Member 1 | P0 | **DONE** | M1-002 | Original image marked read-only; identical working copy created |
| **M1-004** | Multi-Signal Vendor/OEM Detection Engine | Member 1 | P0 | **DONE** | None | Scans magic bytes/superblocks; returns confidence + reasons |
| **M1-005** | Cryptographic Chain of Custody Ledger | Member 1 | P0 | **DONE** | M1-002 | Event ledger links previous hashes; `verify_chain()` validates |
| **M1-006** | Parser Plugin Core & Abstract Registry | Member 1 | P0 | **DONE** | None | `BaseDVRParser` ABC defined; dynamic plugin registration works |
| **M2-001** | Dahua (DHFS4) Validated Parser Profile | Member 2 | P0 | **DONE** | M1-006 | Parses active channels, index tables, and frame boundaries |
| **M2-002** | CP Plus Compatible Parser Profile | Member 2 | P0 | **DONE** | M2-001 | Validates CP Plus variant images using shared DHFS structures |
| **M2-003** | Hikvision Container Profile Ready Stub | Member 2 | P1 | **DONE** | M1-006 | Implements HIK header detection and parsing interface contract |
| **M2-004** | Deleted Video Carving Engine (NAL Scanner) | Member 2 | P0 | **DONE** | None | Carves H.264 SPS/PPS/IDR byte sequences from raw clusters |
| **M2-005** | Recovery Confidence & Explanation Engine | Member 2 | P1 | **DONE** | M2-004 | Emits `CONFIRMED`/`PROBABLE`/`PARTIAL` with diagnostic checklist |
| **M2-006** | Timestamp Normalization Engine | Member 2 | P0 | **DONE** | None | Preserves raw hardware clock; outputs normalized UTC timestamp |
| **M2-007** | Cross-Camera Incident Narrative Engine | Member 2 | P0 | **DONE** | M2-006 | Chronologically correlates multi-channel camera events |
| **M3-001** | Database Models & SQLAlchemy Schemas | Member 3 | P0 | **DONE** | None | SQLite & PostgreSQL schemas for cases, evidence, artifacts |
| **M3-002** | FastAPI REST Endpoints (/api/v1) | Member 3 | P0 | **DONE** | M3-001 | Complete REST routes matching OpenAPI specification |
| **M3-003** | React/TypeScript Forensic UI Dashboard | Member 3 | P0 | **DONE** | M3-002 | Plain CSS forensic interface; zero Tailwind CSS |
| **M3-004** | Forensic Replay Dual-Pane Video Viewer | Member 3 | P1 | **DONE** | M3-003 | Synchronized video playback with live forensic metadata |
| **M3-005** | Universal Evidence Fingerprint Viewer | Member 3 | P1 | **DONE** | M3-003 | Displays byte offsets, dual hashes, and source trace |
| **M3-006** | Evidence Lineage Interactive Graph (DAG) | Member 3 | P1 | **DONE** | M3-003 | Interactive visual DAG connecting physical sector to report |
| **M3-007** | Isolated AI Motion Analytics Engine | Member 3 | P1 | **DONE** | None | OpenCV background subtraction; saves separate auxiliary findings |
| **M3-008** | Standardized Forensic PDF Report Generator| Member 3 | P0 | **DONE** | M1-005 | Generates court-ready PDF bundle with custody and hash stamps |
| **M3-009** | Synthetic Fixture Generator & Demo Seeder | Member 3 | P0 | **DONE** | M2-001 | `create_demo_case.py` initializes `DEMO-CASE-001` offline |
| **M3-010** | Automated Validation Benchmark Script | Member 3 | P0 | **DONE** | M3-009 | `run_validation.py` verifies all 10 ground truth metrics |

---

## 2. 15-Day Milestone Roadmap

* **Day 1: Repository Foundation, Contracts & Schemas**
  - Initialize project layout, Git rules, docker orchestration, documentation, Pydantic schemas, and DB models.
* **Day 2: Evidence Intake & Dual Hashing Core**
  - Implement streaming MD5 + SHA-256 calculation, read-only evidence protection, and working copy duplication.
* **Day 3: Multi-Signal Vendor Detection & Plugin Interface**
  - Build signature scanning engine and abstract `BaseDVRParser` registry.
* **Day 4: Validated Parser #1 (Dahua DHFS4)**
  - Implement Dahua superblock parsing, active index resolution, and stream extraction.
* **Day 5: Validated Parser #2 (CP Plus Compatible)**
  - Verify CP Plus OEM variants against shared DHFS structures; establish test fixture parity.
* **Day 6: Parser #3 (Hikvision Profile Ready) & Carving Core**
  - Implement Hikvision profile contracts and raw H.264 byte scanner.
* **Day 7: Controlled Deleted Video Recovery**
  - Build NAL unit assembly, GOP reconstruction, and explainable confidence scoring.
* **Day 8: Metadata Extraction & Timestamp Normalization**
  - Implement dual-timestamp engine (raw vs normalized UTC) with timezone and drift compensation.
* **Day 9: Cross-Camera Incident Narrative**
  - Multi-camera chronological event sorter and incident path reconstruction.
* **Day 10: Isolated AI Motion Analytics**
  - OpenCV background modeling; strict isolation of AI findings from primary evidence.
* **Day 11: Cryptographic Chain of Custody & PDF Report Engine**
  - Hash-chained audit logging, tamper detection, and ReportLab court report generation.
* **Day 12: Forensic Validation Framework**
  - Automated validation benchmarks testing repeatability, accuracy, and recovery ground truth.
* **Day 13: Full Frontend Dashboard & OEM Coverage Matrix**
  - Forensic Replay viewer, Evidence Lineage DAG, and transparent 8-OEM matrix.
* **Day 14: Demonstration Rehearsal, PPT & Judge Q&A Defense**
  - 3-minute scripted offline demonstration run-through and edge-case verification.
* **Day 15: Code Freeze, Documentation Seal & Backup**
  - Zero code modifications; final packaging and offline USB image creation.
