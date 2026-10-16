from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ModelMetadataResponse(BaseModel):
    id: str
    version: str
    model_name: str
    checkpoint_path: str
    training_loss: float
    validation_roc_auc: float
    accuracy: float
    f1_score: float
    precision_val: float
    recall_val: float
    is_active: bool
    trained_at: datetime

    class Config:
        from_attributes = True

class ModelTrainRequest(BaseModel):
    epochs: Optional[int] = 5
    batch_size: Optional[int] = 16
    learning_rate: Optional[float] = 0.001
