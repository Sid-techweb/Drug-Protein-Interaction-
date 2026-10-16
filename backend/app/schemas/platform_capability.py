from pydantic import BaseModel

class PlatformCapabilityResponse(BaseModel):
    id: str
    capability_key: str
    title: str
    subtitle: str
    description: str
    category: str
    icon_name: str
    badge_label: str
    display_order: int

    class Config:
        from_attributes = True
