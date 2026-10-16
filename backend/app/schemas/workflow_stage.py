from pydantic import BaseModel

class WorkflowStageResponse(BaseModel):
    id: str
    stage_number: int
    title: str
    subtitle: str
    description: str
    badge: str
    tech_stack_tag: str
    icon_name: str

    class Config:
        from_attributes = True
