# Security, Ethical & Legal Boundaries
## SIH 2026 – Problem Statement 26150
### Multi-Vendor DVR/NVR Forensic Analysis Tool

---

## 1. Ethical & Legal Mission Statement
The SIH-26150 DVR/NVR Forensics Platform is developed strictly for **authorized digital forensic investigations**, lawful law enforcement inquiries, judicial proceedings, and academic forensic science research.

---

## 2. Strict Operational Boundaries ("DO NOT" Mandates)

In strict accordance with legal mandates and ethical guidelines:

1. **NO Live Device Exploitation**:
   - The platform will **NOT** attempt to bypass passwords, crack firmware encryption, exploit network vulnerabilities, or inject unauthorized payloads into live DVR/NVR hardware.
2. **NO Credential Harvesting**:
   - The software will **NOT** extract or store administrative credentials, cloud tokens, or unauthorized private keys from connected devices.
3. **NO Unauthorized Device Interaction**:
   - The tool does not perform intrusive network port scanning or unauthorized RTSP/ONVIF connection attempts across public networks.
4. **NO Evidence Modification**:
   - The original physical drive or acquired bit-stream disk image is strictly write-protected. All analysis is restricted to verified working copies.
5. **NO Fabricated Evidence**:
   - The platform will never invent or simulate forensic hashes, byte offsets, recovery results, or vendor detections. When synthetic fixtures are used for demonstration, they must be explicitly labeled as `DEMO DATA`.

---

## 3. Compliance with Legal Evidence Standards

### 3.1 ISO/IEC 27037:2012
The system adheres to the fundamental principles of digital evidence preservation:
* **Auditability**: Every action taken by any user is recorded with actor ID, timestamp, and tool version.
* **Repeatability**: Running the same tool version against identical evidence produces identical hash manifests and carved artifacts.
* **Justification**: Carving and recovery decisions are backed by structural parameter checks (SPS/PPS validation).

### 3.2 Judicial Admissibility
* **Indian Evidence Act (Section 65B) / Bharatiya Sakshya Adhiniyam (Section 63)**:
  - Generates verifiable certificate parameters: machine hash, uninterrupted storage logs, and device operating status.
* **Federal Rules of Evidence (FRE 901 & 702)**:
  - Supports forensic chain of custody requirements demonstrating that digital recordings are genuine, unadulterated, and attributable to their physical origin.

---

## 4. Privacy & Analytical Boundaries
* **AI Facial Recognition Policy**: Face detection features are restricted to authorized investigative scenarios and operate only on locally hosted models without external API data transmission.
* **Data Minimization**: Investigators are encouraged to define temporal filters to acquire and analyze only footage relevant to the authorized warrant scope.
