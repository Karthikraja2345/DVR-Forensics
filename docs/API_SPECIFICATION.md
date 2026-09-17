# REST API Specification (OpenAPI / FastAPI)
## SIH 2026 – Problem Statement 26150
### Multi-Vendor DVR/NVR Forensic Analysis Tool

---

## 1. Overview
The platform backend exposes a standardized RESTful API via FastAPI. All requests and responses utilize JSON encoding with strict Pydantic v2 validation contracts.

Base URL: `http://localhost:8000/api/v1`

---

## 2. API Endpoint Matrix

### 2.1 Case Management
| Method | Route | Description | Response Model |
|---|---|---|---|
| `POST` | `/cases` | Register a new forensic investigation case. | `CaseResponse` |
| `GET` | `/cases` | List all registered cases with evidence counts. | `List[CaseResponse]` |
| `GET` | `/cases/{case_id}` | Retrieve detailed case metadata and status. | `CaseDetailResponse` |
| `PATCH`| `/cases/{case_id}/close` | Seal and close case against further modifications. | `CaseResponse` |

### 2.2 Evidence Intake & Hashing
| Method | Route | Description | Response Model |
|---|---|---|---|
| `POST` | `/cases/{case_id}/evidence` | Register raw disk image / file evidence. | `EvidenceResponse` |
| `GET` | `/cases/{case_id}/evidence` | List all evidence items associated with a case. | `List[EvidenceResponse]` |
| `POST` | `/evidence/{evidence_id}/hash` | Calculate deterministic MD5 + SHA-256 hashes. | `HashResponse` |
| `POST` | `/evidence/{evidence_id}/verify` | Verify current file hash against stored baseline. | `VerificationResponse` |

### 2.3 Vendor Detection & Parsing
| Method | Route | Description | Response Model |
|---|---|---|---|
| `POST` | `/evidence/{evidence_id}/detect-vendor` | Scan magic bytes and superblocks for OEM identification. | `VendorDetectionResponse` |
| `POST` | `/evidence/{evidence_id}/parse` | Execute vendor-specific parser plugin. | `ParseResultResponse` |
| `GET` | `/evidence/{evidence_id}/recordings` | List extracted active recordings with channel metadata. | `List[RecordingResponse]` |
| `GET` | `/evidence/{evidence_id}/metadata` | Retrieve detailed container and codec metadata. | `MetadataResponse` |

### 2.4 Deleted Footage Recovery
| Method | Route | Description | Response Model |
|---|---|---|---|
| `POST` | `/evidence/{evidence_id}/recover` | Carve unallocated clusters for deleted video streams. | `RecoveryJobResponse` |
| `GET` | `/evidence/{evidence_id}/recovery` | List recovered video artifacts and confidence scores. | `List[RecoveredArtifactResponse]` |

### 2.5 Timeline, Lineage & Custody
| Method | Route | Description | Response Model |
|---|---|---|---|
| `GET` | `/cases/{case_id}/timeline` | Retrieve cross-camera chronological incident timeline. | `TimelineResponse` |
| `GET` | `/cases/{case_id}/lineage` | Retrieve complete Evidence Lineage Graph (DAG). | `LineageGraphResponse` |
| `GET` | `/cases/{case_id}/custody` | Retrieve append-only Chain of Custody audit ledger. | `CustodyLedgerResponse` |
| `POST` | `/cases/{case_id}/custody/verify` | Verify cryptographic hash chaining of custody events. | `CustodyVerifyResponse` |

### 2.6 AI Analytics, Reports & Validation
| Method | Route | Description | Response Model |
|---|---|---|---|
| `POST` | `/evidence/{evidence_id}/ai-analyze` | Run isolated motion/object detection on working copy. | `AIAnalysisResponse` |
| `POST` | `/cases/{case_id}/report` | Generate court-ready cryptographic PDF report. | `ReportResponse` |
| `GET` | `/validation/matrix` | Retrieve live OEM coverage and validation matrix. | `OEMMatrixResponse` |
| `POST` | `/validation/run` | Execute automated ground truth validation benchmark. | `ValidationRunResponse` |
| `GET` | `/health` | System health check and service status. | `HealthResponse` |
