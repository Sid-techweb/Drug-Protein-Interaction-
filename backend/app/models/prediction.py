from datetime import datetime
from sqlalchemy import String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from typing import Optional, Dict, Any, List
from app.database.connection import Base

class ProteinEmbedding(Base):
    __tablename__ = "protein_embeddings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    protein_id: Mapped[str] = mapped_column(String, ForeignKey("proteins.id"), unique=True, nullable=False)
    dimension: Mapped[int] = mapped_column(Integer, default=1280, nullable=False)
    embedding_vector_json: Mapped[List[float]] = mapped_column(JSON, nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), default="ESM-2-3B", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    protein_id: Mapped[str] = mapped_column(String, ForeignKey("proteins.id"), nullable=False)
    drug_id: Mapped[str] = mapped_column(String, ForeignKey("drugs.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    interaction_probability: Mapped[float] = mapped_column(Float, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    binding_affinity_pkd: Mapped[float] = mapped_column(Float, nullable=False)
    prediction_status: Mapped[str] = mapped_column(String(50), nullable=False) # HIGH_AFFINITY_BINDER, MODERATE_BINDER, NON_BINDER
    inference_time_ms: Mapped[float] = mapped_column(Float, nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), default="v1.0.0", nullable=False)
    attention_weights_json: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    protein: Mapped["Protein"] = relationship("Protein")
    drug: Mapped["Drug"] = relationship("Drug")

class ModelMetadata(Base):
    __tablename__ = "model_metadata"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    version: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    model_name: Mapped[str] = mapped_column(String(255), nullable=False)
    checkpoint_path: Mapped[str] = mapped_column(String(255), nullable=False)
    training_loss: Mapped[float] = mapped_column(Float, nullable=False)
    validation_roc_auc: Mapped[float] = mapped_column(Float, nullable=False)
    accuracy: Mapped[float] = mapped_column(Float, nullable=False)
    f1_score: Mapped[float] = mapped_column(Float, nullable=False)
    precision_val: Mapped[float] = mapped_column(Float, nullable=False)
    recall_val: Mapped[float] = mapped_column(Float, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    trained_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
