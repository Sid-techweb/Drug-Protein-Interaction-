from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.prediction import ProteinEmbedding, PredictionRecord

class PredictionRepository:
    def __init__(self, db: Session):
        self.db = db

    # Protein Embeddings
    def get_embedding_by_protein(self, protein_id: str) -> Optional[ProteinEmbedding]:
        return self.db.query(ProteinEmbedding).filter(ProteinEmbedding.protein_id == protein_id).first()

    def create_protein_embedding(self, embedding: ProteinEmbedding) -> ProteinEmbedding:
        self.db.add(embedding)
        self.db.commit()
        self.db.refresh(embedding)
        return embedding

    # Predictions
    def create_prediction(self, prediction: PredictionRecord) -> PredictionRecord:
        self.db.add(prediction)
        self.db.commit()
        self.db.refresh(prediction)
        return prediction

    def get_prediction_by_id(self, prediction_id: str) -> Optional[PredictionRecord]:
        return self.db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()

    def get_predictions_by_user(self, user_id: str) -> List[PredictionRecord]:
        return self.db.query(PredictionRecord).filter(PredictionRecord.user_id == user_id).order_by(PredictionRecord.created_at.desc()).all()

    def get_predictions_by_protein(self, user_id: str, protein_id: str) -> List[PredictionRecord]:
        return self.db.query(PredictionRecord).filter(
            PredictionRecord.user_id == user_id,
            PredictionRecord.protein_id == protein_id
        ).order_by(PredictionRecord.created_at.desc()).all()

    def get_prediction_by_pair(self, protein_id: str, drug_id: str, user_id: str) -> Optional[PredictionRecord]:
        return self.db.query(PredictionRecord).filter(
            PredictionRecord.protein_id == protein_id,
            PredictionRecord.drug_id == drug_id,
            PredictionRecord.user_id == user_id
        ).first()
