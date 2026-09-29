# SIH 2026 (PS-26150) DVR/NVR Forensic Analysis Tool — Prototype Demo Guide & Video Script

## Quick Start Commands (If Not Already Running)

1. **Terminal 1 (Backend - Port 8000)**:
   ```powershell
   cd C:\Users\karth\.gemini\antigravity\scratch\sih-26150-dvr-forensics\backend
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
2. **Terminal 2 (Frontend - Port 5173)**:
   ```powershell
   cd C:\Users\karth\.gemini\antigravity\scratch\sih-26150-dvr-forensics\frontend
   npm run dev
   ```
3. **Open in Browser**: `http://localhost:5173`

---

## 1. What Is Built in Our Prototype? (The Investigation Story)

The system comes pre-loaded with a realistic forensic investigation case (**`DEMO-CASE-001`: Warehouse Loading Bay CCTV Tampering Investigation**):

1. **The Incident Scenario**:
   - A suspect entered a warehouse loading bay and **deliberately formatted/deleted the recording for Camera 03 (`CAM-03` Loading Bay)** during the critical window (`18:10:00` to `18:25:00 UTC`), while leaving Cameras 01, 02, and 04 intact.
   - Furthermore, the DVR's internal CMOS clock had drifted by **`+124.5 seconds`** from real UTC time.
2. **What Our Tool Does on This Evidence**:
   - **Write-Blocked Intake**: Mounts the raw 64MB DVR disk image (`EV-2026-001.bin`) in strict read-only mode, generates a bit-stream working copy, and computes **Dual Cryptographic Hashes (MD5 + SHA-256)** proving `100.0%` bit-parity.
   - **Vendor & Filesystem Fingerprinting**: Automatically detects **Dahua Technology (`DHFS4.1`)** proprietary surveillance filesystem via magic-byte signature (`0x44484653` at offset `0x0000`) and partition geometry analysis.
   - **Active Stream Extraction + Deleted Video Carving**: Extracts the 4 active camera streams (`CAM-01`, `CAM-02`, `CAM-04`) from allocated partition tables **AND scans unallocated disk clusters** to carve out the deleted H.264 video stream (`CAM-03` at physical sector offset `0x1C0000` / byte `1,835,008`).
   - **Damaged GOP Stream Repair**: Synthesizes and injects missing **SPS (`0x67`) and PPS (`0x68`) H.264 NAL headers** into a non-destructive derivative stream so investigators can play the deleted video.
   - **Sub-Second Multi-Camera Drift Compensation**: Normalizes the `+124.5s` DVR clock skew (`±0.04s` precision) to align all 4 active feeds and the 1 recovered deleted feed onto a single synchronized chronological narrative.
   - **Court-Admissible Section 65B Report**: Generates and downloads an official **ISO/IEC 27037 & Section 65B (Indian Evidence Act / Bharatiya Sakshya Adhiniyam)** PDF report complete with cryptographic certificates.

---

## 2. Tab-by-Tab & Button-by-Button Reference

