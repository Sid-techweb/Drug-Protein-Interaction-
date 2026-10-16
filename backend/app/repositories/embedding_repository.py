from typing import Optional, List
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.protein import EmbeddingJob

class EmbeddingRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, job_id: str) -> Optional[EmbeddingJob]:
        return self.db.query(EmbeddingJob).filter(EmbeddingJob.id == job_id).first()

    def get_latest_by_protein(self, protein_id: str) -> Optional[EmbeddingJob]:
        return self.db.query(EmbeddingJob).filter(EmbeddingJob.protein_id == protein_id).order_by(EmbeddingJob.created_at.desc()).first()

    def create_job(self, job: EmbeddingJob) -> EmbeddingJob:
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def update_status(self, job_id: str, status: str, error_message: Optional[str] = None) -> Optional[EmbeddingJob]:
        job = self.get_by_id(job_id)
        if job:
            job.status = status
            if error_message:
                job.error_message = error_message
            if status in ["COMPLETED", "FAILED"]:
                job.completed_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(job)
        return job
