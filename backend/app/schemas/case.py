from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class CaseBase(BaseModel):
    name: str
    investigator: str
    agency: Optional[str] = None
    description: Optional[str] = None


class CaseCreate(CaseBase):
    id: str


class CaseResponse(CaseBase):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime
    evidence_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class CaseDetailResponse(CaseResponse):
    pass