| Sidebar Tab | What This Screen Is For | Interactive Buttons / Options & What Happens When You Click |
| :--- | :--- | :--- |
| **1. Dashboard** | **Executive Triage & Case Overview.** Shows compliance banner, 4-metric ribbon, Camera Stream Carousel, Multi-Camera Incident Flow Chart, Seized Physical Evidence table, and Cross-Camera Chronological Timeline. | • **`Generate Court Report` (Top Right Button)** / **`Export Court PDF` (Banner Button)**: Generates the official Section 65B Court PDF Report and opens it in a new browser tab.<br>• **`Inspect Stream` (Inside Camera Carousel Cards)**: Selects a camera stream (Notice `CAM-03` has a gold **`CARVED UNALLOCATED`** badge).<br>• **`Copy` Icon (Next to SHA-256 / MD5 hashes)**: Copies the full 64-character digest to your clipboard. |
| **2. Cases & Evidence** | **Forensic Case Docket Registry.** Lists all registered police/cyber-cell cases, lead examiners, agencies, and custody statuses. | • **`Register New Case` (Top Right Button)**: Opens an ISO/IEC 27037 intake modal where you can register a new case live.<br>• **`Set Active` (Row Action Button)**: Switches the active investigation context to that case. |
| **3. Forensic Replay** | **Dual-Pane Synchronized Evidence Player & Bitstream Inspector.** Plays active and carved camera feeds side-by-side with live physical sector offsets (`0x...`), GOP NAL frame cadence (`00 00 00 01 67`), and cryptographic hashes. | • **Stream Selector Pills (Top of Player)**: Switch between Active feeds (`CAM-01`, `CAM-02`, `CAM-04`) and the Recovered Deleted feed (`[CARVED] CAM-03`).<br>• **`Play / Pause` & `-1s / +1s` Scrubbers**: Plays the surveillance stream and steps frame-by-frame.<br>• **`AI Motion Advisory: ON / OFF` (Toggle Button)**: Toggles OpenCV motion bounding boxes (`MOTION 0.94 [ADVISORY]`) over the video while proving **0% mutation** to the underlying evidence hash. |
| **4. Deleted Video Recovery** | **Unallocated Cluster Carving & GOP Stream Repair Workspace.** Dedicated to recovering deleted/overwritten surveillance clips from raw sectors. | • **`Trigger Deep Cluster Carve` (Top Right Gold Button)**: Runs the raw H.264/H.265 NAL unit signature scanner across unallocated disk space (`0x1C0000`) and updates the recovered artifacts table.<br>• **`Repair Stream` (Row Action Button)**: Synthesizes missing H.264 SPS (`0x67`) and PPS (`0x68`) headers for damaged/headless video streams and displays a green **`Repaired: Injected H.264 SPS (0x67)...`** confirmation badge with the new derivative SHA-256 hash. |
| **5. Evidence Lineage** | **Directed Acyclic Graph (DAG) Provenance Tracker.** Visually maps how raw platter bytes transformed into working copies, parsed streams, carved fragments, and court reports. | • **Interactive DAG Nodes (Click any box)**: Clicking any node (`SOURCE_IMAGE` -> `WORKING_COPY` -> `PARSER_RUN` -> `CARVED_STREAM` -> `REPORT_GENERATED`) opens the **Cryptographic Node Inspector** below it showing exact parent-child SHA-256 linkage.<br>• **`Export Mermaid DAG` / `Export JSON DAG` (Top Right Buttons)**: Downloads the complete mathematical lineage graph as a `.mmd` or `.json` file. |
| **6. Chain of Custody** | **Append-Only Cryptographic Ledger.** Blockchain-style sequential audit log where every forensic action is hashed with the `PREV` event's SHA-256 pointer. | • **`Verify Hash Links` (Top Right Button)**: Re-computes every SHA-256 block from Genesis (`#001`) to the latest event, confirming `CHAIN VALID`.<br>• **`Copy` Icons on `PREV` & `HASH`**: Copies individual block hashes. |
| **7. OEM Coverage Matrix** | **Honest Surveillance Vendor Capability Matrix.** Tracks all 8 CCTV OEMs named in SIH Problem Statement 26150 (`Hikvision`, `Dahua`, `CP Plus`, `Uniview`, `Hanwha`, `Bosch`, `Axis`, `Honeywell`). | • **`Filter by Tier` Dropdown (Top Right)**: Filters the table between **`All Surveillance OEMs (8)`**, **`Empirically Validated (2)`**, **`Profile Specifications Ready (2)`**, and **`Planned Adapters (4)`**. |

---

## 3. Scene-by-Scene Video Recording Script (~3.5 Minutes)

### Scene 1: Introduction & Forensic Dashboard (0:00 – 0:45)
- **On Screen**: Open `http://localhost:5173` (`Dashboard`). Highlight the top header (`DEMO-CASE-001`, `SEC 65B IEA / BSA COMPLIANT`, `Write-Block Active`), the 4-item **Executive Metric Ribbon**, the **Camera Carousel** (`CAM-03` gold `CARVED UNALLOCATED` card), and the **Timeline**.
- **Voiceover**:
  > "Hello Judges. We are presenting our solution for Smart India Hackathon Problem Statement 26150: an automated, court-admissible DVR and NVR Forensic Analysis Platform. Unlike standard computers that use NTFS or FAT32, surveillance DVRs use proprietary ring-buffer filesystems like Dahua DHFS and Hikvision HIK, where deleted footage cannot be recovered by traditional tools. Here on our Investigation Dashboard, we have ingested a seized 64-megabyte Dahua DHFS4.1 raw disk image under strict hardware write-blocking. Our Executive Metric Ribbon immediately confirms 100% dual MD5 and SHA-256 bit-stream parity. Notice in our Camera Carousel that while Cameras 1, 2, and 4 are active, Camera 3—the Warehouse Loading Bay—was deliberately deleted by the suspect, and our engine has automatically carved and recovered it from unallocated disk space."

