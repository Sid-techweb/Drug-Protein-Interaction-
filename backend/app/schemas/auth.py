from pydantic import BaseModel, EmailStr
from typing import Optional

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenPayload(BaseModel):
    sub: str
    email: str
    role: str
    exp: int

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    organization: Optional[str] = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class RefreshTokenRequest(BaseModel):
    refresh_token: str
