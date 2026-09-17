import hashlib
from pathlib import Path
from typing import Tuple, Dict, Any


class DualHasher:
    """
    Deterministic Dual Hasher computing MD5 and SHA-256 simultaneously
    over chunked binary streams.
    """

    DEFAULT_CHUNK_SIZE = 65536  # 64 KB

    @staticmethod
    def hash_file(file_path: Path, chunk_size: int = DEFAULT_CHUNK_SIZE) -> Tuple[str, str, int]:
        """
        Computes MD5 and SHA-256 hashes of a file in a single streaming pass.
        Returns (md5_hex, sha256_hex, total_bytes).
        """
        path = Path(file_path)
        if not path.is_file():
            raise FileNotFoundError(f"Evidence file not found: {file_path}")

        md5 = hashlib.md5()
        sha256 = hashlib.sha256()
        total_bytes = 0

        with open(path, "rb") as f:
            while chunk := f.read(chunk_size):
                md5.update(chunk)
                sha256.update(chunk)
                total_bytes += len(chunk)

        return md5.hexdigest(), sha256.hexdigest(), total_bytes

    @staticmethod
    def hash_bytes(data: bytes) -> Tuple[str, str]:
        """
        Computes MD5 and SHA-256 of in-memory byte buffer.
        """
        md5 = hashlib.md5(data).hexdigest()
        sha256 = hashlib.sha256(data).hexdigest()
        return md5, sha256

    @staticmethod
    def verify_file_hash(file_path: Path, expected_sha256: str) -> bool:
        """
        Verifies whether file's SHA-256 matches expected hash.
        """
        _, current_sha256, _ = DualHasher.hash_file(file_path)
        return current_sha256.lower() == expected_sha256.lower()
