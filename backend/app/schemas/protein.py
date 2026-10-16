from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime

class ProteinCreatePaste(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    sequence: str = Field(..., min_length=10)
    organism: Optional[str] = "Homo sapiens"

class ProteinCreateFASTA(BaseModel):
    filename: str
    fasta_content: str = Field(..., min_length=10)

class ProteinSearchUniProt(BaseModel):
    query: str = Field(..., description="UniProt Accession (e.g. P00533) or Gene Symbol (e.g. EGFR)")

class ProteinMetadataResponse(BaseModel):
    id: str
    hydrophobic_pct: float
    polar_pct: float
    basic_pct: float
    acidic_pct: float
    molecular_weight: float
    isoelectric_point: float
    composition_json: Dict[str, int]

    class Config:
        from_attributes = True

class ProteinResponse(BaseModel):
    id: str
    accession_id: Optional[str] = None
    name: str
    organism: str
    gene_name: Optional[str] = None
    sequence: str
    length: int
    function_description: Optional[str] = None
    source_type: str
    user_id: str
    created_at: datetime
    metadata_rel: Optional[ProteinMetadataResponse] = None

    class Config:
        from_attributes = True
