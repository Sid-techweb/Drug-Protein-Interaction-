from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class ChEMBLImportRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    query: str = Field(..., description="UniProt Accession (e.g. P00533), Gene Symbol (e.g. EGFR), or Target ChEMBL ID")
    max_compounds: Optional[int] = Field(default=50, ge=5, le=500)

class DrugPropertyResponse(BaseModel):
    id: str
    heavy_atom_count: int
    ring_count: int
    fraction_csp3: float
    molar_refractivity: float
    descriptors_json: Dict[str, Any]
    atom_graph_json: Dict[str, Any]

    class Config:
        from_attributes = True

class DrugFingerprintResponse(BaseModel):
    id: str
    morgan_fp_bitstring: str
    maccs_fp_bitstring: str

    class Config:
        from_attributes = True

class DrugTargetResponse(BaseModel):
    id: str
    target_name: str
    uniprot_id: Optional[str] = None
    chembl_target_id: Optional[str] = None
    activity_type: str
    activity_value: float
    activity_units: str

    class Config:
        from_attributes = True

class DrugResponse(BaseModel):
    id: str
    chembl_id: Optional[str] = None
    name: str
    smiles: str
    formula: str
    molecular_weight: float
    logp: float
    hbd: int
    hba: int
    tpsa: float
    rotatable_bonds: int
    dataset_id: str
    user_id: str
    created_at: datetime
    property_rel: Optional[DrugPropertyResponse] = None
    fingerprint_rel: Optional[DrugFingerprintResponse] = None
    targets: List[DrugTargetResponse] = []

    class Config:
        from_attributes = True

class DrugDatasetResponse(BaseModel):
    id: str
    name: str
    source_type: str
    total_compounds: int
    status: str
    storage_size_bytes: int
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DatasetAnalyticsResponse(BaseModel):
    total_compounds: int
    unique_targets: int
    avg_molecular_weight: float
    avg_logp: float
    lipinski_pass_rate_pct: float
    source_breakdown: Dict[str, int]
