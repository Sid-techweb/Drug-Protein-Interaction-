from datetime import datetime
from sqlalchemy import String, Text, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from typing import Optional, Dict, Any
from app.database.connection import Base

class Protein(Base):
    __tablename__ = "proteins"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    accession_id: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    organism: Mapped[str] = mapped_column(String(255), default="Homo sapiens", nullable=False)
    gene_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    sequence: Mapped[Text] = mapped_column(Text, nullable=False)
    length: Mapped[int] = mapped_column(Integer, nullable=False)
    function_description: Mapped[Optional[Text]] = mapped_column(Text, nullable=True)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False) # PASTE, FASTA, UNIPROT
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    metadata_rel: Mapped["ProteinMetadata"] = relationship("ProteinMetadata", back_populates="protein", uselist=False, cascade="all, delete-orphan")
    embedding_jobs: Mapped[list["EmbeddingJob"]] = relationship("EmbeddingJob", back_populates="protein", cascade="all, delete-orphan")

class ProteinMetadata(Base):
    __tablename__ = "protein_metadata"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    protein_id: Mapped[str] = mapped_column(String, ForeignKey("proteins.id"), unique=True, nullable=False)
    hydrophobic_pct: Mapped[float] = mapped_column(Float, nullable=False)
    polar_pct: Mapped[float] = mapped_column(Float, nullable=False)
    basic_pct: Mapped[float] = mapped_column(Float, nullable=False)
    acidic_pct: Mapped[float] = mapped_column(Float, nullable=False)
    molecular_weight: Mapped[float] = mapped_column(Float, nullable=False) # in Daltons
    isoelectric_point: Mapped[float] = mapped_column(Float, nullable=False) # estimated pI
    composition_json: Mapped[Dict[str, int]] = mapped_column(JSON, nullable=False)

    protein: Mapped["Protein"] = relationship("Protein", back_populates="metadata_rel")

class EmbeddingJob(Base):
    __tablename__ = "embedding_jobs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    protein_id: Mapped[str] = mapped_column(String, ForeignKey("proteins.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False) # PENDING, PROCESSING, COMPLETED, FAILED
    model_name: Mapped[str] = mapped_column(String(100), default="ESM-2-3B", nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    protein: Mapped["Protein"] = relationship("Protein", back_populates="embedding_jobs")
