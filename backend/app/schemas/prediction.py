from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.schemas.protein import ProteinResponse
from app.schemas.drug import DrugResponse

class DTIPredictionRequest(BaseModel):
    protein_id: str
    drug_id: str

class BatchPredictionRequest(BaseModel):
    protein_id: str
    drug_ids: List[str]

class DTIPredictionResponse(BaseModel):
    id: str
    protein_id: str
    drug_id: str
    user_id: str
    interaction_probability: float
    confidence_score: float
    binding_affinity_pkd: float
    prediction_status: str
    inference_time_ms: float
    model_version: str
    created_at: datetime
    protein: Optional[ProteinResponse] = None
    drug: Optional[DrugResponse] = None

    class Config:
        from_attributes = True

class ExplainabilityResponse(BaseModel):
    prediction_id: str
    interaction_probability: float
    confidence_score: float
    top_protein_residues: List[Dict[str, Any]] # [{ residue_index: 45, residue_name: 'VAL', attention: 0.89 }]
    top_drug_atoms: List[Dict[str, Any]]       # [{ atom_index: 2, element: 'N', importance: 0.94 }]
    attention_matrix_summary: Dict[str, Any]
    decision_summary: str
