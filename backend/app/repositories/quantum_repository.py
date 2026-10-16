from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.quantum import QuantumJob, OptimizationResult

class QuantumRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_job(self, job: QuantumJob) -> QuantumJob:
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def add_results(self, results: List[OptimizationResult]):
        for r in results:
            self.db.add(r)
        self.db.commit()

    def get_job_by_id(self, job_id: str) -> Optional[QuantumJob]:
        return self.db.query(QuantumJob).filter(QuantumJob.id == job_id).first()

    def get_jobs_by_user(self, user_id: str) -> List[QuantumJob]:
        return self.db.query(QuantumJob).filter(QuantumJob.user_id == user_id).order_by(QuantumJob.created_at.desc()).all()
