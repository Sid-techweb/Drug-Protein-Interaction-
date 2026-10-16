from typing import List
from sqlalchemy.orm import Session
from app.repositories.capability_repository import CapabilityRepository
from app.schemas.platform_capability import PlatformCapabilityResponse

class CapabilityService:
    def __init__(self, db: Session):
        self.repo = CapabilityRepository(db)

    def get_capabilities(self) -> List[PlatformCapabilityResponse]:
        capabilities = self.repo.get_all()
        return [PlatformCapabilityResponse.from_orm(c) for c in capabilities]
