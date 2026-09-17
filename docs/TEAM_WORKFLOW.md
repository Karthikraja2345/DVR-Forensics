# Team Git Collaboration & Development Workflow
## SIH 2026 – Problem Statement 26150
### 3-Member Engineering Architecture

---

## 1. Team Composition & Role Ownership

The team consists of exactly 3 core engineers with clearly separated module ownership to maximize velocity and eliminate merge conflicts.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ MEMBER 1: Lead Forensics Core & Integrity Engineer                          │
│ Branch: feature/member1-forensics-core                                      │
│ Responsibilities:                                                           │
│  - Evidence Acquisition & Read-Only Working Copy Isolation                  │
│  - Deterministic Dual Hashing (MD5 + SHA-256)                               │
│  - Cryptographic Chain of Custody & Tamper-Detection Engine                 │
│  - Multi-Signal Vendor & Superblock Detection Engine                        │
│  - Parser Plugin Core Architecture & Interface Contracts                    │
│ Key Folders: backend/app/forensic/hashing, custody, acquisition, parsers/base│
├─────────────────────────────────────────────────────────────────────────────┤
│ MEMBER 2: Lead Parsing, Recovery & Timeline Engineer                        │
│ Branch: feature/member2-recovery-timeline                                   │
│ Responsibilities:                                                           │
│  - Vendor Parsers (DHFS/Dahua, Hikvision Profile, Generic)                  │
│  - Deleted Video Carving Engine (H.264/H.265 NAL Unit Assembly)             │
│  - Recovery Confidence & Structural Explanation Engine                      │
│  - Timestamp Normalization & Hardware Drift Compensator                     │
│  - Cross-Camera Incident Narrative Engine                                   │
│ Key Folders: backend/app/parsers/profiles, recovery, forensic/timestamps    │
├─────────────────────────────────────────────────────────────────────────────┤
│ MEMBER 3: Lead Platform, Full-Stack & Integration Engineer                  │
│ Branch: feature/member3-platform-ui                                         │
│ Responsibilities:                                                           │
│  - FastAPI REST Application & SQLAlchemy Relational Database                │
│  - React + TypeScript Forensic Dashboard (Plain CSS / Zero Tailwind)        │
│  - Video Player & Forensic Replay Dual-Pane Synchronizer                    │
│  - Evidence Lineage DAG Visualizer                                          │
│  - Isolated AI Analytics & Standardized PDF Report Generator                │
│  - Offline Fixture Generation & Automated Demo Orchestrator                 │
│ Key Folders: backend/app/api, models, frontend/, scripts/demo, reports/     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Git Branching Model

```
   main        ───────────────────────────────────────────● [Tagged Release]
                ▲                                         ▲
                │                                         │
   develop     ─●─────────●──────────────●────────────────●
                ▲         ▲              ▲
                │ PR      │ PR           │ PR
   feature/     │         │              │
   member1      ●─────────┘              │
   member2                ●──────────────┘
   member3                               ●────────────────┘
```

* **`main`**: Protected branch. Contains strictly verified, court-ready releases. Never commit directly to `main`.
* **`develop`**: Primary integration branch. All feature branches merge here via Pull Requests once unit tests pass.
* **Feature Branches**:
  - `feature/member1-forensics-core`
  - `feature/member2-recovery-timeline`
  - `feature/member3-platform-ui`
  - `bugfix/issue-description`

---

## 3. Commit Message Standards (Conventional Commits)

All commits must follow the Conventional Commits format:
```text
<type>(<scope>): <short imperative description>

[optional body explaining rationale]
```

### Allowed Types:
* `feat`: A new forensic capability or UI feature.
* `fix`: A bug fix or forensic integrity correction.
* `refactor`: Code change that neither fixes a bug nor adds a feature.
* `test`: Adding or updating automated unit, integration, or fixture tests.
* `docs`: Documentation updates.
* `chore`: Build scripts, dependencies, or configuration updates.

### Examples:
* `feat(hashing): implement deterministic chunked MD5 and SHA-256 calculation`
* `feat(custody): add SHA-256 previous hash link verification`
* `feat(carver): support H.264 SPS/PPS prefix recovery for deleted DHFS clusters`
* `fix(timestamps): preserve raw device integer alongside normalized UTC offset`
* `test(vendor): add test fixtures for Dahua DHFS4 superblock signature`
* `docs(contracts): publish Pydantic v2 recovery schemas`

---

## 4. Conflict Prevention & Shared Contract Rules

1. **Contract-First Development**: All schemas (`schemas/*.py`) and database models (`models/*.py`) are frozen and agreed upon before parallel implementation begins.
2. **Modular File Isolation**:
   - Member 1 modifies `forensic/` and `parsers/base.py`.
   - Member 2 modifies `parsers/profiles/` and `recovery/`.
   - Member 3 modifies `api/`, `frontend/`, `reports/`, and `ai/`.
3. **No Direct Overwriting of Shared Configs**: Feature-specific settings should be passed via parameters rather than mutating global configurations.
4. **Pre-PR Hygiene**:
   ```bash
   # Before opening PR or integrating:
   git checkout develop
   git pull origin develop
   git checkout feature/your-branch
   git rebase develop
   pytest tests/
   ```

---

## 5. Pull Request (PR) Checklist

Before submitting a PR to `develop`, each team member must verify:
- [ ] Code strictly follows forensic boundaries (no live exploits, no evidence alteration).
- [ ] No hardcoded absolute file paths.
- [ ] All new functions include type hints and explanatory docstrings.
- [ ] Automated tests covering the feature are written and passing (`pytest tests/`).
- [ ] `docs/TASK_BOARD.md` has been updated with the current task status.
- [ ] Frontend code contains zero Tailwind CSS classes; uses pure CSS / CSS Modules.
- [ ] No mock or fabricated forensic results are returned.
