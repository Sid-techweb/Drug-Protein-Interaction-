from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.drug import CandidateQueue

class CandidateRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: str) -> List[CandidateQueue]:
        return self.db.query(CandidateQueue).filter(CandidateQueue.user_id == user_id).order_by(CandidateQueue.created_at.desc()).all()

    def add_to_queue(self, drug_id: str, user_id: str, protein_id: Optional[str] = None) -> CandidateQueue:
        existing = self.db.query(CandidateQueue).filter(
            CandidateQueue.drug_id == drug_id,
            CandidateQueue.user_id == user_id
        ).first()

        if existing:
            if protein_id:
                existing.protein_id = protein_id
                self.db.commit()
                self.db.refresh(existing)
            return existing

        candidate = CandidateQueue(
            drug_id=drug_id,
            protein_id=protein_id,
            user_id=user_id,
            status="READY_FOR_PREDICTION"
        )
        self.db.add(candidate)
        self.db.commit()
        self.db.refresh(candidate)
        return candidate

    def remove_from_queue(self, candidate_id: str, user_id: str) -> bool:
        item = self.db.query(CandidateQueue).filter(
            CandidateQueue.id == candidate_id,
            CandidateQueue.user_id == user_id
        ).first()
        if item:
            self.db.delete(item)
            self.db.commit()
            return True
        return False
