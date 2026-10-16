from datetime import datetime
from sqlalchemy import String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from typing import Optional, Dict, Any, List
from app.database.connection import Base

class QuantumJob(Base):
    __tablename__ = "quantum_jobs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    protein_id: Mapped[str] = mapped_column(String, ForeignKey("proteins.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="COMPLETED", nullable=False) # SUBMITTED, BUILDING_QUBO, SOLVING, COMPLETED, FAILED
    solver_type: Mapped[str] = mapped_column(String(50), default="SIMULATED_ANNEALING", nullable=False)
    num_candidates: Mapped[int] = mapped_column(Integer, nullable=False)
    selected_count: Mapped[int] = mapped_column(Integer, nullable=False)
    qubo_energy: Mapped[float] = mapped_column(Float, nullable=False)
    runtime_ms: Mapped[float] = mapped_column(Float, nullable=False)
    weights_json: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    results: Mapped[List["OptimizationResult"]] = relationship("OptimizationResult", back_populates="job", cascade="all, delete-orphan")

class OptimizationResult(Base):
    __tablename__ = "optimization_results"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id: Mapped[str] = mapped_column(String, ForeignKey("quantum_jobs.id"), nullable=False)
    drug_id: Mapped[str] = mapped_column(String, ForeignKey("drugs.id"), nullable=False)
    initial_ai_rank: Mapped[int] = mapped_column(Integer, nullable=False)
    optimized_rank: Mapped[int] = mapped_column(Integer, nullable=False)
    ai_score: Mapped[float] = mapped_column(Float, nullable=False)
    quantum_score: Mapped[float] = mapped_column(Float, nullable=False)
    rank_delta: Mapped[int] = mapped_column(Integer, nullable=False)
    is_selected: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    job: Mapped["QuantumJob"] = relationship("QuantumJob", back_populates="results")
    drug: Mapped["Drug"] = relationship("Drug")
