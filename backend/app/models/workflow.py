from datetime import datetime
from sqlalchemy import String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from typing import Optional, Dict, Any, List
from app.database.connection import Base

class WorkflowRun(Base):
    __tablename__ = "workflow_runs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    protein_id: Mapped[str] = mapped_column(String, ForeignKey("proteins.id"), nullable=False)
    dataset_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("drug_datasets.id"), nullable=True)
    quantum_job_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("quantum_jobs.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="SUBMITTED", nullable=False)
    current_stage: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    total_stages: Mapped[int] = mapped_column(Integer, default=6, nullable=False)
    total_compounds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    selected_compounds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    execution_time_ms: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    stages: Mapped[List["WorkflowStageRecord"]] = relationship("WorkflowStageRecord", back_populates="run", cascade="all, delete-orphan")
    protein: Mapped["Protein"] = relationship("Protein")
    dataset: Mapped[Optional["DrugDataset"]] = relationship("DrugDataset")

class WorkflowStageRecord(Base):
    __tablename__ = "workflow_stage_records"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id: Mapped[str] = mapped_column(String, ForeignKey("workflow_runs.id"), nullable=False)
    stage_number: Mapped[int] = mapped_column(Integer, nullable=False)
    stage_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="COMPLETED", nullable=False)
    details_json: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    duration_ms: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    run: Mapped["WorkflowRun"] = relationship("WorkflowRun", back_populates="stages")
