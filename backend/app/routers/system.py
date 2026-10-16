from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.metric_service import MetricService
from app.schemas.system_metric import SystemMetricResponse

router = APIRouter(prefix="/api/v1/system", tags=["System Telemetry"])

@router.get("/metrics", response_model=List[SystemMetricResponse])
def get_system_metrics(db: Session = Depends(get_db)):
    """Retrieve dynamic system telemetry metrics from PostgreSQL backend."""
    service = MetricService(db)
    return service.get_system_metrics()
