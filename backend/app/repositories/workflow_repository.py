from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.workflow import WorkflowRun, WorkflowStageRecord

class WorkflowRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_run(self, run: WorkflowRun) -> WorkflowRun:
        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)
        return run

    def add_stage_record(self, stage: WorkflowStageRecord) -> WorkflowStageRecord:
        self.db.add(stage)
        self.db.commit()
        self.db.refresh(stage)
        return stage

    def create_stage_record(self, stage: WorkflowStageRecord) -> WorkflowStageRecord:
        return self.add_stage_record(stage)

    def update_run(self, run: WorkflowRun) -> WorkflowRun:
        self.db.commit()
        self.db.refresh(run)
        return run

    def update_run_status(
        self,
        run_id: str,
        status: str,
        current_stage: int,
        dataset_id: Optional[str] = None,
        quantum_job_id: Optional[str] = None,
        total_compounds: Optional[int] = None,
        selected_compounds: Optional[int] = None,
        execution_time_ms: Optional[float] = None
    ) -> Optional[WorkflowRun]:
        run = self.get_run_by_id(run_id)
        if run:
            run.status = status
            run.current_stage = current_stage
            if dataset_id: run.dataset_id = dataset_id
            if quantum_job_id: run.quantum_job_id = quantum_job_id
            if total_compounds is not None: run.total_compounds = total_compounds
            if selected_compounds is not None: run.selected_compounds = selected_compounds
            if execution_time_ms is not None: run.execution_time_ms = execution_time_ms
            self.db.commit()
            self.db.refresh(run)
        return run

    def get_run_by_id(self, run_id: str) -> Optional[WorkflowRun]:
        return self.db.query(WorkflowRun).filter(WorkflowRun.id == run_id).first()

    def get_runs_by_user(self, user_id: str) -> List[WorkflowRun]:
        return self.db.query(WorkflowRun).filter(WorkflowRun.user_id == user_id).order_by(WorkflowRun.created_at.desc()).all()
