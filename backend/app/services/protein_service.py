import re
from typing import Dict, Tuple, Any
from sqlalchemy.orm import Session
from app.models.protein import Protein, ProteinMetadata
from app.repositories.protein_repository import ProteinRepository
from app.exceptions.base_exceptions import HelixQException
from app.constants.error_codes import ErrorCode

# Standard IUPAC Single-Letter Amino Acid Codes
VALID_AMINO_ACIDS = set("ACDEFGHIKLMNPQRSTVWY")

# Residue Classification Categories
HYDROPHOBIC_RESIDUES = set("AIFLMPWV")
POLAR_RESIDUES = set("NCQSTY")
BASIC_RESIDUES = set("RKH")
ACIDIC_RESIDUES = set("DE")

# Average Monoisotopic Amino Acid Masses (Daltons)
AA_MASSES: Dict[str, float] = {
    'A': 71.04, 'C': 103.01, 'D': 115.03, 'E': 129.04, 'F': 147.07,
    'G': 57.02, 'H': 137.06, 'I': 113.08, 'K': 128.09, 'L': 113.08,
    'M': 131.04, 'N': 114.04, 'P': 97.05, 'Q': 128.06, 'R': 156.10,
    'S': 87.03, 'T': 101.05, 'V': 99.07, 'W': 186.08, 'Y': 163.06
}

class ProteinService:
    def __init__(self, db: Session):
        self.repo = ProteinRepository(db)

    @staticmethod
    def clean_and_validate_sequence(raw_sequence: str) -> str:
        """
        Cleans FASTA headers/whitespace and validates against standard IUPAC amino acid codes.
        Raises HelixQException on invalid characters or length bounds.
        """
        if not raw_sequence or not raw_sequence.strip():
            raise HelixQException("Protein sequence cannot be empty.", ErrorCode.VALIDATION_ERROR, 400)

        lines = raw_sequence.strip().splitlines()
        sequence_lines = []
        for line in lines:
            line_str = line.strip()
            if line_str.startswith(">"):
                continue # Skip FASTA header
            sequence_lines.append(line_str.upper())

        cleaned_seq = "".join(sequence_lines)
        cleaned_seq = re.sub(r"\s+", "", cleaned_seq)

        if not cleaned_seq:
            raise HelixQException("No valid sequence characters found in input.", ErrorCode.VALIDATION_ERROR, 400)

        if len(cleaned_seq) < 10:
            raise HelixQException(f"Sequence length ({len(cleaned_seq)} AA) is too short. Minimum required is 10 amino acids.", ErrorCode.VALIDATION_ERROR, 400)

        if len(cleaned_seq) > 10000:
            raise HelixQException(f"Sequence length ({len(cleaned_seq)} AA) exceeds maximum threshold of 10,000 amino acids.", ErrorCode.VALIDATION_ERROR, 400)

        # Check for invalid amino acid characters
        invalid_chars = set(cleaned_seq) - VALID_AMINO_ACIDS
        if invalid_chars:
            chars_str = ", ".join(sorted(list(invalid_chars)))
            raise HelixQException(
                f"Invalid amino acid characters detected: [{chars_str}]. Only standard IUPAC codes (A,C,D,E,F,G,H,I,K,L,M,N,P,Q,R,S,T,V,W,Y) are supported.",
                ErrorCode.VALIDATION_ERROR,
                400
            )

        return cleaned_seq

    @staticmethod
    def calculate_physicochemical_properties(sequence: str) -> Dict[str, Any]:
        """Calculates Hydrophobic %, Polar %, Basic %, Acidic %, MW, and residue frequency dict."""
        length = len(sequence)
        counts: Dict[str, int] = {aa: 0 for aa in sorted(list(VALID_AMINO_ACIDS))}
        for aa in sequence:
            counts[aa] += 1

        hydrophobic_count = sum(counts[aa] for aa in HYDROPHOBIC_RESIDUES)
        polar_count = sum(counts[aa] for aa in POLAR_RESIDUES)
        basic_count = sum(counts[aa] for aa in BASIC_RESIDUES)
        acidic_count = sum(counts[aa] for aa in ACIDIC_RESIDUES)

        mw = sum(counts[aa] * AA_MASSES.get(aa, 110.0) for aa in sequence) + 18.015 # Add terminal H2O

        # Rough pI estimation based on basic (K,R,H) vs acidic (D,E) ratio
        pos = basic_count
        neg = acidic_count
        pi_est = round(7.0 + (pos - neg) * 0.15, 2)
        pi_est = max(3.0, min(12.0, pi_est))

        return {
            "hydrophobic_pct": round((hydrophobic_count / length) * 100, 2),
            "polar_pct": round((polar_count / length) * 100, 2),
            "basic_pct": round((basic_count / length) * 100, 2),
            "acidic_pct": round((acidic_count / length) * 100, 2),
            "molecular_weight": round(mw, 2),
            "isoelectric_point": pi_est,
            "composition_json": counts
        }

    def create_pasted_protein(self, name: str, raw_sequence: str, user_id: str, organism: str = "Homo sapiens") -> Protein:
        seq = self.clean_and_validate_sequence(raw_sequence)

        # Check duplicate
        existing = self.repo.get_by_sequence_hash(seq, user_id)
        if existing:
            return existing

        props = self.calculate_physicochemical_properties(seq)

        protein = Protein(
            name=name,
            organism=organism,
            sequence=seq,
            length=len(seq),
            source_type="PASTE",
            user_id=user_id
        )

        metadata = ProteinMetadata(
            hydrophobic_pct=props["hydrophobic_pct"],
            polar_pct=props["polar_pct"],
            basic_pct=props["basic_pct"],
            acidic_pct=props["acidic_pct"],
            molecular_weight=props["molecular_weight"],
            isoelectric_point=props["isoelectric_point"],
            composition_json=props["composition_json"]
        )

        return self.repo.create_protein_with_metadata(protein, metadata)

    def create_fasta_protein(self, filename: str, fasta_content: str, user_id: str) -> Protein:
        # Extract title from FASTA header if present
        lines = fasta_content.strip().splitlines()
        name = filename
        if lines and lines[0].startswith(">"):
            name = lines[0][1:].strip()

        seq = self.clean_and_validate_sequence(fasta_content)
        existing = self.repo.get_by_sequence_hash(seq, user_id)
        if existing:
            return existing

        props = self.calculate_physicochemical_properties(seq)

        protein = Protein(
            name=name,
            organism="Homo sapiens",
            sequence=seq,
            length=len(seq),
            source_type="FASTA",
            user_id=user_id
        )

        metadata = ProteinMetadata(
            hydrophobic_pct=props["hydrophobic_pct"],
            polar_pct=props["polar_pct"],
            basic_pct=props["basic_pct"],
            acidic_pct=props["acidic_pct"],
            molecular_weight=props["molecular_weight"],
            isoelectric_point=props["isoelectric_point"],
            composition_json=props["composition_json"]
        )

        return self.repo.create_protein_with_metadata(protein, metadata)
