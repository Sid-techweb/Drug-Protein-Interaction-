from sqlalchemy import String, Text, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column
import uuid
from typing import Dict, Any
from app.database.connection import Base

class TechStackItem(Base):
    __tablename__ = "tech_stack_items"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tech_key: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False) # Frontend, Backend, Machine Learning, Quantum, Visualization, Database
    version: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[Text] = mapped_column(Text, nullable=False)
    architecture_role: Mapped[Text] = mapped_column(Text, nullable=False)
    icon_name: Mapped[str] = mapped_column(String(100), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    modal_specs: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
