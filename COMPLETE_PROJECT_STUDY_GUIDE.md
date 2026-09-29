# Complete Project Study Guide & Prototype Manual
**Project Title**: Multi-Vendor DVR/NVR Forensic Analysis Tool (SIH 2026 — Problem Statement 26150)

> **Read this document from top to bottom.** It is written assuming **zero prior knowledge** of digital forensics or CCTV internals. By the time you finish reading this guide, you will understand every single word, number, button, hash, and graph on the screen, why it exists, and how to explain it like a domain expert.

---

## PART 1: What Is This Project About? (Explained in Plain English)

### 1.1 What is a DVR / NVR?
Every bank, warehouse, traffic junction, and apartment uses CCTV surveillance cameras. Those cameras record video onto a dedicated black box containing a hard disk drive called a **DVR (Digital Video Recorder)** or **NVR (Network Video Recorder)**—made by companies like **Dahua, Hikvision, CP Plus, Uniview, Bosch, Axis, Hanwha, and Honeywell**.

### 1.2 What is the Real-World Problem? (Why Police Struggle Today)
When a serious crime occurs (a warehouse robbery, bank heist, or insider sabotage), the perpetrator often walks into the security room and **deletes the specific camera recording** showing their face, or **formats the DVR hard drive**.

When Cyber Crime / Forensic Police seize that CCTV hard drive and plug it into a computer to recover the deleted video, **four major roadblocks happen**:

1. **Problem #1: Windows & Standard Forensic Tools Cannot Read CCTV Hard Drives**
   - Normal computers use **NTFS** (Windows) or **EXT4** (Linux) filesystems.
   - CCTV DVRs **do NOT use NTFS or FAT32**. Because a DVR has to record 4 to 64 cameras 24/7 without stopping, manufacturers invented secret, proprietary **Ring-Buffer Filesystems** (for example, Dahua uses **`DHFS4.1`** and Hikvision uses **`HIK`**).
   - When you connect a Dahua or Hikvision hard drive to a Windows PC, Windows says *"Disk Unformatted — Do you want to format it?"*. Standard recovery tools (like Recuva, Autopsy, or TestDisk) fail completely because they look for `.mp4` files, whereas DVRs store raw video streams directly inside custom 1-GB binary blocks.

2. **Problem #2: Deleted CCTV Video Fragments Are "Headless" (Corrupted & Unplayable)**
   - Even if an expert scans the raw hard drive bytes (hexadecimal sectors) and finds the deleted video data in unallocated space, the DVR has usually overwritten the **Video Header** (called **SPS `0x67` and PPS `0x68`** in H.264 video).
   - Without that tiny header at the start of the stream, VLC Media Player or FFmpeg refuses to play the video—it says *"Corrupted Bitstream"*.

3. **Problem #3: DVR Clocks Are Always Wrong (Multi-Camera Clock Drift)**
   - DVRs are rarely connected to the internet for security reasons, and their internal coin-battery (`CMOS`) degrades.
   - As a result, the DVR hardware clock might show `09:01:04`, while the real-world **UTC time** was `03:31:04` (a drift of hours or minutes). If a suspect runs from Camera 1 to Camera 2 to Camera 3, investigators cannot align the timeline unless the clock drift is mathematically corrected.

4. **Problem #4: Strict Court Rejection Under Indian Law (Section 65B IEA / Section 63 BSA)**
   - Under **Section 65B of the Indian Evidence Act (now Section 63 of the Bharatiya Sakshya Adhiniyam 2023)** and international forensic standard **ISO/IEC 27037:2012**, digital CCTV evidence is **thrown out of court** if:
     - The investigator opened or modified the original hard drive without a **Write-Blocker**.
     - The **MD5 / SHA-256 cryptographic hash** changed by even 1 bit.
     - An **AI Object Detection tool** drew bounding boxes directly onto the original video frames (because modifying pixels alters the file hash = evidence tampering!).

---

