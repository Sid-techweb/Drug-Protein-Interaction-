from fastapi import APIRouter, Depends, Header, UploadFile, File, Form, status
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.auth_service import AuthService
from app.services.protein_service import ProteinService
from app.services.uniprot_service import UniProtService
from app.schemas.protein import (
    ProteinCreatePaste,
    ProteinCreateFASTA,
    ProteinSearchUniProt,
    ProteinResponse
)
from app.exceptions.base_exceptions import AuthenticationException, ResourceNotFoundException, HelixQException
from app.constants.error_codes import ErrorCode

router = APIRouter(prefix="/api/v1/protein", tags=["Protein Intelligence Engine"])

def get_current_user_id(authorization: str = Header(...), db: Session = Depends(get_db)) -> str:
    if not authorization.startswith("Bearer "):
        raise AuthenticationException("Invalid authorization header format.")
    token = authorization.split(" ")[1]
    auth_service = AuthService(db)
    payload = auth_service.decode_token(token)
    return payload.sub

@router.post("/paste", response_model=ProteinResponse, status_code=status.HTTP_201_CREATED)
def paste_protein_sequence(
    request: ProteinCreatePaste,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Validate, calculate physicochemical properties, and store pasted protein sequence."""
    service = ProteinService(db)
    protein = service.create_pasted_protein(
        name=request.name,
        raw_sequence=request.sequence,
        user_id=user_id,
        organism=request.organism or "Homo sapiens"
    )
    return protein

@router.post("/upload", response_model=ProteinResponse, status_code=status.HTTP_201_CREATED)
async def upload_fasta_file(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Upload and parse .fasta / .txt file, validate amino acids, and store in PostgreSQL."""
    if not file.filename.endswith(('.fasta', '.fa', '.txt')):
        raise HelixQException("Invalid file extension. Please upload a .fasta or .txt file.", ErrorCode.VALIDATION_ERROR, 400)

    content_bytes = await file.read()
    try:
        content_str = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        raise HelixQException("File contains invalid text encoding.", ErrorCode.VALIDATION_ERROR, 400)

    service = ProteinService(db)
    protein = service.create_fasta_protein(
        filename=file.filename,
        fasta_content=content_str,
        user_id=user_id
    )
    return protein

@router.post("/uniprot-search", response_model=ProteinResponse, status_code=status.HTTP_201_CREATED)
async def search_uniprot_protein(
    request: ProteinSearchUniProt,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Search UniProt REST API by Accession or Gene Symbol, parse metadata, and persist to PostgreSQL."""
    uniprot_service = UniProtService(db=db)
    protein = await uniprot_service.search_and_store_protein(
        query=request.query,
        user_id=user_id
    )
    return protein

@router.get("/{protein_id}", response_model=ProteinResponse)
def get_protein_by_id(
    protein_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Retrieve protein record and detailed physicochemical metadata by ID."""
    service = ProteinService(db)
    protein = service.repo.get_by_id(protein_id)
    if not protein:
        raise ResourceNotFoundException("Protein", protein_id)
    return protein

@router.get("", response_model=List[ProteinResponse])
def get_user_proteins(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Retrieve list of all protein targets prepared by current user."""
    service = ProteinService(db)
    return service.repo.get_by_user_id(user_id)
