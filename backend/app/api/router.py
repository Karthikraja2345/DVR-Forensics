import datetime
from fastapi import APIRouter
from app.api.v1.cases import router as cases_router
from app.api.v1.evidence import router as evidence_router
from app.api.v1.recovery import router as recovery_router
from app.api.v1.timeline import router as timeline_router
from app.api.v1.custody import router as custody_router
from app.api.v1.lineage import router as lineage_router
from app.api.v1.validation import router as validation_router
from app.api.v1.reports import router as reports_router
from app.schemas.report import HealthResponse
from app.config import settings

api_router = APIRouter()

# Register v1 domain routers
api_router.include_router(cases_router)
api_router.include_router(evidence_router)
api_router.include_router(recovery_router)
api_router.include_router(timeline_router)
api_router.include_router(custody_router)
api_router.include_router(lineage_router)
api_router.include_router(validation_router)
api_router.include_router(reports_router)


@api_router.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    return HealthResponse(
        status="HEALTHY",
        tool_version=settings.TOOL_VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.datetime.utcnow(),
    )
