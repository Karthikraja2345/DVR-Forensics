from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class ReportResponse(BaseModel):
    case_id: str
    report_title: str
    pdf_path: str
    sha256: str
    generated_at: datetime
    file_size_bytes: int


class OEMMatrixItem(BaseModel):
    oem: str
    detection: str
    parser_status: str
    recovery_status: str
    metadata_status: str
    status: str  # VALIDATED, PROFILE READY, PLANNED
    fixture_reference: Optional[str] = None


class OEMMatrixResponse(BaseModel):
    updated_at: datetime
    total_oems: int
    validated_count: int
    profile_ready_count: int
    planned_count: int
    matrix: List[OEMMatrixItem]


class ValidationMetric(BaseModel):
    benchmark_id: str
    name: str
    target: str
    actual: str
    passed: bool
    details: str


class ValidationRunResponse(BaseModel):
    run_id: str
    executed_at: datetime
    total_benchmarks: int
    passed_benchmarks: int
    success_rate_percent: float
    metrics: List[ValidationMetric]


class HealthResponse(BaseModel):
    status: str
    tool_version: str
    environment: str
    timestamp: datetime
