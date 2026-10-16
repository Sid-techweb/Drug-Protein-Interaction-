from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.configs.app_config import settings
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.exceptions.base_exceptions import AuthenticationException
from app.schemas.auth import Token, TokenPayload

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    def create_access_token(self, user: User) -> str:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode = {
            "sub": user.id,
            "email": user.email,
            "role": user.role,
            "exp": int(expire.timestamp())
        }
        return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    def create_refresh_token(self, user: User) -> str:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode = {
            "sub": user.id,
            "type": "refresh",
            "exp": int(expire.timestamp())
        }
        return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    def decode_token(self, token: str) -> TokenPayload:
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            return TokenPayload(
                sub=payload["sub"],
                email=payload.get("email", ""),
                role=payload.get("role", "RESEARCHER"),
                exp=payload["exp"]
            )
        except JWTError:
            raise AuthenticationException("Invalid or expired authentication token")

    def refresh_access_token(self, refresh_token: str) -> Token:
        try:
            payload = jwt.decode(refresh_token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            if payload.get("type") != "refresh":
                raise AuthenticationException("Invalid token type")
            user_id = payload.get("sub")
            user = self.user_repo.get_by_id(user_id)
            if not user or not user.is_active:
                raise AuthenticationException("User account is inactive or deleted.")

            access_token = self.create_access_token(user)
            new_refresh_token = self.create_refresh_token(user)

            return Token(
                access_token=access_token,
                refresh_token=new_refresh_token,
                expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
            )
        except JWTError:
            raise AuthenticationException("Invalid or expired refresh token")
