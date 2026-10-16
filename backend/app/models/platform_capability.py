from sqlalchemy import String, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column
import uuid
from app.database.connection import Base

class PlatformCapability(Base):
    __tablename__ = "platform_capabilities"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    capability_key: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    subtitle: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Text] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False) # AI, QUANTUM, VISUALIZATION, EXPLAINABILITY, CLINICAL
    icon_name: Mapped[str] = mapped_column(String(100), nullable=False)
    badge_label: Mapped[str] = mapped_column(String(100), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
