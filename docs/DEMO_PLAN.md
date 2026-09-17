# Demonstration Plan & Judge Defense Playbook
## SIH 2026 – Problem Statement 26150
### Multi-Vendor DVR/NVR Forensic Analysis Tool

---

## 1. Executive Demonstration Overview
* **Target Audience**: SIH Technical Judges, Law Enforcement Cyber Cells, Forensic Evaluators.
* **Duration**: Exactly **3 Minutes** (Strictly timed).
* **Mode**: **100% Offline** (Zero internet connectivity required; running via local synthetic fixtures).
* **Core Identity Pitch**: *"From proprietary DVR storage to a validated, traceable, and investigation-ready evidence package—without losing where the evidence came from."*

---

## 2. Scripted 3-Minute Demonstration Flow

| Time | Action & Screen | Voiceover Script / Investigator Explanation | Key Visual Proof |
|---|---|---|---|
| **00:00 - 00:25** | **Dashboard & Intake** | *"Good morning. Surveillance video is vital for criminal investigations, but proprietary DVR filesystems trap evidence. Standard tools see unallocated space. Here is our platform handling `CASE-001`. Notice our original raw disk image is write-protected, and we instantly compute deterministic MD5 and SHA-256 hashes."* | Source image verified; dual hashes displayed; `CHAIN VALID` badge. |
| **00:25 - 00:55** | **Vendor Detection & Active Parsing** | *"The investigator triggers automated vendor detection. The engine analyzes magic bytes, filesystem superblocks, and index markers—not filenames. It identifies Dahua DHFS4 with 100% confidence, loading our validated DHFS adapter to extract 4 active camera channels with exact sector offsets."* | `Dahua DHFS4 (1.00)` detected; channel table populated with physical sector offsets. |
| **00:55 - 01:30** | **Deleted Video Recovery & Explanation** | *"Now the breakthrough: a suspect deleted critical footage from CAM-03. We scan unallocated clusters for H.264 NAL prefixes. We recover the deleted clip! Crucially, we don't just claim it's recovered—our Recovery Explanation Engine proves WHY: valid SPS/PPS headers, verified GOP cadence, and exact sector range, awarding it `CONFIRMED` status."* | Deleted clip carved; confidence badge: `CONFIRMED`; checklist of validation rules shown. |
| **01:30 - 01:55** | **Cross-Camera Narrative & Replay** | *"Hardware clocks drift. We preserve the raw hardware timestamp while computing normalized UTC timestamps. In Forensic Replay Mode, we see the incident unfold across cameras in true chronological sequence: Entrance (14:31:04) $\to$ Corridor (14:31:11) $\to$ Vehicle Area (14:31:18) $\to$ Exit (14:31:25)."* | Dual-pane video player + metadata inspector + multi-camera chronological timeline. |
| **01:55 - 02:30** | **Lineage Graph & AI Separation** | *"To prove in court where this video came from, we open our signature Evidence Lineage Graph. Investigators can trace every step from the raw sector bytes to the final export. We also run motion detection on a working copy—strictly isolated from primary evidence."* | Interactive DAG node visualizer showing byte-to-court lineage; AI findings layer. |
| **02:30 - 03:00** | **Chain of Custody & Report Generation** | *"Every action has been cryptographically signed into an append-only, SHA-256 chained custody ledger. Finally, with one click, we generate a court-admissible forensic PDF report complete with hash manifests and recovery proofs. This is true evidence integrity."* | Cryptographic custody chain verified; instant court-ready PDF bundle generated. |

---

## 3. Judge Q&A Defense Playbook

### Q1: "Do you really support all 8 OEMs listed in the problem statement?"
* **Direct Answer**: *"No tool legitimately supports every proprietary OEM without lawful access to firmware and hardware. We refuse to fabricate capabilities. We built an extensible adapter architecture with a transparent matrix: **Dahua and CP Plus are VALIDATED** with ground truth tests; **Hikvision is PROFILE READY**; and the remaining 5 OEMs have adapter specifications **PLANNED**. We show judges the truth rather than fake claims."*

### Q2: "How is deleted video recovered from a proprietary filesystem?"
* **Direct Answer**: *"In DVR filesystems like DHFS, deleting a clip typically unlinks the index record without zeroing the data sectors. Our carving engine scans unallocated clusters for H.264/H.265 NAL unit start codes (`0x0000000167` SPS, `0x0000000168` PPS, `0x0000000165` IDR slices). It groups NAL units into complete Groups of Pictures (GOPs) and validates stream playability."*

### Q3: "How do you ensure you don't contaminate original evidence?"
* **Direct Answer**: *"Following ISO/IEC 27037 standards, the original media is placed in a read-only directory with operating system write inhibition. We calculate MD5 and SHA-256 hashes immediately upon intake. All subsequent operations—parsing, carving, and AI analytics—are performed strictly on verified bit-stream working copies."*

### Q4: "Why calculate both MD5 and SHA-256?"
* **Direct Answer**: *"Both are explicitly required by the problem statement and standard forensic protocols. While MD5 provides historical compatibility with legacy police records, SHA-256 guarantees modern cryptographic collision resistance."*

### Q5: "Why is this a forensic tool rather than just a specialized CCTV player?"
* **Direct Answer**: *"A CCTV player simply decodes video streams. Our platform manages evidence intake, computes dual hashes, isolates originals, parses proprietary superblocks, carves deleted clusters with structural explanation, normalizes drifting timestamps across cameras, maintains an append-only cryptographic custody ledger, visualizes physical-to-logical lineage, and generates court-ready forensic reports."*

### Q6: "Can AI findings be presented in court as direct evidence?"
* **Direct Answer**: *"No. In digital forensics, AI is solely an investigative assistant for triage and anomaly detection. In our architecture, AI findings are stored in an auxiliary layer referencing artifact IDs. The primary video evidence remains completely untouched."*
