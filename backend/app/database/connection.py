from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.configs.app_config import settings
from app.logging.logger import logger

class Base(DeclarativeBase):
    pass

# Attempt PostgreSQL engine initialization with automatic local SQLite fallback for standalone dev
try:
    logger.info(f"Initializing Primary PostgreSQL Database connection: {settings.DATABASE_URL}")
    test_engine = create_engine(
        settings.DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        echo=False
    )
    # Test connection
    with test_engine.connect() as conn:
        pass
    engine = test_engine
    logger.info("Successfully connected to primary PostgreSQL database engine.")
except Exception as e:
    logger.warning(f"PostgreSQL connection unavailable ({str(e)}). Activating local standalone SQLite database fallback.")
    engine = create_engine(
        "sqlite:///./helixq_local.db",
        connect_args={"check_same_thread": False},
        echo=False
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
