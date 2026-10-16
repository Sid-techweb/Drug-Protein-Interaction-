from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.connection import get_db

router = APIRouter(prefix="/api/v1/health", tags=["Health Diagnostics"])

@router.get("")
def health_check(db: Session = Depends(get_db)):
    """Comprehensive health check & PostgreSQL database diagnostic."""
    try:
        db.execute(text("SELECT 1"))
        db_status = "HEALTHY"
    except Exception as e:
        db_status = f"UNHEALTHY: {str(e)}"

    return {
        "status": "UP",
        "service": "HelixQ FastAPI Backend",
        "database": {
            "type": "PostgreSQL",
            "status": db_status
        }
    }
