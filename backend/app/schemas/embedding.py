from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EmbeddingJobResponse(BaseModel):
    id: str
    protein_id: str
    status: str
    model_name: str
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
