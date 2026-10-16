from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.capability_service import CapabilityService
from app.services.platform_service import PlatformService
from app.schemas.platform_capability import PlatformCapabilityResponse
from app.schemas.workflow_stage import WorkflowStageResponse
from app.schemas.tech_stack_item import TechStackItemResponse

router = APIRouter(prefix="/api/v1/platform", tags=["Platform Reference Data"])

@router.get("/capabilities", response_model=List[PlatformCapabilityResponse])
def get_capabilities(db: Session = Depends(get_db)):
    """Retrieve platform capabilities dynamically from PostgreSQL database."""
    service = CapabilityService(db)
    return service.get_capabilities()

@router.get("/workflow", response_model=List[WorkflowStageResponse])
def get_workflow_stages(db: Session = Depends(get_db)):
    """Retrieve 9-stage virtual drug screening pipeline sequence."""
    service = PlatformService(db)
    return service.get_workflow_stages()

@router.get("/tech-stack", response_model=List[TechStackItemResponse])
def get_tech_stack(db: Session = Depends(get_db)):
    """Retrieve system tech stack specs & detailed modal definitions."""
    service = PlatformService(db)
    return service.get_tech_stack_items()
