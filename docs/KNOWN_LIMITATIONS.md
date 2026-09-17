# Known Technical Limitations & Engineering Scope
## SIH 2026 – Problem Statement 26150
### Multi-Vendor DVR/NVR Forensic Analysis Tool

---

## 1. Transparency in Digital Forensics
Forensic integrity demands complete transparency regarding software boundaries. This document outlines the explicit technical boundaries of the SIH-26150 platform.

---

## 2. Identified Limitations & Mitigation Strategies

### 2.1 Proprietary Hardware Encryption
* **Limitation**: Certain enterprise NVRs employ hardware-level AES encryption tied to secure cryptoprocessors on the motherboard.
* **Impact**: Raw disk images acquired without the hardware decryption key cannot be decoded or carved.
* **Mitigation**: The system detects high-entropy unallocated space, flags the volume as `ENCRYPTION_SUSPECTED`, and advises investigators to acquire footage via authorized cryptographic bypass procedures.

### 2.2 Severely Overwritten Sectors
* **Limitation**: In continuous loop recording (FIFO overwrite), once a physical cluster has been overwritten with new video blocks, the original data is permanently destroyed.
* **Impact**: Recovery of overwritten video is mathematically impossible without residual analog platter analysis.
* **Mitigation**: The system carves partially intact GOP fragments and assigns `PARTIAL` status with explicit byte loss diagnostics rather than failing silently.

### 2.3 Physical Disk Defects & Bad Sectors
* **Limitation**: The platform is an analytical software layer; it is not a physical hardware imager.
* **Impact**: Attempting to read drives with failing read/write heads or bad sectors can cause I/O lockups.
* **Mitigation**: Physical disk acquisition must be performed using dedicated hardware write-blockers (e.g., Tableau, Atola) prior to ingesting the raw bit-stream image (`.dd`/`.raw`) into this platform.

### 2.4 Proprietary Audio Codecs
* **Limitation**: Some surveillance vendors encapsulate proprietary audio encodings (e.g., custom ADPCM variants, G.711 extensions) within video wrappers.
* **Impact**: Video playback will be intact, but accompanying audio tracks may require vendor-specific codecs.
* **Mitigation**: Video streams are preserved bit-for-bit; missing audio codecs are reported in the media integrity checklist without preventing video review.

### 2.5 Multi-Drive Proprietary RAID De-striping
* **Limitation**: Complex 16-channel and 32-channel NVRs occasionally stripe data across proprietary JBOD or non-standard RAID-5 arrays with proprietary block rotation.
* **Impact**: Ingestion of an isolated single drive from a striped array results in discontinuous fragmented streams.
* **Mitigation**: The platform currently assumes a single physical disk image or a pre-reassembled linear disk image. Multi-drive de-striping is scheduled for Phase 2 roadmap.
