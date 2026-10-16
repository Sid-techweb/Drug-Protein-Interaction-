from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.report import ScientificReport

class ReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_report(self, report: ScientificReport) -> ScientificReport:
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def get_report_by_id(self, report_id: str) -> Optional[ScientificReport]:
        return self.db.query(ScientificReport).filter(ScientificReport.id == report_id).first()

    def get_reports_by_user(self, user_id: str) -> List[ScientificReport]:
        return self.db.query(ScientificReport).filter(ScientificReport.user_id == user_id).order_by(ScientificReport.created_at.desc()).all()
