from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.schemas.protein import ProteinResponse

class ReportGenerateRequest(BaseModel):
    title: str
    protein_id: str
    workflow_run_id: Optional[str] = None

class ScientificReportResponse(BaseModel):
    id: str
    user_id: str
    title: str
    workflow_run_id: Optional[str] = None
    protein_id: str
    summary_text: str
    report_data_json: Dict[str, Any]
    created_at: datetime
    protein: Optional[ProteinResponse] = None

    class Config:
        from_attributes = True
