from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.prediction import ModelMetadata

class ModelRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_active_model(self) -> Optional[ModelMetadata]:
        return self.db.query(ModelMetadata).filter(ModelMetadata.is_active == True).order_by(ModelMetadata.trained_at.desc()).first()

    def get_by_version(self, version: str) -> Optional[ModelMetadata]:
        return self.db.query(ModelMetadata).filter(ModelMetadata.version == version).first()

    def create_model_metadata(self, metadata: ModelMetadata) -> ModelMetadata:
        # Set previous models to inactive
        self.db.query(ModelMetadata).update({ModelMetadata.is_active: False})
        self.db.add(metadata)
        self.db.commit()
        self.db.refresh(metadata)
        return metadata

    def get_all_models(self) -> List[ModelMetadata]:
        return self.db.query(ModelMetadata).order_by(ModelMetadata.trained_at.desc()).all()
