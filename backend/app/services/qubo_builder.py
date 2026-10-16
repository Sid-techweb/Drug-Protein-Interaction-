import math
from typing import List, Dict, Any, Tuple
from app.models.prediction import PredictionRecord

class QuboBuilder:
    """
    Multi-Objective QUBO (Quadratic Unconstrained Binary Optimization) Builder.
    Formulates candidate selection: H(x) = - sum(alpha_i * x_i) + lambda * sum(Sim(i,j) * x_i * x_j)
    """

    @staticmethod
    def calculate_tanimoto_similarity(fp1: str, fp2: str) -> float:
        """Calculates Tanimoto similarity coefficient between two Morgan Fingerprint bitstrings."""
        if not fp1 or not fp2 or len(fp1) != len(fp2):
            return 0.2

        intersection = sum(1 for a, b in zip(fp1, fp2) if a == '1' and b == '1')
        union = sum(1 for a, b in zip(fp1, fp2) if a == '1' or b == '1')

        return round(intersection / max(1, union), 4)

    def build_qubo_matrices(
        self,
        predictions: List[PredictionRecord],
        w_prob: float = 1.0,
        w_aff: float = 1.0,
        w_lip: float = 0.5,
        w_div: float = 0.8
    ) -> Tuple[Dict[int, float], Dict[Tuple[int, int], float]]:
        """
        Builds linear weights dict {i: linear_val} and quadratic matrix {(i, j): similarity_penalty}.
        """
        N = len(predictions)
        linear: Dict[int, float] = {}
        quadratic: Dict[Tuple[int, int], float] = {}

        # 1. Linear Diagonal Weights
        for i, pred in enumerate(predictions):
            drug = pred.drug
            mw = drug.molecular_weight if drug else 400.0
            logp = drug.logp if drug else 2.5
            lipinski_val = 1.0 if (mw <= 500.0 and logp <= 5.0) else 0.2

            score = (
                w_prob * pred.interaction_probability +
                w_aff * (pred.binding_affinity_pkd / 10.0) +
                w_lip * lipinski_val
            )
            linear[i] = -round(score, 4)

        # 2. Quadratic Off-Diagonal Penalty Terms (Chemical Diversity)
        for i in range(N):
            fp_i = predictions[i].drug.fingerprint_rel.morgan_fp_bitstring if (predictions[i].drug and predictions[i].drug.fingerprint_rel) else ""
            for j in range(i + 1, N):
                fp_j = predictions[j].drug.fingerprint_rel.morgan_fp_bitstring if (predictions[j].drug and predictions[j].drug.fingerprint_rel) else ""
                sim = self.calculate_tanimoto_similarity(fp_i, fp_j)
                quadratic[(i, j)] = round(w_div * sim, 4)

        return linear, quadratic
