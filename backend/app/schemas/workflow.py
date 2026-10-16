from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.schemas.protein import ProteinResponse
from app.schemas.drug import DrugDatasetResponse

class WorkflowExecuteRequest(BaseModel):
    name: str
    protein_id: str
    target_query: Optional[str] = "P00533" # UniProt target or query
    max_compounds: Optional[int] = 30

class WorkflowStageResponse(BaseModel):
    id: str
    run_id: str
    stage_number: int
    stage_name: str
    status: str
    details_json: Dict[str, Any]
    duration_ms: float
    created_at: datetime

    class Config:
        from_attributes = True

class WorkflowRunResponse(BaseModel):
    id: str
    user_id: str
    name: str
    protein_id: str
    dataset_id: Optional[str] = None
    quantum_job_id: Optional[str] = None
    status: str
    current_stage: int
    total_stages: int
    total_compounds: int
    selected_compounds: int
    execution_time_ms: float
    created_at: datetime
    protein: Optional[ProteinResponse] = None
    dataset: Optional[DrugDatasetResponse] = None
    stages: Optional[List[WorkflowStageResponse]] = None

    class Config:
        from_attributes = True
