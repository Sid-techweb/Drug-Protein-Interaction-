from datetime import datetime
from sqlalchemy import String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from typing import Optional
from app.database.connection import Base

class ScientistValidation(Base):
    __tablename__ = "scientist_validations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    protein_id: Mapped[str] = mapped_column(String, ForeignKey("proteins.id"), nullable=False)
    drug_id: Mapped[str] = mapped_column(String, ForeignKey("drugs.id"), nullable=False)
    decision: Mapped[str] = mapped_column(String(50), nullable=False) # APPROVED, REJECTED, NEEDS_FURTHER_VALIDATION
    experimental_notes: Mapped[str] = mapped_column(Text, nullable=False)
    experimental_method: Mapped[str] = mapped_column(String(50), nullable=False) # IN_VITRO, IN_VIVO, LITERATURE, CLINICAL, OTHER
    confidence: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    scientist_name: Mapped[str] = mapped_column(String(255), nullable=False)
    institution: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    validated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    protein: Mapped["Protein"] = relationship("Protein")
    drug: Mapped["Drug"] = relationship("Drug")
