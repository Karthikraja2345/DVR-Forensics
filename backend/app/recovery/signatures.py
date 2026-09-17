"""
H.264, H.265, and DVR Filesystem Signature Constants.
"""

# NAL Unit Start Codes
NAL_PREFIX_4BYTE = b"\x00\x00\x00\x01"
NAL_PREFIX_3BYTE = b"\x00\x00\x01"

# H.264 NAL Unit Types
H264_NAL_SPS = b"\x00\x00\x00\x01\x67"  # Sequence Parameter Set
H264_NAL_PPS = b"\x00\x00\x00\x01\x68"  # Picture Parameter Set
H264_NAL_IDR = b"\x00\x00\x00\x01\x65"  # IDR Keyframe slice
H264_NAL_NON_IDR = b"\x00\x00\x00\x01\x61"  # Non-IDR motion slice
H264_NAL_SEI = b"\x00\x00\x00\x01\x06"  # Supplemental Enhancement Info

# H.265 / HEVC NAL Unit Types
H265_NAL_VPS = b"\x00\x00\x00\x01\x40\x01"
H265_NAL_SPS = b"\x00\x00\x00\x01\x42\x01"
H265_NAL_PPS = b"\x00\x00\x00\x01\x44\x01"
H265_NAL_IDR = b"\x00\x00\x00\x01\x26\x01"

# Dahua / CP Plus Markers
DHFS_MAGIC = b"DHFS"
DHFS_DEL_MARKER = b"DEL_"
