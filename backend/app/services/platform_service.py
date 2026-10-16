from typing import List
from sqlalchemy.orm import Session
from app.repositories.platform_repository import PlatformRepository
from app.schemas.workflow_stage import WorkflowStageResponse
from app.schemas.tech_stack_item import TechStackItemResponse

class PlatformService:
    def __init__(self, db: Session):
        self.repo = PlatformRepository(db)

    def get_workflow_stages(self) -> List[WorkflowStageResponse]:
        stages = self.repo.get_workflow_stages()
        return [WorkflowStageResponse.from_orm(s) for s in stages]

    def get_tech_stack_items(self) -> List[TechStackItemResponse]:
        items = self.repo.get_tech_stack_items()
        return [TechStackItemResponse.from_orm(item) for item in items]
