from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.schemas.drug import DrugResponse

class QUBOWeights(BaseModel):
    weight_probability: float = Field(1.0, ge=0.0, le=5.0)
    weight_affinity: float = Field(1.0, ge=0.0, le=5.0)
    weight_lipinski: float = Field(0.5, ge=0.0, le=5.0)
    weight_diversity_penalty: float = Field(0.8, ge=0.0, le=5.0)

class QUBOOptimizeRequest(BaseModel):
    protein_id: str
    prediction_ids: Optional[List[str]] = None
    weights: Optional[QUBOWeights] = None

class OptimizationResultResponse(BaseModel):
    id: str
    job_id: str
    drug_id: str
    initial_ai_rank: int
    optimized_rank: int
    ai_score: float
    quantum_score: float
    rank_delta: int
    is_selected: bool
    created_at: datetime
    drug: Optional[DrugResponse] = None

    class Config:
        from_attributes = True

class QuantumJobResponse(BaseModel):
    id: str
    user_id: str
    protein_id: str
    status: str
    solver_type: str
    num_candidates: int
    selected_count: int
    qubo_energy: float
    runtime_ms: float
    weights_json: Dict[str, Any]
    created_at: datetime
    results: Optional[List[OptimizationResultResponse]] = None

    class Config:
        from_attributes = True

class RankComparisonResponse(BaseModel):
    job_id: str
    total_candidates: int
    selected_candidates: int
    avg_rank_shift: float
    max_rank_boost: int
    quantum_optimization_gain_pct: float
    results: List[OptimizationResultResponse]
