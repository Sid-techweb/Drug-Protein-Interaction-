from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.drug import CandidateQueue
from app.repositories.candidate_repository import CandidateRepository

class CandidateService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CandidateRepository(db)

    def add_candidates_to_queue(self, drug_ids: List[str], user_id: str, protein_id: Optional[str] = None) -> List[CandidateQueue]:
        results = []
        for d_id in drug_ids:
            item = self.repo.add_to_queue(d_id, user_id, protein_id)
            results.append(item)
        return results

    def get_user_candidates(self, user_id: str) -> List[CandidateQueue]:
        return self.repo.get_by_user(user_id)

    def remove_candidate(self, candidate_id: str, user_id: str) -> bool:
        return self.repo.remove_from_queue(candidate_id, user_id)