### 1.3 What Did We Build in Our Prototype to Solve All 4 Problems?
We built an end-to-end **Court-Admissible Multi-Vendor DVR/NVR Forensic Platform** that:
1. **Protects the Original Evidence (`Write-Block + Working Copy`)**: Never touches the original seized disk image. It creates an exact bit-for-bit working copy and verifies `100.0%` match using **Dual Hashing (MD5 + SHA-256)**.
2. **Automatically Detects the CCTV Brand (`Vendor Fingerprinting`)**: Scans raw disk sector 0 (`0x0000`) for magic bytes (e.g., `DHFS` for Dahua, `HIKVISION@HANGZHOU` for Hikvision) and partition tables (`MBR / GPT` / `E01`).
3. **Carves & Repairs Deleted Video (`Unallocated Cluster Carving + GOP Header Injection`)**: Scans raw unallocated disk sectors to find deleted H.264/H.265 video streams, **AND automatically synthesizes and injects missing `SPS (0x67)` and `PPS (0x68)` headers** so the deleted video can be played immediately!
4. **Synchronizes Drifted Clocks (`Sub-Second UTC Normalization`)**: Corrects the DVR hardware clock skew down to `±0.04s` accuracy and builds a single chronological crime timeline across all cameras.
5. **Isolates AI Detection from the Evidence (`Non-Destructive AI Advisory Layer`)**: Runs AI person/vehicle motion detection on a **separate transparent UI canvas overlay** so the original video bytes and SHA-256 hash remain **100% untouched**.
6. **Proves Admissibility (`DAG Lineage + Blockchain Custody + Section 65B PDF`)**: Tracks every action in a hash-linked Chain of Custody and generates a 1-click **Court PDF Report with a Section 65B / 63 BSA Legal Certificate**.

---

## PART 2: The Pre-Loaded Story Inside Our Prototype (`DEMO-CASE-001`)

When you open `http://localhost:5173`, the prototype is pre-loaded with a complete crime investigation so you can demonstrate every feature live:

* **Case ID**: `DEMO-CASE-001`
* **Case Title**: *Operation IronGate – Surveillance Forensics*
* **Lead Examiner**: *Insp. Rajesh Kumar (State Police Forensic Science Laboratory / Cyber Cell)*
* **Seized Evidence**: `EV-001` — A raw **64 MB Dahua (`DHFS4`) DVR Disk Image** (`dahua_dhfs_sample_01.raw`).
* **The Crime Story**:
  - A security incident took place at a facility with **5 CCTV Cameras**:
    1. **`CAM-01` (`Gate Entrance`)** — Intact (`ALLOCATED` on disk)
    2. **`CAM-02` (`Corridor Hallway`)** — Intact (`ALLOCATED` on disk)
    3. **`CAM-03` (`Loading Bay`)** — **DELETED BY THE SUSPECT!** (Removed from the DVR index table and left in `UNALLOCATED` disk space at physical byte offset `0x1C0000` / byte `1,835,008`).
    4. **`CAM-04` (`Parking Lot East`)** — Intact (`ALLOCATED` on disk)
    5. **`CAM-05` (`Perimeter Exit`)** — Intact (`ALLOCATED` on disk)
  - **What Our Prototype Shows**: Our tool ingested `EV-001`, extracted the 4 intact cameras (`CAM-01, 02, 04, 05`), **AND hunted down, carved, and repaired the deleted `CAM-03 (Loading Bay)` video**, reconstructing the suspect's full path from Gate Entrance (`CAM-01`) → Corridor (`CAM-02`) → Loading Bay (`CAM-03 Carved`) → Parking Lot (`CAM-04`) → Perimeter Exit (`CAM-05`).

---

## PART 3: Glossary of Every Term & Badge You See on Screen

