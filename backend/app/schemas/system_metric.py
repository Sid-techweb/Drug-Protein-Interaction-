from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SystemMetricResponse(BaseModel):
    id: str
    metric_key: str
    label: str
    value_display: str
    numeric_value: Optional[float] = None
    unit: Optional[str] = None
    category: str
    status: str
    updated_at: datetime

    class Config:
        from_attributes = True
