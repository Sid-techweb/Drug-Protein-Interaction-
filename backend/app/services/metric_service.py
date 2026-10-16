from typing import List
from sqlalchemy.orm import Session
from app.repositories.metric_repository import MetricRepository
from app.schemas.system_metric import SystemMetricResponse

class MetricService:
    def __init__(self, db: Session):
        self.repo = MetricRepository(db)

    def get_system_metrics(self) -> List[SystemMetricResponse]:
        metrics = self.repo.get_all()
        return [SystemMetricResponse.from_orm(m) for m in metrics]
