from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.protein import Protein, ProteinMetadata

class ProteinRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, protein_id: str) -> Optional[Protein]:
        return self.db.query(Protein).filter(Protein.id == protein_id).first()

    def get_by_user_id(self, user_id: str) -> List[Protein]:
        return self.db.query(Protein).filter(Protein.user_id == user_id).order_by(Protein.created_at.desc()).all()

    def get_by_accession(self, accession_id: str, user_id: str) -> Optional[Protein]:
        return self.db.query(Protein).filter(
            Protein.accession_id == accession_id,
            Protein.user_id == user_id
        ).first()

    def get_by_sequence_hash(self, sequence: str, user_id: str) -> Optional[Protein]:
        return self.db.query(Protein).filter(
            Protein.sequence == sequence,
            Protein.user_id == user_id
        ).first()

    def create_protein_with_metadata(self, protein: Protein, metadata: ProteinMetadata) -> Protein:
        self.db.add(protein)
        self.db.flush()
        metadata.protein_id = protein.id
        self.db.add(metadata)
        self.db.commit()
        self.db.refresh(protein)
        return protein
