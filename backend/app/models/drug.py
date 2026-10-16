from datetime import datetime
from sqlalchemy import String, Text, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from typing import Optional, Dict, Any, List
from app.database.connection import Base

class DrugDataset(Base):
    __tablename__ = "drug_datasets"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False) # CHEMBL, CSV, SDF
    total_compounds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="DOWNLOADING", nullable=False) # DOWNLOADING, PARSING, RDKIT_PROCESSING, FINGERPRINTING, DESCRIPTORS, GRAPH_BUILDING, COMPLETED, FAILED
    storage_size_bytes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    drugs: Mapped[List["Drug"]] = relationship("Drug", back_populates="dataset", cascade="all, delete-orphan")

class Drug(Base):
    __tablename__ = "drugs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    chembl_id: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    smiles: Mapped[Text] = mapped_column(Text, index=True, nullable=False)
    formula: Mapped[str] = mapped_column(String(100), nullable=False)
    molecular_weight: Mapped[float] = mapped_column(Float, nullable=False)
    logp: Mapped[float] = mapped_column(Float, nullable=False)
    hbd: Mapped[int] = mapped_column(Integer, default=0, nullable=False) # H-Bond Donors
    hba: Mapped[int] = mapped_column(Integer, default=0, nullable=False) # H-Bond Acceptors
    tpsa: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    rotatable_bonds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    dataset_id: Mapped[str] = mapped_column(String, ForeignKey("drug_datasets.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    dataset: Mapped["DrugDataset"] = relationship("DrugDataset", back_populates="drugs")
    property_rel: Mapped["DrugProperty"] = relationship("DrugProperty", back_populates="drug", uselist=False, cascade="all, delete-orphan")
    fingerprint_rel: Mapped["DrugFingerprint"] = relationship("DrugFingerprint", back_populates="drug", uselist=False, cascade="all, delete-orphan")
    targets: Mapped[List["DrugTarget"]] = relationship("DrugTarget", back_populates="drug", cascade="all, delete-orphan")
    candidates: Mapped[List["CandidateQueue"]] = relationship("CandidateQueue", back_populates="drug", cascade="all, delete-orphan")

class DrugProperty(Base):
    __tablename__ = "drug_properties"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    drug_id: Mapped[str] = mapped_column(String, ForeignKey("drugs.id"), unique=True, nullable=False)
    heavy_atom_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    ring_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    fraction_csp3: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    molar_refractivity: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    descriptors_json: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    atom_graph_json: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)

    drug: Mapped["Drug"] = relationship("Drug", back_populates="property_rel")

class DrugFingerprint(Base):
    __tablename__ = "drug_fingerprints"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    drug_id: Mapped[str] = mapped_column(String, ForeignKey("drugs.id"), unique=True, nullable=False)
    morgan_fp_bitstring: Mapped[Text] = mapped_column(Text, nullable=False) # 2048-bit Morgan Fingerprint
    maccs_fp_bitstring: Mapped[Text] = mapped_column(Text, nullable=False)  # 166-bit MACCS Keys

    drug: Mapped["Drug"] = relationship("Drug", back_populates="fingerprint_rel")

class DrugTarget(Base):
    __tablename__ = "drug_targets"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    drug_id: Mapped[str] = mapped_column(String, ForeignKey("drugs.id"), nullable=False)
    target_name: Mapped[str] = mapped_column(String(255), nullable=False)
    uniprot_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    chembl_target_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    activity_type: Mapped[str] = mapped_column(String(50), default="IC50", nullable=False) # IC50, Ki, EC50
    activity_value: Mapped[float] = mapped_column(Float, nullable=False)
    activity_units: Mapped[str] = mapped_column(String(20), default="nM", nullable=False)

    drug: Mapped["Drug"] = relationship("Drug", back_populates="targets")

class CandidateQueue(Base):
    __tablename__ = "candidate_queue"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    drug_id: Mapped[str] = mapped_column(String, ForeignKey("drugs.id"), nullable=False)
    protein_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("proteins.id"), nullable=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="READY_FOR_PREDICTION", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    drug: Mapped["Drug"] = relationship("Drug", back_populates="candidates")
