from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.protein import Protein
from app.models.drug import Drug, DrugDataset
from app.models.prediction import PredictionRecord, ModelMetadata
from app.models.quantum import QuantumJob
from app.models.workflow import WorkflowRun

class AnalyticsService:
    """
    Real-Time Aggregated Platform Analytics Engine.
    Executes live SQL queries directly against PostgreSQL tables.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_dashboard_analytics(self, user_id: str) -> dict:
        total_proteins = self.db.query(func.count(Protein.id)).filter(Protein.user_id == user_id).scalar() or 0
        total_drugs = self.db.query(func.count(Drug.id)).filter(Drug.user_id == user_id).scalar() or 0
        total_predictions = self.db.query(func.count(PredictionRecord.id)).filter(PredictionRecord.user_id == user_id).scalar() or 0
        total_quantum_jobs = self.db.query(func.count(QuantumJob.id)).filter(QuantumJob.user_id == user_id).scalar() or 0

        avg_prob = self.db.query(func.avg(PredictionRecord.interaction_probability)).filter(PredictionRecord.user_id == user_id).scalar() or 0.0
        avg_pkd = self.db.query(func.avg(PredictionRecord.binding_affinity_pkd)).filter(PredictionRecord.user_id == user_id).scalar() or 0.0
        avg_pred_latency = self.db.query(func.avg(PredictionRecord.inference_time_ms)).filter(PredictionRecord.user_id == user_id).scalar() or 0.0

        avg_quantum_runtime = self.db.query(func.avg(QuantumJob.runtime_ms)).filter(QuantumJob.user_id == user_id).scalar() or 0.0

        lipinski_pass = self.db.query(func.count(Drug.id)).filter(
            Drug.user_id == user_id,
            Drug.molecular_weight <= 500.0,
            Drug.logp <= 5.0,
            Drug.hbd <= 5,
            Drug.hba <= 10
        ).scalar() or 0
        lipinski_pass_pct = round((lipinski_pass / total_drugs * 100), 2) if total_drugs > 0 else 0.0

        # Dataset Sources
        chembl_cnt = self.db.query(func.count(DrugDataset.id)).filter(DrugDataset.user_id == user_id, DrugDataset.source_type == "CHEMBL").scalar() or 0
        csv_cnt = self.db.query(func.count(DrugDataset.id)).filter(DrugDataset.user_id == user_id, DrugDataset.source_type == "CSV").scalar() or 0
        sdf_cnt = self.db.query(func.count(DrugDataset.id)).filter(DrugDataset.user_id == user_id, DrugDataset.source_type == "SDF").scalar() or 0

        # Prediction Statuses
        high_binder = self.db.query(func.count(PredictionRecord.id)).filter(PredictionRecord.user_id == user_id, PredictionRecord.prediction_status == "HIGH_AFFINITY_BINDER").scalar() or 0
        mod_binder = self.db.query(func.count(PredictionRecord.id)).filter(PredictionRecord.user_id == user_id, PredictionRecord.prediction_status == "MODERATE_BINDER").scalar() or 0
        weak_binder = self.db.query(func.count(PredictionRecord.id)).filter(PredictionRecord.user_id == user_id, PredictionRecord.prediction_status == "WEAK_BINDER").scalar() or 0
        rejected = self.db.query(func.count(PredictionRecord.id)).filter(PredictionRecord.user_id == user_id, PredictionRecord.prediction_status == "REJECTED").scalar() or 0

        # Timeline History
        runs = self.db.query(WorkflowRun).filter(WorkflowRun.user_id == user_id).order_by(WorkflowRun.created_at.desc()).limit(10).all()
        timeline = [
            {
                "run_id": r.id,
                "name": r.name,
                "status": r.status,
                "total_compounds": r.total_compounds,
                "selected_compounds": r.selected_compounds,
                "execution_time_ms": r.execution_time_ms,
                "created_at": r.created_at.isoformat()
            }
            for r in runs
        ]

        return {
            "total_proteins": total_proteins,
            "total_drugs": total_drugs,
            "total_predictions": total_predictions,
            "total_quantum_jobs": total_quantum_jobs,
            "avg_interaction_probability": round(avg_prob, 4),
            "avg_binding_affinity_pkd": round(avg_pkd, 2),
            "avg_lipinski_pass_pct": lipinski_pass_pct,
            "avg_prediction_latency_ms": round(avg_pred_latency, 2),
            "avg_quantum_runtime_ms": round(avg_quantum_runtime, 2),
            "dataset_source_counts": {
                "ChEMBL": chembl_cnt,
                "CSV": csv_cnt,
                "SDF": sdf_cnt
            },
            "prediction_status_breakdown": {
                "HIGH_AFFINITY_BINDER": high_binder,
                "MODERATE_BINDER": mod_binder,
                "WEAK_BINDER": weak_binder,
                "REJECTED": rejected
            },
            "timeline_history": timeline
        }
