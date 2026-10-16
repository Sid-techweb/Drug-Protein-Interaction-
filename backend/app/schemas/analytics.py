from pydantic import BaseModel
from typing import Dict, Any, List

class AnalyticsDashboardResponse(BaseModel):
    total_proteins: int
    total_drugs: int
    total_predictions: int
    total_quantum_jobs: int
    avg_interaction_probability: float
    avg_binding_affinity_pkd: float
    avg_lipinski_pass_pct: float
    avg_prediction_latency_ms: float
    avg_quantum_runtime_ms: float
    dataset_source_counts: Dict[str, int]
    prediction_status_breakdown: Dict[str, int]
    timeline_history: List[Dict[str, Any]]