| Term / Badge on Screen | What It Means in Simple Words |
| :--- | :--- |
| **`WRITE-BLOCK SECURE`** | A hardware/software lock ensuring our tool can **only READ** the seized hard drive and can **never WRITE or alter** a single byte on it. |
| **`ISO/IEC 27037:2012`** | The global international standard for how police must collect, preserve, and handle digital evidence. |
| **`SEC 65B / 63 BSA`** | The Indian law (Section 65B of Indian Evidence Act / Section 63 of Bharatiya Sakshya Adhiniyam 2023) required for any CCTV or electronic record to be accepted by an Indian Judge. |
| **`SHA-256` & `MD5`** | Digital "fingerprints" of a file. If even 1 pixel or 1 letter in a 64 MB file changes, the 64-character SHA-256 code changes completely. Having `100.0% Parity` proves the copy is identical to the original seized disk. |
| **`ALLOCATED`** | Normal, active video files that are still listed in the DVR's directory table (`CAM-01, 02, 04, 05`). |
| **`CARVED / UNALLOCATED`** | Deleted video data (`CAM-03`) that was erased from the DVR's directory table, which our tool rescued directly from raw "empty" sectors (`Offset 0x1C0000`) of the hard drive. |
| **`H.264 SPS (0x67) / PPS (0x68)`** | The secret "decoder ring" header bytes at the start of a CCTV video stream that tell a player the resolution (`1920x1080`) and frame rate (`25 FPS`). Our `Repair Stream` button re-attaches these to deleted clips. |
| **`DAG (Directed Acyclic Graph)`** | A one-way flowchart (`#1` → `#2` → `#3` → `#4` → `#5`) showing the exact life history of the evidence from physical hard drive to final PDF report. |

---

## PART 4: Complete Section-by-Section & Button-by-Button Breakdown

### A. The Top Header Bar (Visible on Every Page)
1. **`ACTIVE FILE: DEMO-CASE-001`**: Shows which police case is currently loaded in memory.
2. **`WRITE-BLOCK SECURE` (Green Badge)**: Confirms the original disk image is locked in Read-Only mode (`0%` chance of accidental overwriting).
3. **`ISO/IEC 27037:2012` & `SEC 65B / 63 BSA` Badges**: Legal compliance indicators confirming the workspace is recording audit logs required for court.
4. **`Insp. Rajesh Kumar (Lead Cyber Examiner)`**: The logged-in forensic officer whose name and ID are stamped onto every Chain of Custody event and PDF certificate.

---

### B. Tab 1: `Dashboard` (Executive Triage & Case Overview)
**Purpose**: Gives the Investigating Officer and the Court a single-screen summary of the entire seized hard drive, what cameras were found, whether any deleted footage was recovered, and the chronological timeline of the crime.

1. **Top Alert Banner (`ISO/IEC 27037 & Section 65B Forensics Compliance Active`)**:
   - **Button `Export Court PDF` / `Generate Court Report`**: Compiles all database records into a multi-page PDF report using `ReportLab`, signs it with a SHA-256 digest, and **automatically opens the PDF in a new browser tab**.
2. **The 4-Column Executive Metric Strip**:
   - **Column 1 (`ACTIVE CASE FILE: DEMO-CASE-001`)**: Shows the case is an `OPEN DOCKET` in the Cyber Forensic Cell.
   - **Column 2 (`EVIDENCE HASHING PARITY: 100.0%`)**: Proves that the Original Disk MD5/SHA-256 and the Working Copy MD5/SHA-256 match `100.0%` (`Zero Drift`).
   - **Column 3 (`CARVED DELETED FOOTAGE: 1 Recovered`)**: Highlights in gold (`CONFIRMED`) that our tool discovered **1 deleted video stream** (`CAM-03 Loading Bay`) hiding in unallocated space!
   - **Column 4 (`CRYPTOGRAPHIC CUSTODY: CHAIN VALID`)**: Confirms the audit log is `UNBROKEN`.
3. **Surveillance Stream Directory (Carousel)**:
   - Displays cards for each camera stream found on the hard drive (`CAM-01 Gate Entrance`, `CAM-02 Corridor Hallway`, `CAM-04 Parking Lot East`, `CAM-05 Perimeter Exit`).
   - **Buttons `< Prev` and `Next >`**: Scrolls the carousel horizontally to reveal the 5th card: **`[CARVED] CAM-03 Loading Bay`** with a gold **`CARVED UNALLOCATED`** badge.
4. **Multi-Camera Incident Flow & Carved Stream Timeline (Line Chart)**:
   - Visualizes the sector read velocity (`1,240.5 MB/min`, `0 Frame Dropped`) across the 5 cameras (`CAM-01` to `CAM-05`), with **`CAM-03 (14:31:12)`** highlighted in **Gold (`Carved Footage`)**.
5. **Seized Physical Evidence Containers (Table)**:
   - Shows physical disk image `EV-001`, Detected Vendor (`Dahua Technology / Profile: DHFS4`), Format (`RAW/DD BITSTREAM, Sector Size: 512B`), File Size, and dual **`SHA-256` and `MD5` copyable boxes**.
