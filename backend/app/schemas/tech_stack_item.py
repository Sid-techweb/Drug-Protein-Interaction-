from pydantic import BaseModel
from typing import Dict, Any

class TechStackItemResponse(BaseModel):
    id: str
    tech_key: str
    name: str
    category: str
    version: str
    description: str
    architecture_role: str
    icon_name: str
    display_order: int
    modal_specs: Dict[str, Any]

    class Config:
        from_attributes = True
