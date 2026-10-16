from fastapi import APIRouter, Depends, Header, status
from typing import List
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.auth_service import AuthService
from app.services.workflow_service import WorkflowService
from app.schemas.workflow import WorkflowExecuteRequest, WorkflowRunResponse
from app.exceptions.base_exceptions import AuthenticationException, ResourceNotFoundException

router = APIRouter(prefix="/api/v1/workflow", tags=["End-to-End Workflow Engine"])

def get_current_user_id(authorization: str = Header(...), db: Session = Depends(get_db)) -> str:
    if not authorization.startswith("Bearer "):
        raise AuthenticationException("Invalid authorization header format.")
    token = authorization.split(" ")[1]
    auth_service = AuthService(db)
    payload = auth_service.decode_token(token)
    return payload.sub

@router.post("/execute", response_model=WorkflowRunResponse, status_code=status.HTTP_201_CREATED)
async def execute_full_workflow(
    request: WorkflowExecuteRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Execute complete 6-stage end-to-end Virtual Screening Pipeline."""
    service = WorkflowService(db)
    return await service.execute_full_workflow(
        name=request.name,
        protein_id=request.protein_id,
        user_id=user_id,
        target_query=request.target_query or "P00533",
        max_compounds=request.max_compounds or 30
    )

@router.get("/runs", response_model=List[WorkflowRunResponse])
def get_user_workflow_runs(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Retrieve history of workflow runs executed by user."""
    service = WorkflowService(db)
    return service.repo.get_runs_by_user(user_id)

@router.get("/runs/{run_id}", response_model=WorkflowRunResponse)
def get_workflow_run_details(
    run_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Retrieve stage-by-stage execution details for a workflow run."""
    service = WorkflowService(db)
    run = service.repo.get_run_by_id(run_id)
    if not run:
        raise ResourceNotFoundException("WorkflowRun", run_id)
    return run
