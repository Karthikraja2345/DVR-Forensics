# SIH 26150 – Multi-Vendor DVR/NVR Forensic Analysis Platform

[![SIH 2026](https://img.shields.io/badge/SIH-2026-blue.svg)](https://sih.gov.in)
[![Problem Statement](https://img.shields.io/badge/PS-26150-orange.svg)](#)
[![Python](https://img.shields.io/badge/Python-3.11+-green.svg)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](#)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> **Development of a Multi-Vendor DVR/NVR Forensic Analysis Tool for Standardized Acquisition, Recovery, and Analysis of Surveillance Evidence**
> 
> *Core Identity: "Evidence lineage from DVR bytes to investigation."*  
> *One-Line Pitch: "From proprietary DVR storage to a validated, traceable and investigation-ready evidence package—without losing where the evidence came from."*

---

## Table of Contents
1. [Problem Statement & Background](#1-problem-statement--background)
2. [Solution Architecture](#2-solution-architecture)
3. [Five Winning Differentiators](#3-five-winning-differentiators)
4. [Technology Stack](#4-technology-stack)
5. [Repository Structure](#5-repository-structure)
6. [3-Member Team Ownership](#6-3-member-team-ownership)
7. [Supported OEM Profiles & Honest Matrix](#7-supported-oem-profiles--honest-matrix)
8. [Forensic Workflow & SOP](#8-forensic-workflow--sop)
9. [Chain of Custody & Dual Hashing](#9-chain-of-custody--dual-hashing)
10. [AI Separation Principle](#10-ai-separation-principle)
11. [Setup & Installation](#11-setup--installation)
12. [Running the Offline Demo](#12-running-the-offline-demo)
13. [Running Automated Tests & Validation](#13-running-automated-tests--validation)
14. [Git Collaboration & Workflow Rules](#14-git-collaboration--workflow-rules)
15. [15-Day Development Plan](#15-day-development-plan)
16. [Security & Legal Boundaries](#16-security--legal-boundaries)
17. [Known Limitations](#17-known-limitations)

---

## 1. Problem Statement & Background
Surveillance video evidence is critical in criminal investigations, counter-terrorism, and corporate forensics. However, DVR/NVR manufacturers (Dahua, Hikvision, CP Plus, Honeywell, TP-Link, Godrej, Uniview, Matrix) employ **proprietary filesystems** (e.g., DHFS, Hikvision HIK, proprietary FAT extensions), custom container structures, and non-standard index tables.

### The Forensic Dilemma:
* Standard operating systems and generic forensic tools (FTK, EnCase) frequently fail to mount raw DVR disks, identifying them as "unallocated" or "corrupted".
* Investigators rely on vendor-proprietary players which risk evidence tampering, lack source attribution, and cannot recover deleted footage from raw blocks.
* Multi-camera footage suffers from asynchronous timestamps, obscuring incident reconstruction.
* No standardized chain of custody or evidence lineage connects an extracted video frame back to the physical disk byte offset.

### Our Solution:
A standardized, vendor-neutral forensic investigation platform that ingests raw disk images, isolates original evidence, calculates deterministic dual hashes (**MD5 + SHA-256**), auto-detects OEM container signatures, parses index structures, carves deleted video with explainable confidence scoring, normalizes timestamps across cameras, and visualizes complete cryptographic evidence lineage.

---

## 2. Solution Architecture

```
DVR / NVR Raw Disk / Image
           │
           ▼
[ Evidence Intake & Hashing ] ───► Dual Hashing (MD5 + SHA-256) (Read-Only Isolation)
           │
           ▼
[ Forensic Image & Working Copy ] ───► Hash-Chained Chain of Custody Log
           │
           ▼
[ Multi-Signal Vendor Detection ] ───► Magic Bytes + Superblock + Index Signatures
           │
           ▼
[ Modular Parser Plugin Engine ] ───► DHFS / Hikvision / Generic Adapters
           ├──► Active Recordings & Metadata Extraction
           └──► Deleted Video Carving Engine (NAL Unit / GOP Analysis)
           │
           ▼
[ Timestamp Normalization Engine ] ──► Raw vs UTC Offset vs Drift Compensation
           │
           ▼
[ Cross-Camera Narrative Engine ] ───► Unified Multi-Camera Chronological Event Log
           │
           ▼
[ AI Analytical Assistant Layer ] ───► Motion / Object Tagging (Isolated Findings)
           │
           ▼
[ Evidence Lineage Graph & Replay ] ─► Traceable Byte-to-Court Attribution
           │
           ▼
[ Standardized Court-Ready Report ] ─► PDF Bundle with Cryptographic Verification
```

---

## 3. Five Winning Differentiators

| # | Differentiator | Forensic Significance |
|---|---|---|
| **1** | **Universal Forensic Evidence Fingerprint** | Every clip receives a persistent forensic identity: `evidence_id`, `artifact_id`, byte offset range `[start, end]`, raw & normalized timestamps, confidence score, and stream hashes. |
| **2** | **Evidence Lineage Graph** | Visual DAG tracing every transformation: `Original HDD` $\to$ `Forensic Image` $\to$ `Parsed Index` $\to$ `Carved Artifact` $\to$ `Working Copy` $\to$ `AI Finding` $\to$ `Court Report`. |
| **3** | **Recovery Confidence & Explanation Engine** | No blind claims. Evaluates container headers, NAL unit sequence, and duration integrity to classify recovery as `CONFIRMED`, `PROBABLE`, `PARTIAL`, or `FAILED` with human-readable rationale. |
| **4** | **Cross-Camera Incident Reconstruction** | Normalizes disparate camera clocks with documented drift compensation into a unified incident narrative (`CAM-01 Gate` $\to$ `CAM-02 Hall` $\to$ `CAM-04 Lot`). |
| **5** | **Forensic Replay Mode** | Synchronized dual-pane evidence player displaying live video playback side-by-side with raw byte offsets, dual hashes, codec details, and chain-of-custody lineage. |

---

## 4. Technology Stack

* **Backend Engine**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, SQLite (local default) / PostgreSQL ready, pytest.
* **Forensics & Carving**: Python `hashlib`, `struct`, `mmap`, `binascii`, OpenCV (`cv2`), FFmpeg.
* **Frontend**: React 18, TypeScript, Vite, **Plain CSS & CSS Modules** (*Strictly NO Tailwind*).
* **Reporting**: ReportLab / PDF export with cryptographic hash stamping.
* **DevOps & Packaging**: Docker, Docker Compose, Git.

---

## 5. Repository Structure

```
sih-26150-dvr-forensics/
├── README.md                           # Master Project Documentation
├── LICENSE                             # MIT License
├── .gitignore                          # Git Exclusions
├── .env.example                        # Configuration Blueprint
├── docker-compose.yml                  # Container Orchestration
├── Makefile                            # Automated Developer Workflow
│
├── docs/                               # Forensic & Engineering Documentation
│   ├── REQUIREMENTS.md                 # Traceability Matrix (P0-P3)
│   ├── ARCHITECTURE.md                 # System Architecture & Diagrams
│   ├── FORENSIC_WORKFLOW.md            # ISO/IEC 27037 Compliant SOP
│   ├── TEAM_WORKFLOW.md                # Git & 3-Member Collaboration Rules
│   ├── TASK_BOARD.md                   # 15-Day Milestone Tracking Board
│   ├── VALIDATION_PLAN.md              # Ground Truth Validation Benchmarks
│   ├── DEMO_PLAN.md                    # 3-Minute Scripted Presentation Flow
│   ├── SECURITY_AND_LEGAL_BOUNDARIES.md# Legal Compliance & No-Exploit Rules
│   ├── KNOWN_LIMITATIONS.md            # Transparent Technical Limitations
│   ├── API_SPECIFICATION.md            # OpenAPI REST Endpoints Spec
│   ├── DATABASE_SCHEMA.md              # Relational ER Schema & Tables
│   ├── PARSER_PLUGIN_SPECIFICATION.md  # BaseDVRParser Interface Contract
│   ├── RECOVERY_SPECIFICATION.md       # Carving & Explanation Algorithm
│   ├── CHAIN_OF_CUSTODY_SPECIFICATION.md# Hash-Chaining Cryptographic Spec
│   └── CHANGELOG.md                    # Version Release Log
│
├── backend/                            # FastAPI Application
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py                     # App Entrypoint & Lifespan
│       ├── config.py                   # Pydantic Settings
│       ├── api/                        # REST Routes (v1)
│       ├── models/                     # SQLAlchemy Models
│       ├── schemas/                    # Pydantic Contracts
│       ├── forensic/                   # Forensic Core Services
│       │   ├── acquisition/            # Working Copy Isolation
│       │   ├── hashing/                # Deterministic MD5 + SHA-256
│       │   ├── vendor_detection/       # Multi-Signal OEM Detector
│       │   ├── timestamps/             # Normalization Engine
│       │   ├── custody/                # Hash-Chained Audit Ledger
│       │   └── lineage/                # Lineage DAG Generator
│       ├── parsers/                    # Modular Vendor Plugins
│       │   ├── base.py                 # Abstract Parser Interface
│       │   ├── registry.py             # Plugin Discovery Engine
│       │   └── profiles/               # Dahua (DHFS), Hikvision, Generic
│       ├── recovery/                   # Deleted Carving & Validator
│       ├── ai/                         # Isolated Motion Analytics
│       └── reports/                    # Standardized PDF Generator
│
├── frontend/                           # React + TypeScript Web Dashboard
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx                     # Main Application Shell
│       ├── index.css                   # Global Dark Forensic Theme
│       ├── components/                 # Reusable UI Widgets (Plain CSS)
│       ├── pages/                      # Investigation Workspaces
│       └── services/                   # API Client Services
│
├── forensic_fixtures/                  # Controlled Synthetic Test Fixtures
│   ├── README.md
│   └── sample_images/                  # Synthetic Raw Disks (DHFS)
│
├── scripts/                            # Operational & Seeding Scripts
│   ├── create_demo_case.py             # Offline DEMO-CASE-001 Generator
│   ├── generate_synthetic_fixtures.py  # Synthetic DVR Disk Builder
│   ├── run_validation.py               # Ground Truth Benchmark Runner
│   └── setup_dev.py                    # Environment Initializer
│
└── tests/                              # Pytest Automated Test Suite
    ├── conftest.py
    ├── unit/                           # Hashing, Custody, Detector, Parsers
    ├── integration/                    # End-to-End API Pipeline
    └── forensic/                       # Carving & Lineage Integrity Tests
```

---

## 6. 3-Member Team Ownership

To ensure zero merge conflicts during the 15-day development sprint, ownership is strictly partitioned:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ MEMBER 1 (feature/member1-forensics-core)                                   │
│ ├── Evidence Acquisition & Working Copy Isolation                           │
│ ├── Deterministic Dual Hashing (MD5 + SHA-256)                              │
│ ├── Cryptographic Chain of Custody & Event Ledger                           │
│ ├── Multi-Signal Vendor/OEM Detection Engine                                │
│ └── Parser Core Interfaces & Plugin Registry                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ MEMBER 2 (feature/member2-recovery-timeline)                                │
│ ├── Vendor Parsers (DHFS / Hikvision / Generic Adapters)                    │
│ ├── Deleted Video Carving Engine (NAL Unit / GOP Analysis)                  │
│ ├── Recovery Confidence & Explanation Logic                                 │
│ ├── Timestamp Normalization Engine                                          │
│ └── Cross-Camera Incident Reconstruction                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ MEMBER 3 (feature/member3-platform-ui)                                      │
│ ├── FastAPI Backend & Relational Database Integration                       │
│ ├── React/TypeScript Forensic Dashboard (Plain CSS / No Tailwind)           │
│ ├── Video Viewer & Forensic Replay Mode                                     │
│ ├── Evidence Lineage Graph Visualization                                    │
│ ├── AI Motion Separation & Standardized PDF Report Generation               │
│ └── Offline Fixtures & Automated Demo Orchestration                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Supported OEM Profiles & Honest Matrix

We uphold strict forensic honesty: **Never claim a format is parsed unless backed by automated ground truth tests.**

| OEM | Detection | Parser Status | Deleted Recovery | Metadata | Status | Evidence/Fixture |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Dahua Technology** | Magic + Superblock | Active Index + DHFS4 | Carving + Index Walk | Stream / NAL | **VALIDATED** | `dahua_dhfs_sample_01.raw` |
| **CP Plus** | OEM Marker / DHFS | Compatible Profile | Carving | Stream / NAL | **VALIDATED** | `dahua_dhfs_sample_01.raw` |
| **HIKVISION** | HIK Header | Profile Defined | Header Carving | Frame Header | **PROFILE READY** | Spec defined; pending full image |
| **Honeywell Security**| Container Signature| Adapter Interface | Planned | Stream | **PLANNED** | Adapter stub in registry |
| **TP-Link** | Signature Scan | Adapter Interface | Planned | Stream | **PLANNED** | Adapter stub in registry |
| **Godrej** | Signature Scan | Adapter Interface | Planned | Stream | **PLANNED** | Adapter stub in registry |
| **Uniview** | Signature Scan | Adapter Interface | Planned | Stream | **PLANNED** | Adapter stub in registry |
| **Matrix** | Signature Scan | Adapter Interface | Planned | Stream | **PLANNED** | Adapter stub in registry |

---

## 8. Forensic Workflow & SOP
1. **Intake**: Evidence registered with unique Case ID (`CASE-XXX`) and Evidence ID (`EV-XXX`).
2. **Read-Only Preservation**: Original disk image is write-protected (`FORCE_READ_ONLY_ORIGINAL=true`).
3. **Dual Hashing**: Compute deterministic MD5 and SHA-256 hashes of the source.
4. **Forensic Working Copy**: Generate bit-stream verified working image for all downstream operations.
5. **Vendor Detection**: Evaluate magic bytes, filesystem superblocks, and index markers without relying on filenames.
6. **Parsing & Indexing**: Parse allocated video channels, extract start/end timestamps and byte offsets.
7. **Deleted Footage Recovery**: Carve unallocated clusters for H.264/H.265 NAL unit signatures (`0x0000000167` / SPS/PPS / IDR).
8. **Explainable Confidence**: Output confidence metrics (`CONFIRMED`, `PROBABLE`, `PARTIAL`) with explicit structural justification.
9. **Timestamp Normalization**: Preserve raw hardware clocks alongside timezone-adjusted UTC timestamps.
10. **Cross-Camera Narrative**: Correlate events across cameras into a chronological sequence.
11. **Isolated AI Analysis**: Perform background subtraction / motion analysis on working copies only.
12. **Lineage & Report**: Generate complete cryptographic lineage graph and court-admissible PDF bundle.

---

## 9. Chain of Custody & Dual Hashing

Every forensic event is recorded in an **append-only cryptographically linked audit log**:

$$\text{EventHash}_n = \text{SHA256}(\text{CaseID} \parallel \text{EvidenceID} \parallel \text{Action} \parallel \text{Timestamp} \parallel \text{Actor} \parallel \text{PrevHash}_{n-1})$$

The platform continuously validates log integrity:
* `CHAIN VALID`: Cryptographic links intact from origin to latest action.
* `CHAIN INVALID`: Discrepancy detected; potential evidence tampering flagged.

---

## 10. AI Separation Principle
* AI analytics (motion detection, bounding boxes) are **strictly isolated** from primary evidence files.
* Findings are stored in an auxiliary `ai_findings` table referencing the source `artifact_id`.
* The platform never alters, trims, or re-encodes original footage based on AI inferences.

---

## 11. Setup & Installation

### Prerequisites
* Python 3.11 or higher
* Node.js 18+ and npm
* Git

### Local Quickstart
```bash
# 1. Clone repository
git clone https://github.com/your-org/sih-26150-dvr-forensics.git
cd sih-26150-dvr-forensics

# 2. Setup Python environment & backend dependencies
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate
pip install -r backend/requirements.txt

# 3. Setup Frontend dependencies
cd frontend
npm install
cd ..

# 4. Initialize synthetic forensic fixtures & demo case
python scripts/generate_synthetic_fixtures.py
python scripts/create_demo_case.py

# 5. Run Backend
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

# 6. Run Frontend (in separate terminal)
cd frontend
npm run dev
```

---

## 12. Running the Offline Demo
The platform is designed to run **100% offline** without any cloud dependencies:
```bash
python scripts/create_demo_case.py
```
This command automatically:
1. Generates a valid synthetic Dahua raw disk image (`forensic_fixtures/sample_images/dahua_dhfs_sample_01.raw`).
2. Creates `DEMO-CASE-001` with evidence item `EV-001`.
3. Verifies source hashes, detects OEM as Dahua DHFS4 (100% confidence), extracts 4 allocated recordings, carves 1 deleted recording with `CONFIRMED` confidence, builds the cross-camera timeline, and generates an Evidence Lineage Graph.

Visit `http://localhost:5173` to explore the interactive demo.

---

## 13. Running Automated Tests & Validation
```bash
# Run pytest suite
pytest tests/ -v

# Run Ground Truth Forensic Validation Engine
python scripts/run_validation.py
```

---

## 14. Git Collaboration & Workflow Rules
* `main`: Protected production-ready branch.
* `develop`: Integration staging branch.
* Feature branches:
  * `feature/member1-forensics-core`
  * `feature/member2-recovery-timeline`
  * `feature/member3-platform-ui`
* Conventional commits required (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).

See [TEAM_WORKFLOW.md](docs/TEAM_WORKFLOW.md) for comprehensive team rules.

---

## 15. 15-Day Development Plan
See [TASK_BOARD.md](docs/TASK_BOARD.md) for granular sprint tracking from Day 1 to Day 15 freeze.

---

## 16. Security & Legal Boundaries
* This platform is strictly designed for **lawful forensic examination** of lawfully seized media.
* **No Live Device Exploitation**: The software does not attempt password bypass, network infiltration, or firmware modification.
* See [SECURITY_AND_LEGAL_BOUNDARIES.md](docs/SECURITY_AND_LEGAL_BOUNDARIES.md) for full compliance text.

---

## 17. Known Limitations
See [KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md) for transparent engineering boundaries regarding physical disk defects, proprietary hardware encryption, and unsupported legacy codecs.
