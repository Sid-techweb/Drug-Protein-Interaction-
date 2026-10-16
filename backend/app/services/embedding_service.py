from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.models.protein import EmbeddingJob
from app.repositories.embedding_repository import EmbeddingRepository
from app.exceptions.base_exceptions import ResourceNotFoundException

class EmbeddingService:
    """
    Service layer managing ESM-2 Transformer embedding job queue and status transitions.
    (Sprint 2 architecture stage: creates job and tracks status transitions).
    """
    def __init__(self, db: Session):
        self.db = db
        self.repo = EmbeddingRepository(db)

    def queue_embedding_job(self, protein_id: str, model_name: str = "ESM-2-3B") -> EmbeddingJob:
        # Check existing job
        existing = self.repo.get_latest_by_protein(protein_id)
        if existing and existing.status in ["PENDING", "PROCESSING", "COMPLETED"]:
            return existing

        job = EmbeddingJob(
            protein_id=protein_id,
            status="PENDING",
            model_name=model_name
        )
        created_job = self.repo.create_job(job)

        # Transition status to COMPLETED for architecture validation
        self.repo.update_status(created_job.id, "PROCESSING")
        self.repo.update_status(created_job.id, "COMPLETED")

        return created_job

    def get_job_status(self, job_id: str) -> EmbeddingJob:
        job = self.repo.get_by_id(job_id)
        if not job:
            raise ResourceNotFoundException("EmbeddingJob", job_id)
        return job

    def get_latest_job_for_protein(self, protein_id: str) -> Optional[EmbeddingJob]:
        return self.repo.get_latest_by_protein(protein_id)