### Scene 2: Deleted Video Carving & Headless GOP Stream Repair (0:45 – 1:30)
- **On Screen**: Click **`Deleted Video Recovery`** -> Click gold **`Trigger Deep Cluster Carve`** button -> Point to `REC-CARVED-001` (`Offset 0x1C0000`, `98% Structural Confidence`) -> Click **`Repair Stream`** button.
- **Voiceover**:
  > "In our Deleted Video Recovery Workspace, clicking 'Trigger Deep Cluster Carve' executes our two-stage recovery engine—first traversing orphaned proprietary index nodes, and then performing raw H.264 and H.265 NAL-unit signature carving across unallocated sectors. At hex offset `0x1C0000`, it recovered the deleted Loading Bay stream with 98% structural confidence. Because carved raw video fragments often lose their container headers and cannot play in standard players, clicking 'Repair Stream' non-destructively synthesizes and injects missing H.264 Sequence and Picture Parameter Set headers (`SPS 0x67` and `PPS 0x68`) into a verified derivative copy, making the deleted evidence immediately playable."

### Scene 3: Synchronized Forensic Replay & AI Isolation (1:30 – 2:15)
- **On Screen**: Click **`Forensic Replay`** -> Select **`[CARVED] CAM-03 (CARVED)`** -> Click **`Play Stream`** -> Point to live physical hex offset on the right -> Click **`AI Motion Advisory: ON`** to toggle bounding box OFF and ON.
- **Voiceover**:
  > "In Forensic Replay Mode, we inspect the recovered Camera 3 stream in our dual-pane player. On the left, we see the reconstructed video feed with sub-second clock drift compensation—correcting the DVR's 124.5-second internal CMOS clock skew to exact UTC. On the right, every frame is linked in real time to its exact physical disk sector offset and dual MD5 and SHA-256 digests. Crucially, notice the 'AI Motion Advisory' toggle. In digital forensics, if an AI model alters video pixels to draw bounding boxes, the evidence becomes inadmissible in court. Our platform renders OpenCV motion detections in a strictly isolated advisory overlay—allowing examiners to toggle AI insights on or off with zero byte mutation to the underlying evidentiary bitstream."

### Scene 4: Evidence Lineage DAG & Chain of Custody (2:15 – 2:55)
- **On Screen**: Click **`Evidence Lineage`** -> Click nodes in the DAG graph -> Click **`Export JSON DAG`** -> Click **`Chain of Custody`** -> Click **`Verify Hash Links`**.
- **Voiceover**:
  > "To guarantee admissibility under ISO/IEC 27037 and Section 65B, our Evidence Lineage tab constructs a Directed Acyclic Graph tracing every derivative artifact—from the raw platter image to the working copy, parser run, carved stream, and court report. Beside it, our Cryptographic Chain of Custody maintains an append-only, blockchain-style ledger where every event hash incorporates the previous block's SHA-256 digest. Clicking 'Verify Hash Links' mathematically proves that not a single bit of custody history has been altered since intake."

### Scene 5: Honest OEM Matrix & One-Click Section 65B Court PDF (2:55 – 3:40)
- **On Screen**: Click **`OEM Coverage Matrix`** -> Filter by **`Empirically Validated (2)`** -> Return to **`Dashboard`** -> Click **`Generate Court Report`** -> Scroll through the downloaded PDF Report.
- **Voiceover**:
  > "In our OEM Coverage Matrix, we follow a strict forensic non-fabrication policy across all 8 CCTV manufacturers named in Problem Statement 26150—transparently distinguishing between empirically validated binary parsers like Dahua and Hikvision and profile-ready adapters. Finally, returning to the Dashboard, a single click on 'Generate Court Report' compiles the entire investigation—source and working copy hashes, clock-drift normalization curves, carved sector offsets, chain of custody logs, and a pre-formatted Section 65B statutory certificate—into a signed, court-ready PDF report. Thank you!"
