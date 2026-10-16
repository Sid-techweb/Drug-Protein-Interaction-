from sqlalchemy import String, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column
import uuid
from app.database.connection import Base

class WorkflowStage(Base):
    __tablename__ = "workflow_stages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    stage_number: Mapped[int] = mapped_column(Integer, unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    subtitle: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Text] = mapped_column(Text, nullable=False)
    badge: Mapped[str] = mapped_column(String(100), nullable=False)
    tech_stack_tag: Mapped[str] = mapped_column(String(100), nullable=False)
    icon_name: Mapped[str] = mapped_column(String(100), nullable=False)
