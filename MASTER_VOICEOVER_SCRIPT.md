# Master Prototype Demo Voiceover & Screen Action Script
**SIH 2026 — Problem Statement 26150: Multi-Vendor DVR/NVR Forensic Analysis Platform**

> **Pre-Recording Setup (Keep These 2 Windows Open Before You Hit Record):**
> 1. **Window 1 — Chrome Browser**: Open at `http://localhost:5173` (starting on the **`Dashboard`** tab).
> 2. **Window 2 — PowerShell Terminal**: Open inside `C:\Users\karth\.gemini\antigravity\scratch\sih-26150-dvr-forensics` with this command typed and ready to press `Enter`:
>    ```powershell
>    python -m pytest tests/ -v; python scripts/run_validation.py
>    ```

---

## SCENE 1: The Real-World Problem & `Dashboard` Overview (0:00 – 0:50)

### What to Do on Screen:
1. Start recording on the **`Dashboard`** tab (`http://localhost:5173`).
2. Move your cursor across the **Top Header Bar**: highlight `ACTIVE FILE: DEMO-CASE-001`, the green **`WRITE-BLOCK SECURE`** badge, **`ISO/IEC 27037:2012`**, **`SEC 65B / 63 BSA`**, and **`Insp. Rajesh Kumar`**.
3. Move across the **4-Column Executive Metric Strip**: point to `DEMO-CASE-001`, `100.0% Evidence Hashing Parity`, `1 Recovered Carved Deleted Footage (CAM-03 Loading Bay)`, and `CHAIN VALID`.
4. In the **Surveillance Stream Directory** carousel, point to `CAM-01`, `CAM-02`, `CAM-04`, `CAM-05`, and click **`Next >`** to show the gold-badged **`CAM-03 Loading Bay (Carved)`** card.
5. Scroll down slowly to show the **Multi-Camera Incident Flow Chart** (pointing out the gold dot at `CAM-03 14:31:12`), the **Seized Physical Evidence Table (`EV-001` Dahua DHFS4)**, and the **Cross-Camera Synchronized Timeline**.

### Exact Voiceover to Speak:
> "Hello Judges. We are presenting our solution for Smart India Hackathon Problem Statement 26150: an end-to-end, court-admissible Multi-Vendor DVR and NVR Forensic Analysis Platform.
>
> When a crime occurs and a perpetrator deletes CCTV recordings or formats a DVR hard drive, standard Windows or Linux recovery tools like Autopsy and Photorec fail completely. That is because CCTV DVRs do not use NTFS or FAT32—manufacturers like Dahua and Hikvision use proprietary ring-buffer filesystems like DHFS4 and HIK that store raw video slices directly inside pre-allocated binary blocks.
>
> Here on our Investigation Dashboard, we have loaded Case `DEMO-CASE-001`—Operation IronGate—examined by Inspector Rajesh Kumar under strict ISO/IEC 27037 hardware write-blocking. We ingested `EV-001`, a seized Dahua DHFS4 raw disk image. Our Executive Metric Strip immediately confirms 100.0% MD5 and SHA-256 bit-stream parity between the physical hard disk and our working copy.
>
> In our Surveillance Stream Directory and Incident Flow Chart, you can see that while Cameras 1, 2, 4, and 5 are active allocated recordings, Camera 3—the Warehouse Loading Bay—was deliberately deleted by the suspect during the break-in, and our engine has automatically carved and reconstructed it from unallocated disk sectors."

---

## SCENE 2: `Case Management` — Police Docket Registry (0:50 – 1:10)

### What to Do on Screen:
1. Click **`Case Management`** (2nd tab in Left Sidebar).
2. Point to the **`DEMO-CASE-001`** row (*Operation IronGate – Surveillance Forensics*, `IN_PROGRESS`).
3. Click the **`+ Register New Case`** button at the top right to briefly show the ISO/IEC 27037 intake modal, then click **`Cancel`**.

### Exact Voiceover to Speak:
> "In the Case Management tab, forensic laboratories can manage multiple investigation dockets simultaneously. Clicking 'Register New Case' provides an ISO/IEC 27037 compliant intake workflow that binds every seized hard drive to a lead examiner, agency, and cryptographic custody chain from the moment of seizure."

---

## SCENE 3: `Recovery Workspace` — Carving Unallocated Sectors & `SPS/PPS` Stream Repair (1:10 – 1:55)

