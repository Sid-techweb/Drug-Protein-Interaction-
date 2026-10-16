from fastapi import APIRouter, Depends, Header, UploadFile, File, status
from typing import List
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.auth_service import AuthService
from app.services.dataset_service import DatasetService
from app.schemas.drug import (
    DrugDatasetResponse,
    ChEMBLImportRequest,
    DatasetAnalyticsResponse
)
from app.exceptions.base_exceptions import AuthenticationException, HelixQException
from app.constants.error_codes import ErrorCode

router = APIRouter(prefix="/api/v1/dataset", tags=["Dataset Management System"])

def get_current_user_id(authorization: str = Header(...), db: Session = Depends(get_db)) -> str:
    if not authorization.startswith("Bearer "):
        raise AuthenticationException("Invalid authorization header format.")
    token = authorization.split(" ")[1]
    auth_service = AuthService(db)
    payload = auth_service.decode_token(token)
    return payload.sub

@router.get("", response_model=List[DrugDatasetResponse])
def get_user_datasets(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Retrieve all datasets imported/created by authenticated user."""
    service = DatasetService(db)
    return service.repo.get_datasets_by_user(user_id)

@router.post("/chembl-import", response_model=DrugDatasetResponse, status_code=status.HTTP_201_CREATED)
async def import_chembl_dataset(
    request: ChEMBLImportRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Query ChEMBL REST API, process Morgan fingerprints and descriptors, and store dataset."""
    service = DatasetService(db)
    return await service.import_chembl_dataset(
        name=request.name,
        query=request.query,
        user_id=user_id,
        max_compounds=request.max_compounds or 50
    )

@router.post("/upload-file", response_model=DrugDatasetResponse, status_code=status.HTTP_201_CREATED)
async def upload_dataset_file(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Upload CSV or SDF molecular compound dataset file, validate SMILES, and store."""
    if not file.filename.endswith(('.csv', '.sdf', '.txt')):
        raise HelixQException("Invalid file type. Please upload a .csv or .sdf dataset file.", ErrorCode.VALIDATION_ERROR, 400)

    content_bytes = await file.read()
    try:
        content_str = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        raise HelixQException("File contains invalid text encoding.", ErrorCode.VALIDATION_ERROR, 400)

    service = DatasetService(db)
    return service.import_csv_dataset(
        filename=file.filename,
        csv_content=content_str,
        user_id=user_id
    )

@router.get("/analytics", response_model=DatasetAnalyticsResponse)
def get_dataset_analytics(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Retrieve dynamic analytics on total compounds, MW, LogP, and Lipinski pass rate."""
    service = DatasetService(db)
    return service.repo.get_analytics(user_id)
