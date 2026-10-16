from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.system_metric import SystemMetric

class MetricRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[SystemMetric]:
        return self.db.query(SystemMetric).order_by(SystemMetric.category, SystemMetric.label).all()

    def get_by_key(self, metric_key: str) -> Optional[SystemMetric]:
        return self.db.query(SystemMetric).filter(SystemMetric.metric_key == metric_key).first()