### What to Do on Screen:
1. Click **`Recovery Workspace`** (4th tab in Left Sidebar).
2. Click the gold button **`Trigger Deep Cluster Carve`** (top right). Click **OK** on the popup (`Carving Complete: 1 deleted artifacts recovered!`).
3. Point to the recovered artifact row **`ART-CARVED-01`** in the table: highlight **`CONFIRMED`**, **`Offset 0x1C0000 (524,288 B)`**, and **`98% Structural Confidence`**.
4. Click the **`Repair Stream`** button on the right side of that row.
5. Click **OK** on the popup and point to the green confirmation badge **`✓ Repaired: Injected H.264 SPS (0x67)...`** that appears under `ART-CARVED-01`.

### Exact Voiceover to Speak:
> "Now let's look at how we actually recover deleted CCTV footage in the Recovery Workspace. When we click 'Trigger Deep Cluster Carve', our two-stage hybrid recovery engine first scans for orphaned DHFS filesystem index descriptors, and second, sweeps raw unallocated disk clusters for H.264 and H.265 Network Abstraction Layer signatures.
>
> Here at physical hexadecimal offset `0x1C0000`, our engine rescued the deleted Camera 3 Loading Bay clip with 98% structural confidence.
>
> However, in real-world DVR forensics, when a video clip is deleted, its container header is overwritten—leaving 'headless' video slices that VLC or FFmpeg cannot play. When we click 'Repair Stream', our engine non-destructively synthesizes and injects missing H.264 Sequence Parameter Set (`SPS 0x67`) and Picture Parameter Set (`PPS 0x68`) GOP headers into a verified derivative stream, making corrupted deleted footage immediately playable."

---

## SCENE 4: `Forensic Replay` — Dual-Pane Player, Clock-Drift UTC Fix & Isolated AI Overlay (1:55 – 2:45)

### What to Do on Screen:
1. Click **`Forensic Replay`** (3rd tab in Left Sidebar).
2. At the bottom under `SELECT STREAM CHANNEL (5 AVAILABLE)`, click **`CAM-01 ALLOCATED`** and then click **`CAM-03 CARVED Loading Bay (Carved)`**.
3. Click the **`Play`** button below the video player so the orange timeline scrubber starts moving.
4. Point to the top-right corner of the video player (`DEVICE: 2026-09-11 09:01:04` vs `UTC: 2026-09-11T03:31:04 UTC`) and the right-hand **`Forensic Metadata Inspector`** (`Raw Hardware Clock`, `Normalized UTC Time`, `Physical Sector Offset`, and `SHA-256 / MD5` signatures).
5. Click the gold button **`AI Overlay (ON)`** to turn the `PERSON (0.94)` and `VEHICLE (0.89)` bounding boxes **OFF**, and click it again to turn them **ON**—pointing out that the `SHA-256` hash on the right never changes.

### Exact Voiceover to Speak:
> "Next, in Forensic Replay Mode, investigators examine all 4 allocated feeds alongside the carved Camera 3 Loading Bay feed. This dual-pane player solves two major courtroom challenges:
>
> First, DVR internal CMOS clocks almost always drift over time. Notice in the Forensic Metadata Inspector on the right: the DVR's raw hardware clock recorded `09:01:04`, which was skewed by 5 and a half hours. Our engine applies sub-second clock-drift normalization (`±0.04s`) to align every frame to true UTC time (`03:31:04 GMT`), while still preserving the raw hardware timestamp.
>
> Second, under Section 65B of the Indian Evidence Act and Section 63 of the Bharatiya Sakshya Adhiniyam, if an AI model draws bounding boxes directly onto video frames, it alters the file's pixel bytes and invalidates the SHA-256 hash—causing the court to reject the evidence for tampering. Watch what happens when we toggle 'AI Overlay ON and OFF': our person and vehicle detections are rendered on a strictly isolated HTML5 advisory canvas above the video. Examiners get full AI insights with 0% byte mutation to the underlying evidentiary bitstream."

---

## SCENE 5: `Evidence Lineage DAG` & `Chain of Custody` (2:45 – 3:25)

### What to Do on Screen:
1. Click **`Evidence Lineage DAG`** (5th tab in Left Sidebar).
2. Click across the 5 node cards in sequence:
   - `#1 Physical DVR Platter (Write-Protected)`
   - `#2 Bit-Stream Raw Disk Image`
   - `#3 Dahua DHFS4 Storage Index`
   - `#4 Carved Clip: Loading Bay (CAM-03)`
   - `#5 Court-Ready Forensic PDF Report`
3. Click **`Export JSON DAG`** at the top right to show the lineage graph file downloading.
4. Click **`Chain of Custody`** (6th tab in Left Sidebar).
5. Point to the sequential rows (`#000` to `#006`) showing how each row's `PREV` hash matches the previous row's `HASH`, and click **`Verify Hash Links`** at the top right. Click **OK** on the verification popup.

