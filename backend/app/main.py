from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.configs.app_config import settings
from app.middleware.correlation_id import CorrelationIdMiddleware
from app.middleware.request_logger import RequestLoggerMiddleware
from app.exceptions.handlers import register_exception_handlers
from app.database.connection import engine, SessionLocal, Base
from app.bootstrap import bootstrap_reference_metadata
from app.routers import (
    auth, system, platform, health, protein, embedding,
    dataset, drug, candidate, prediction, explainability,
    model_registry, quantum, workflow, analytics, report, export, validation
)
from app.logging.logger import logger
import app.models.protein
import app.models.drug
import app.models.prediction
import app.models.quantum
import app.models.workflow # Register WorkflowRun & WorkflowStageRecord ORM models
import app.models.report   # Register ScientificReport ORM model
import app.models.scientist_validation # Register ScientistValidation ORM model

# Create FastAPI enterprise application
app = FastAPI(
    title=settings.APP_NAME,
    description="Quantum-Enhanced AI Platform for Intelligent Virtual Drug Screening - Production Enterprise API",
    version="6.0.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json"
)

# Register Enterprise Middleware
app.add_middleware(RequestLoggerMiddleware)
app.add_middleware(CorrelationIdMiddleware)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Exception Handlers
register_exception_handlers(app)

# Include API Routers
app.include_router(auth.router)
app.include_router(system.router)
app.include_router(platform.router)
app.include_router(protein.router)
app.include_router(embedding.router)
app.include_router(dataset.router)
app.include_router(drug.router)
app.include_router(candidate.router)
app.include_router(prediction.router)
app.include_router(explainability.router)
app.include_router(model_registry.router)
app.include_router(quantum.router)
app.include_router(workflow.router)
app.include_router(validation.router)
app.include_router(analytics.router)
app.include_router(report.router)
app.include_router(export.router)
app.include_router(health.router)

@app.on_event("startup")
def startup_event():
    logger.info(f"Starting {settings.APP_NAME} Sprint 6 Enterprise Release in [{settings.ENVIRONMENT}] environment")
    try:
        # Ensure database tables exist
        Base.metadata.create_all(bind=engine)
        # Bootstrap immutable reference domain metadata
        db = SessionLocal()
        try:
            bootstrap_reference_metadata(db)
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Startup Database warning: {str(e)}.")

@app.get("/")
def root():
    return {
        "platform": settings.APP_NAME,
        "version": "v6.0.0 (Production Release)",
        "documentation": "/api/v1/docs",
        "health": "/api/v1/health"
    }
