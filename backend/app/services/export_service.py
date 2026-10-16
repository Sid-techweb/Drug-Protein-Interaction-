import json
import csv
import io
from sqlalchemy.orm import Session
from app.repositories.report_repository import ReportRepository
from app.exceptions.base_exceptions import ResourceNotFoundException

class ExportService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ReportRepository(db)

    def export_pdf(self, report_id: str) -> str:
        """Generates executive PDF/Markdown formatted scientific report document."""
        report = self.repo.get_report_by_id(report_id)
        if not report:
            raise ResourceNotFoundException("ScientificReport", report_id)

        data = report.report_data_json
        protein = data.get("protein", {})
        candidates = data.get("top_candidates", [])

        md = f"""# HELIXQ SCIENTIFIC VIRTUAL SCREENING REPORT
=====================================================
Report Title: {report.title}
Report ID: {report.id}
Generated Timestamp: {report.created_at.isoformat()}

## 1. TARGET PROTEIN METADATA
- Target Name: {protein.get('name')}
- UniProt Accession: {protein.get('accession_id', 'N/A')}
- Organism: {protein.get('organism')}
- Sequence Length: {protein.get('length')} AA
- Molecular Weight: {protein.get('mw')} Da

## 2. SCIENTIFIC SUMMARY
{report.summary_text}

## 3. TOP RANKED OPTIMIZED DRUG CANDIDATES
"""
        for c in candidates:
            md += f"\nRank #{c.get('rank')}: {c.get('name')} ({c.get('drug_id')})\n"
            md += f"  - Canonical SMILES: {c.get('smiles')}\n"
            md += f"  - Interaction Probability: {round(c.get('interaction_probability', 0) * 100, 1)}%\n"
            md += f"  - Binding Affinity pKd: {c.get('binding_affinity_pkd')}\n"
            md += f"  - Prediction Status: {c.get('prediction_status')}\n"

        return md

    def export_csv(self, report_id: str) -> str:
        """Generates CSV spreadsheet of top candidate drug predictions."""
        report = self.repo.get_report_by_id(report_id)
        if not report:
            raise ResourceNotFoundException("ScientificReport", report_id)

        data = report.report_data_json
        candidates = data.get("top_candidates", [])

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Rank", "Drug Name", "Drug ID", "SMILES", "MW (Da)", "Interaction Probability", "pKd Affinity", "Status"])

        for c in candidates:
            writer.writerow([
                c.get("rank"),
                c.get("name"),
                c.get("drug_id"),
                c.get("smiles"),
                c.get("molecular_weight"),
                c.get("interaction_probability"),
                c.get("binding_affinity_pkd"),
                c.get("prediction_status")
            ])

        return output.getvalue()

    def export_dataset_csv(self, dataset_id: str, user_id: str) -> str:
        """Generates CSV spreadsheet of all compounds belonging to a specific dataset."""
        from app.repositories.drug_repository import DrugRepository
        from app.services.chembl_service import ChemblService

        drug_repo = DrugRepository(self.db)
        drugs = drug_repo.search_drugs(user_id=user_id, dataset_id=dataset_id, limit=5000)

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Drug Name", "ChEMBL ID", "Molecular Weight (Da)", "LogP", "H-Bond Donors", "H-Bond Acceptors", "Lipinski Status", "SMILES", "Formula"])

        for d in drugs:
            chembl = d.chembl_id or (d.id if d.id.startswith("CHEMBL") else "N/A")
            name = ChemblService.resolve_drug_name(d.chembl_id, d.name)
            is_lipinski = (d.molecular_weight <= 500.0 and d.logp <= 5.0 and d.hbd <= 5 and d.hba <= 10)
            lipinski_str = "Pass" if is_lipinski else "Review"

            writer.writerow([
                name,
                chembl,
                d.molecular_weight,
                d.logp,
                d.hbd,
                d.hba,
                lipinski_str,
                d.smiles,
                d.formula
            ])

        return output.getvalue()

    def export_json(self, report_id: str) -> str:
        """Generates structured JSON payload for machine readability."""
        report = self.repo.get_report_by_id(report_id)
        if not report:
            raise ResourceNotFoundException("ScientificReport", report_id)

        payload = {
            "report_id": report.id,
            "title": report.title,
            "created_at": report.created_at.isoformat(),
            "summary": report.summary_text,
            "data": report.report_data_json
        }
        return json.dumps(payload, indent=2)