### Exact Voiceover to Speak:
> "To prove in court that the carved Camera 3 clip genuinely originated from the seized hard drive, our Evidence Lineage tab constructs a mathematical Directed Acyclic Graph across all 5 states—tracing the SHA-256 digest from the Physical DVR Platter (#1), through the Bit-Stream Working Copy (#2), the DHFS4 Storage Index (#3), the Carved Loading Bay Clip (#4), to the Final Court Report (#5). This entire provenance graph can be exported as JSON or Mermaid.
>
> Complementing this, our Chain of Custody tab implements an append-only, blockchain-style cryptographic ledger. Every action's SHA-256 hash incorporates the previous event's hash pointer (`PREV -> HASH`). Clicking 'Verify Hash Links' re-computes the entire chain from the Genesis block, proving with 100% mathematical certainty that no log entry has been altered."

---

## SCENE 6: `OEM Coverage Matrix` — 8 Surveillance Brands (3:25 – 3:45)

### What to Do on Screen:
1. Click **`OEM Coverage Matrix`** (7th tab in Left Sidebar).
2. Click the **`Filter by Tier`** dropdown (top right), select **`Empirically Validated (2)`** (showing Dahua and Hikvision with binary ground-truth fixtures), and switch back to **`All Surveillance OEMs (8)`**.

### Exact Voiceover to Speak:
> "In our OEM Coverage Matrix, we track all 8 surveillance manufacturers specified in Problem Statement 26150—Dahua, Hikvision, CP Plus, Uniview, Hanwha, Bosch, Axis, and Honeywell. Following strict forensic non-fabrication standards, we transparently distinguish between empirically validated binary parsers tested against real disk fixtures and profile-ready adapter specifications."

---

## SCENE 7: Live Terminal Proof — 33 Pytest Tests & 10 Forensic Benchmarks (3:45 – 4:15)

### What to Do on Screen:
1. Switch (`Alt + Tab`) to your **PowerShell Terminal** window (`C:\Users\karth\.gemini\antigravity\scratch\sih-26150-dvr-forensics`).
2. Press `Enter` to run:
   ```powershell
   python -m pytest tests/ -v; python scripts/run_validation.py
   ```
3. Watch **`33 passed`** appear in green, immediately followed by the formatted table of **10 Ground-Truth Forensic Benchmarks (`BENCH-01` to `BENCH-10`)** all showing **`PASS [OK]`** (`100% COMPLIANCE`).

### Exact Voiceover to Speak:
> "To prove that our forensic engine is backed by real binary algorithms rather than static UI mocks, here is our automated verification suite running live in the terminal.
>
> First, all 33 unit and integration tests pass—verifying E01 and L01 forensic containers, MBR and GPT partition geometries, Dahua and Hikvision parsers, sub-second timestamp drift curves, and write-blocker integrity.
>
> Second, our 10-benchmark Ground-Truth Validation Suite runs live against synthetic binary DVR images—confirming 100% source hashing repeatability, 1.00 confidence vendor detection, active and deleted stream carving recall, H.264 NAL header cadence, 0% AI byte mutation, bit-flip tamper detection, and a carving throughput exceeding 70,000 megabytes per minute."

---

## SCENE 8: Grand Finale — One-Click Section 65B / 63 BSA Court PDF Report (4:15 – 4:40)

### What to Do on Screen:
1. Switch back to your browser on the **`Dashboard`** tab.
2. Click the Prussian Blue button **`Generate Court Report`** at the top right.
3. A new browser tab automatically opens displaying the multi-page **Official Forensic Investigation PDF Report**.
4. Scroll smoothly through the PDF pages showing the Case Summary, Physical Evidence Dual Hashes, Carved Video Table (`Offset 0x1C0000`), Chain of Custody Ledger, and the **Section 65B Indian Evidence Act / Section 63 Bharatiya Sakshya Adhiniyam Statutory Certificate** at the bottom.

### Exact Voiceover to Speak:
> "Finally, returning to the Dashboard, a single click on 'Generate Court Report' compiles the entire investigation into a court-admissible PDF document. It includes the physical and working-copy MD5 and SHA-256 digests, the recovered deleted video sector offsets, the synchronized UTC timeline, the verified Chain of Custody ledger, and a pre-formatted Section 65B Indian Evidence Act and Section 63 Bharatiya Sakshya Adhiniyam statutory certificate ready for judicial submission.
>
> Thank you, Judges!"
