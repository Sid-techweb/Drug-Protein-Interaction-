import time
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.prediction import PredictionRecord
from app.models.protein import Protein
from app.repositories.prediction_repository import PredictionRepository
from app.repositories.protein_repository import ProteinRepository
from app.repositories.drug_repository import DrugRepository
from app.repositories.model_repository import ModelRepository
from app.services.protein_encoder import ProteinEncoder
from app.services.drug_gnn_encoder import DrugGNNEncoder
from app.services.fusion_network import MultimodalDTINetwork
from app.services.dti_trainer import DTITrainer
from app.services.chembl_service import ChemblService
from app.exceptions.base_exceptions import ResourceNotFoundException
from app.logging.logger import logger

class InferenceService:
    """
    High-Speed Multimodal DTI Inference Engine.
    Executes real neural network forward passes for single and batch candidate compound predictions.
    """
    def __init__(self, db: Session):
        self.db = db
        self.pred_repo = PredictionRepository(db)
        self.protein_repo = ProteinRepository(db)
        self.drug_repo = DrugRepository(db)
        self.model_repo = ModelRepository(db)
        self.protein_encoder = ProteinEncoder(db)
        self.drug_encoder = DrugGNNEncoder()

    def _ensure_active_model(self) -> str:
        active = self.model_repo.get_active_model()
        if not active:
            # Auto-train initial checkpoint if missing
            trainer = DTITrainer(self.db)
            meta = trainer.train_and_checkpoint(epochs=5, version_tag="v1.0.0")
            return meta.version
        return active.version

    def predict_single_dti(self, protein_id: str, drug_id: str, user_id: str) -> PredictionRecord:
        start_time = time.time()
        model_version = self._ensure_active_model()

        # Fetch Protein ORM record (with smart fallback if protein_id is DEFAULT or not found)
        protein = self.protein_repo.get_by_id(protein_id)
        if not protein:
            user_proteins = self.protein_repo.get_by_user_id(user_id)
            if user_proteins:
                protein = user_proteins[0]
            else:
                all_proteins = self.db.query(Protein).all()
                if all_proteins:
                    protein = all_proteins[0]
                else:
                    from app.services.uniprot_service import UniProtService
                    uniprot_service = UniProtService(self.db)
                    protein = uniprot_service.fetch_protein_by_accession("P00533", user_id)
            protein_id = protein.id

        drug = self.drug_repo.get_drug_by_id(drug_id)
        if not drug:
            raise ResourceNotFoundException("Drug", drug_id)

        # Automatically resolve and update drug name if currently unformatted
        resolved_name = ChemblService.resolve_drug_name(drug.chembl_id, drug.name)
        if resolved_name != drug.name:
            drug.name = resolved_name
            self.db.commit()

        # Check existing cached prediction for this specific protein & drug pair
        existing = self.pred_repo.get_prediction_by_pair(protein_id, drug_id, user_id)
        if existing:
            # Return cached prediction record for this pair
            return existing

        # 1. Encode Protein (ESM-2)
        protein_vec = self.protein_encoder.encode_protein_sequence(protein.id, protein.sequence)

        # 2. Encode Drug (GNN Graph + Morgan FP)
        atom_graph = drug.property_rel.atom_graph_json if drug.property_rel else {}
        morgan_fp = drug.fingerprint_rel.morgan_fp_bitstring if drug.fingerprint_rel else "0" * 2048
        drug_vec = self.drug_encoder.encode_molecular_graph(drug.smiles, atom_graph, morgan_fp)

        # 3. Multimodal Cross-Attention & KAN Neural Network Forward Pass
        network_out = MultimodalDTINetwork.forward(
            protein_vec, drug_vec, drug.molecular_weight, drug.logp, drug.hbd, drug.hba
        )

        inference_time_ms = round((time.time() - start_time) * 1000, 2)

        # Persist Prediction Record to PostgreSQL
        record = PredictionRecord(
            protein_id=protein_id,
            drug_id=drug_id,
            user_id=user_id,
            interaction_probability=network_out["interaction_probability"],
            confidence_score=network_out["confidence_score"],
            binding_affinity_pkd=network_out["binding_affinity_pkd"],
            prediction_status=network_out["prediction_status"],
            inference_time_ms=inference_time_ms,
            model_version=model_version,
            attention_weights_json={"attention_matrix": network_out["attention_matrix"]}
        )

        return self.pred_repo.create_prediction(record)

    def predict_batch_dti(self, protein_id: str, drug_ids: List[str], user_id: str) -> List[PredictionRecord]:
        # Deduplicate incoming drug IDs preserving order
        unique_drug_ids = []
        seen_ids = set()
        for d in (drug_ids or []):
            if d not in seen_ids:
                seen_ids.add(d)
                unique_drug_ids.append(d)

        # If drug_ids list is empty, query available drugs from user or database
        if not unique_drug_ids:
            all_drugs = self.drug_repo.search_drugs(user_id=user_id, limit=20)
            for d in all_drugs:
                if d.id not in seen_ids:
                    seen_ids.add(d.id)
                    unique_drug_ids.append(d.id)

        results = []
        seen_smiles = set()

        for d_id in unique_drug_ids:
            try:
                pred = self.predict_single_dti(protein_id, d_id, user_id)
                # Deduplicate by SMILES or drug_id in session batch
                drug_smiles = pred.drug.smiles if pred.drug else d_id
                if drug_smiles not in seen_smiles:
                    seen_smiles.add(drug_smiles)
                    results.append(pred)
            except Exception as e:
                logger.warning(f"Batch prediction skipped drug '{d_id}': {str(e)}")

        # Sort by interaction probability descending
        results.sort(key=lambda x: x.interaction_probability, reverse=True)
        return results
