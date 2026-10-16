from fastapi import APIRouter, Depends, Header, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.auth_service import AuthService
from app.repositories.user_repository import UserRepository
from app.models.user import User
from app.schemas.auth import Token, RefreshTokenRequest, TokenPayload, UserResponse
from app.exceptions.base_exceptions import AuthenticationException, HelixQException
from app.constants.error_codes import ErrorCode

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication & Security"])

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    full_name: str = Field(..., min_length=2)
    organization: str = Field(default="Pharma R&D Partner")
    role: str = Field(default="RESEARCHER")

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(request: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new biomedical researcher user account."""
    user_repo = UserRepository(db)
    if user_repo.get_by_email(request.email):
        raise HelixQException("Account with this email already exists.", ErrorCode.BAD_REQUEST, 400)

    auth_service = AuthService(db)
    hashed_pwd = auth_service.get_password_hash(request.password)

    user = User(
        email=request.email,
        hashed_password=hashed_pwd,
        full_name=request.full_name,
        organization=request.organization,
        role=request.role
    )
    created_user = user_repo.create(user)

    access_token = auth_service.create_access_token(created_user)
    refresh_token = auth_service.create_refresh_token(created_user)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=1800
    )

@router.post("/login", response_model=Token)
def login_user(request: UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email and password."""
    user_repo = UserRepository(db)
    user = user_repo.get_by_email(request.email)
    
    auth_service = AuthService(db)
    if not user or not auth_service.verify_password(request.password, user.hashed_password):
        raise AuthenticationException("Invalid email or password credentials.")

    if not user.is_active:
        raise AuthenticationException("Account is deactivated.")

    access_token = auth_service.create_access_token(user)
    refresh_token = auth_service.create_refresh_token(user)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=1800
    )

@router.post("/logout")
def logout_user():
    """Client-side token invalidation & session termination endpoint."""
    return {"message": "Successfully logged out session."}

@router.post("/refresh", response_model=Token)
def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh Access Token using valid Refresh Token."""
    auth_service = AuthService(db)
    return auth_service.refresh_access_token(request.refresh_token)

@router.get("/me", response_model=UserResponse)
def get_current_user(
    authorization: str = Header(..., description="Bearer JWT Access Token"),
    db: Session = Depends(get_db)
):
    """Retrieve details of currently authenticated user."""
    if not authorization.startswith("Bearer "):
        raise AuthenticationException("Invalid authorization header format.")
    
    token = authorization.split(" ")[1]
    auth_service = AuthService(db)
    payload = auth_service.decode_token(token)

    user_repo = UserRepository(db)
    user = user_repo.get_by_id(payload.sub)
    if not user:
        raise AuthenticationException("Authenticated user no longer exists.")

    return user
