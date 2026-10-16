from datetime import datetime
from sqlalchemy import String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from typing import Optional, Dict, Any, List
from app.database.connection import Base

class ScientificReport(Base):
    __tablename__ = "scientific_reports"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    workflow_run_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("workflow_runs.id"), nullable=True)
    protein_id: Mapped[str] = mapped_column(String, ForeignKey("proteins.id"), nullable=False)
    summary_text: Mapped[str] = mapped_column(Text, nullable=False)
    report_data_json: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    protein: Mapped["Protein"] = relationship("Protein")
    workflow_run: Mapped[Optional["WorkflowRun"]] = relationship("WorkflowRun")
