from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.drug import DrugResponse

class CandidateCreateRequest(BaseModel):
    drug_ids: list[str]
    protein_id: Optional[str] = None

class CandidateQueueResponse(BaseModel):
    id: str
    drug_id: str
    protein_id: Optional[str] = None
    user_id: str
    status: str
    created_at: datetime
    drug: Optional[DrugResponse] = None

    class Config:
        from_attributes = True
