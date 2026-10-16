from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.drug import DrugDataset, Drug, DrugProperty, DrugFingerprint, DrugTarget

class DrugRepository:
    def __init__(self, db: Session):
        self.db = db

    # Datasets
    def create_dataset(self, dataset: DrugDataset) -> DrugDataset:
        self.db.add(dataset)
        self.db.commit()
        self.db.refresh(dataset)
        return dataset

    def get_dataset_by_id(self, dataset_id: str) -> Optional[DrugDataset]:
        return self.db.query(DrugDataset).filter(DrugDataset.id == dataset_id).first()

    def get_datasets_by_user(self, user_id: str) -> List[DrugDataset]:
        return self.db.query(DrugDataset).filter(DrugDataset.user_id == user_id).order_by(DrugDataset.created_at.desc()).all()

    def update_dataset_status(self, dataset_id: str, status: str, total_compounds: Optional[int] = None) -> Optional[DrugDataset]:
        ds = self.get_dataset_by_id(dataset_id)
        if ds:
            ds.status = status
            if total_compounds is not None:
                ds.total_compounds = total_compounds
                ds.storage_size_bytes = total_compounds * 4096 # Estimated 4KB per compound record
            self.db.commit()
            self.db.refresh(ds)
        return ds

    # Drugs
    def create_drug_record(self, drug: Drug, prop: DrugProperty, fp: DrugFingerprint, targets: List[DrugTarget]) -> Drug:
        self.db.add(drug)
        self.db.flush()
        prop.drug_id = drug.id
        fp.drug_id = drug.id
        self.db.add(prop)
        self.db.add(fp)

        for t in targets:
            t.drug_id = drug.id
            self.db.add(t)

        self.db.commit()
        self.db.refresh(drug)
        return drug

    def get_drug_by_id(self, drug_id: str) -> Optional[Drug]:
        return self.db.query(Drug).filter(Drug.id == drug_id).first()

    def get_drugs_by_dataset(self, dataset_id: str) -> List[Drug]:
        return self.db.query(Drug).filter(Drug.dataset_id == dataset_id).all()

    def search_drugs(
        self,
        user_id: str,
        search_query: Optional[str] = None,
        dataset_id: Optional[str] = None,
        lipinski_only: bool = False,
        limit: int = 50,
        offset: int = 0
    ) -> List[Drug]:
        query = self.db.query(Drug).filter(Drug.user_id == user_id)

        if dataset_id:
            query = query.filter(Drug.dataset_id == dataset_id)

        if search_query:
            term = f"%{search_query.strip()}%"
            query = query.filter(
                (Drug.name.ilike(term)) | (Drug.chembl_id.ilike(term)) | (Drug.smiles.ilike(term))
            )

        if lipinski_only:
            query = query.filter(
                Drug.molecular_weight <= 500.0,
                Drug.logp <= 5.0,
                Drug.hbd <= 5,
                Drug.hba <= 10
            )

        return query.order_by(Drug.molecular_weight.asc()).offset(offset).limit(limit).all()

    def count_drugs(
        self,
        user_id: str,
        search_query: Optional[str] = None,
        dataset_id: Optional[str] = None,
        lipinski_only: bool = False
    ) -> int:
        query = self.db.query(func.count(Drug.id)).filter(Drug.user_id == user_id)

        if dataset_id:
            query = query.filter(Drug.dataset_id == dataset_id)

        if search_query:
            term = f"%{search_query.strip()}%"
            query = query.filter(
                (Drug.name.ilike(term)) | (Drug.chembl_id.ilike(term)) | (Drug.smiles.ilike(term))
            )

        if lipinski_only:
            query = query.filter(
                Drug.molecular_weight <= 500.0,
                Drug.logp <= 5.0,
                Drug.hbd <= 5,
                Drug.hba <= 10
            )

        return query.scalar() or 0

    def get_analytics(self, user_id: str) -> dict:
        total_compounds = self.db.query(func.count(Drug.id)).filter(Drug.user_id == user_id).scalar() or 0
        unique_targets = self.db.query(func.count(func.distinct(DrugTarget.chembl_target_id))).join(Drug).filter(Drug.user_id == user_id).scalar() or 0
        avg_mw = self.db.query(func.avg(Drug.molecular_weight)).filter(Drug.user_id == user_id).scalar() or 0.0
        avg_logp = self.db.query(func.avg(Drug.logp)).filter(Drug.user_id == user_id).scalar() or 0.0

        lipinski_pass = self.db.query(func.count(Drug.id)).filter(
            Drug.user_id == user_id,
            Drug.molecular_weight <= 500.0,
            Drug.logp <= 5.0,
            Drug.hbd <= 5,
            Drug.hba <= 10
        ).scalar() or 0

        pass_rate = round((lipinski_pass / total_compounds * 100), 2) if total_compounds > 0 else 0.0

        # Sources
        chembl_count = self.db.query(func.count(DrugDataset.id)).filter(DrugDataset.user_id == user_id, DrugDataset.source_type == "CHEMBL").scalar() or 0
        csv_count = self.db.query(func.count(DrugDataset.id)).filter(DrugDataset.user_id == user_id, DrugDataset.source_type == "CSV").scalar() or 0
        sdf_count = self.db.query(func.count(DrugDataset.id)).filter(DrugDataset.user_id == user_id, DrugDataset.source_type == "SDF").scalar() or 0

        return {
            "total_compounds": total_compounds,
            "unique_targets": max(1, unique_targets),
            "avg_molecular_weight": round(avg_mw, 2),
            "avg_logp": round(avg_logp, 2),
            "lipinski_pass_rate_pct": pass_rate,
            "source_breakdown": {
                "ChEMBL": chembl_count,
                "CSV": csv_count,
                "SDF": sdf_count
            }
        }
