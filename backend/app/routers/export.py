from fastapi import APIRouter, Depends, Header, Response
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.auth_service import AuthService
from app.services.export_service import ExportService
from app.exceptions.base_exceptions import AuthenticationException

router = APIRouter(prefix="/api/v1/export", tags=["Multi-Format Scientific Exports"])

def get_current_user_id(authorization: str = Header(...), db: Session = Depends(get_db)) -> str:
    if not authorization.startswith("Bearer "):
        raise AuthenticationException("Invalid authorization header format.")
    token = authorization.split(" ")[1]
    auth_service = AuthService(db)
    payload = auth_service.decode_token(token)
    return payload.sub

@router.get("/pdf/{report_id}")
def export_pdf_report(
    report_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Download executive PDF / Markdown report document."""
    service = ExportService(db)
    content = service.export_pdf(report_id)
    return Response(
        content=content,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename=HelixQ_Report_{report_id[:8]}.md"}
    )

@router.get("/csv/{report_id}")
def export_csv_report(
    report_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Download candidate screening CSV spreadsheet."""
    service = ExportService(db)
    content = service.export_csv(report_id)
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=HelixQ_Candidates_{report_id[:8]}.csv"}
    )

@router.get("/csv/dataset/{dataset_id}")
def export_dataset_csv(
    dataset_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Download CSV spreadsheet of all compounds in a specific dataset."""
    service = ExportService(db)
    content = service.export_dataset_csv(dataset_id, user_id)
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=Dataset_{dataset_id[:8]}_compounds.csv"}
    )

@router.get("/json/{report_id}")
def export_json_report(
    report_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Download machine-readable JSON report payload."""
    service = ExportService(db)
    content = service.export_json(report_id)
    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=HelixQ_Payload_{report_id[:8]}.json"}
    )
