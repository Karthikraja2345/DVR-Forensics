# Changelog
All notable changes to the SIH-26150 DVR/NVR Forensics Platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0-rc1] - 2026-09-17

### Added
- **Repository Initialization**: Complete multi-tier repository scaffolding for 3-member parallel development.
- **Documentation Suite**:
  - `REQUIREMENTS.md`: Comprehensive traceability matrix mapping P0-P3 requirements to 3-member owners.
  - `ARCHITECTURE.md`: Subsystem architecture, C4 and Mermaid diagrams, data flow models.
  - `FORENSIC_WORKFLOW.md`: Standard Operating Procedure (SOP) compliant with ISO/IEC 27037.
  - `TEAM_WORKFLOW.md`: Git branching conventions (`feature/memberX-*`) and PR checklists.
  - `TASK_BOARD.md`: Granular 15-day milestone tracking board.
  - `VALIDATION_PLAN.md`: Ground truth validation plan covering 10 benchmarks.
  - `DEMO_PLAN.md`: 3-minute scripted presentation workflow and judge defense playbook.
  - `SECURITY_AND_LEGAL_BOUNDARIES.md`: Ethical boundaries and compliance rules.
  - `KNOWN_LIMITATIONS.md`: Transparent documentation of encryption and hardware limits.
  - `API_SPECIFICATION.md`: OpenAPI REST specification for FastAPI backend.
  - `DATABASE_SCHEMA.md`: Relational database schema with ER diagrams.
  - `PARSER_PLUGIN_SPECIFICATION.md`: `BaseDVRParser` contract and dynamic plugin registry.
  - `RECOVERY_SPECIFICATION.md`: H.264/H.265 NAL carving algorithm and confidence scoring.
  - `CHAIN_OF_CUSTODY_SPECIFICATION.md`: SHA-256 cryptographic chaining and verification formula.
- **Backend Architecture**:
  - Pydantic v2 data transfer schemas.
  - SQLAlchemy 2.0 ORM models for SQLite and PostgreSQL.
  - Deterministic dual hasher (`DualHasher`) computing MD5 and SHA-256 simultaneously.
  - Multi-signal vendor detection engine scanning magic bytes and superblocks.
  - Append-only cryptographic Chain of Custody ledger with `verify_chain()`.
  - Abstract parser plugin system with `DahuaDHFSParser` and `HikvisionParser` stubs.
  - Video carving engine with NAL prefix scanning and GOP assembly.
  - Timestamp normalization engine with timezone and drift compensation.
  - FastAPI router exposing OpenAPI v1 endpoints.
- **Frontend Architecture**:
  - React + TypeScript + Vite project configured with plain CSS / CSS modules (no Tailwind).
  - Forensic Replay dual-pane video player and metadata inspector.
  - Interactive Evidence Lineage DAG visualizer.
  - Cross-camera chronological timeline.
  - Transparent 8-OEM coverage matrix.
- **Fixtures & Demo**:
  - Synthetic Dahua DHFS4 raw disk image generator (`generate_synthetic_fixtures.py`).
  - Offline demo seeder (`create_demo_case.py`) initializing `DEMO-CASE-001`.
  - Automated ground truth validation runner (`run_validation.py`).
  - Pytest automated test suite covering hashing, custody, detection, and parsers.
