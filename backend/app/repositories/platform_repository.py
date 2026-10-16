from typing import List
from sqlalchemy.orm import Session
from app.models.workflow_stage import WorkflowStage
from app.models.tech_stack_item import TechStackItem

class PlatformRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_workflow_stages(self) -> List[WorkflowStage]:
        return self.db.query(WorkflowStage).order_by(WorkflowStage.stage_number.asc()).all()

    def get_tech_stack_items(self) -> List[TechStackItem]:
        return self.db.query(TechStackItem).order_by(TechStackItem.display_order.asc()).all()
