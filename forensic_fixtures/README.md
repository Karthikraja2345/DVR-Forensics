# Forensic Fixtures Directory

This directory houses controlled synthetic disk images, recordings, and expected ground truth manifests for automated regression and validation testing.

## Directory Structure
- `sample_images/`: Raw bit-stream disk images (`.raw`, `.dd`).
  - `dahua_dhfs_sample_01.raw`: Synthetic Dahua DHFS4 disk image ($8\text{ MB}$) with 4 active channels (`CAM-01`, `CAM-02`, `CAM-04`, `CAM-05`) and 1 deleted channel (`CAM-03`).
- `sample_recordings/`: Standalone elementary stream fixtures.
- `deleted_recovery/`: Isolated carving test vectors.
- `expected_results/`: Ground truth JSON manifests containing expected hashes, timestamps, and channel mappings.

## Ground Truth Principles
1. Never commit real seized evidence to version control.
2. Fixtures must be fully reproducible via `python scripts/generate_synthetic_fixtures.py`.
3. Validation tests compare outputs bit-for-bit against expected manifests.
