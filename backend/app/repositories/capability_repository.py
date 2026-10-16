from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.platform_capability import PlatformCapability

class CapabilityRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[PlatformCapability]:
        return self.db.query(PlatformCapability).order_by(PlatformCapability.display_order.asc()).all()

    def get_by_key(self, capability_key: str) -> Optional[PlatformCapability]:
        return self.db.query(PlatformCapability).filter(PlatformCapability.capability_key == capability_key).first()