6. **Cross-Camera Synchronized Narrative Timeline (Bottom List)**:
   - Lists the 5 reconstructed crime events in exact chronological order (`#1` to `#5`), showing both the corrected UTC time and the `±0.04s` clock-drift adjustment.

---

### C. Tab 2: `Case Management` (Forensic Case Registry)
**Purpose**: Manages the official case docket registry and allows officers to register new cases or switch between active cases.
- **Button `+ Register New Case` (Top Right)**: Opens a popup modal where you can enter a new Case Title, Agency, Examiner, and Description, and save it to SQLite.
- **Button `Set Active ->`**: Switches the active case in the top header.

---

### D. Tab 3: `Forensic Replay` (Synchronized Player & Bitstream Inspector)
**Purpose**: Plays active and carved CCTV streams alongside their physical hard-drive sector offsets, UTC clock-drift correction, and a non-destructive AI bounding-box overlay.

1. **Left Pane — The Dark Surveillance Video Player**:
   - Compares **`DEVICE: 2026-09-11 09:01:04`** (wrong DVR clock) against **`UTC: 2026-09-11T03:31:04 UTC`** (true corrected time).
   - **`-1s` / `Play` / `+1s` / `0.5x..4x`**: Plays/pauses and scrubs frame-by-frame.
   - **Gold Button `AI Overlay (ON)` / `AI Overlay (OFF)`**: Toggles the `PERSON (0.94)` and `VEHICLE (0.89)` boxes ON and OFF while keeping the `SHA-256` hash on the right 100% identical!
2. **Right Pane — `Forensic Metadata Inspector`**:
   - Displays `Artifact ID`, `Raw Hardware Clock` vs `Normalized UTC Time`, `Stream Status`, `Physical Sector Offset`, `Video Codec`, and `SHA-256` / `MD5` hashes.
3. **Bottom Channel Bar (`SELECT STREAM CHANNEL - 5 AVAILABLE`)**:
   - Click **`CAM-03 CARVED Loading Bay (Carved)`** to load and inspect the deleted camera footage!

---

### E. Tab 4: `Recovery Workspace` (Deleted Video Carving & GOP Stream Repair)
**Purpose**: Scans unallocated sectors of the hard drive for raw H.264 video signatures (`0x0000000167`) and repairs broken video headers.
- **Gold Button `Trigger Deep Cluster Carve`**: Scans the disk image and recovers **`ART-CARVED-01`** at **`Offset 0x1C0000 (524,288 B)`** with **`98% Structural Confidence`**.
- **Button `Repair Stream`**: Synthesizes missing H.264 `SPS (0x67)` and `PPS (0x68)` GOP headers and displays a green **`✓ Repaired: Injected H.264 SPS (0x67)...`** badge.

---

### F. Tab 5: `Evidence Lineage DAG` (Mathematical Provenance Graph)
**Purpose**: Proves that the carved clip came directly from the seized hard drive via a 5-node Directed Acyclic Graph (`#1 Physical DVR Platter` → `#2 Bit-Stream Raw Disk Image` → `#3 Dahua DHFS4 Storage Index` → `#4 Carved Clip: Loading Bay (CAM-03)` → `#5 Court-Ready Forensic PDF Report`).
- **Click any node card** to view its SHA-256 linkage in the bottom inspector.
- **Buttons `Export Mermaid DAG` & `Export JSON DAG`**: Exports the provenance graph.

---

### G. Tab 6: `Chain of Custody` (Blockchain-Style Audit Ledger)
**Purpose**: Append-only ledger (`#000` to `#006`) where every event's `PREV` hash matches the exact `HASH` of the previous row.
- **Button `Verify Hash Links`**: Re-computes all SHA-256 links from Genesis (`#000`) to confirm zero tampering (`CHAIN VALID`).

---

### H. Tab 7: `OEM Coverage Matrix` (8 Surveillance Brands Capability Tracker)
**Purpose**: Transparently tracks all 8 CCTV manufacturers from Problem Statement 26150 (`Dahua`, `Hikvision`, `CP Plus`, `Uniview`, `Hanwha`, `Bosch`, `Axis`, `Honeywell`) across `VALIDATED`, `PROFILE READY`, and `PLANNED` support tiers.
