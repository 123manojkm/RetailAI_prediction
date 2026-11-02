from typing import List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import Response
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.core.logging import logger
from app.core.security import get_current_user
from app.database.session import get_db
from app.models.data_upload import DataUpload
from app.models.processing_job import ProcessingJob
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.data import (
    DataQualityReport,
    DataUploadResponse,
    DatasetPreview,
    ProcessingJobCreate,
    ProcessingJobStatus,
)
from app.services.data_service import DataService

router = APIRouter(prefix="/data", tags=["Data Ingestion & Processing"])


@router.get("/sample-template")
def download_sample_template():
    """
    Download a standard CSV template formatted for retail analytics.
    """
    csv_content = DataService.generate_sample_csv_string()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=retail_transactions_template.csv"},
    )


@router.post("/upload", response_model=DataUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(..., description="CSV file to upload"),
    is_synthetic: bool = Query(False, description="Flag if dataset is synthetically generated"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DataUploadResponse:
    """
    Upload a new CSV dataset into the raw storage directory and register in database.
    """
    try:
        record = await DataService.save_upload(
            file=file,
            user_id=current_user.id,
            db=db,
            is_synthetic=is_synthetic,
        )
        return DataUploadResponse.model_validate(record)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Failed to upload file: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Upload processing failed: {str(e)}")


@router.get("/uploads", response_model=PaginatedResponse[DataUploadResponse])
def list_uploads(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status_filter: Optional[str] = Query(None, description="Filter by status (e.g. validated, uploaded, failed)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PaginatedResponse[DataUploadResponse]:
    """
    Retrieve a paginated list of all uploaded datasets.
    """
    stmt = select(DataUpload)
    count_stmt = select(func.count(DataUpload.id))

    if status_filter:
        stmt = stmt.where(DataUpload.status == status_filter)
        count_stmt = count_stmt.where(DataUpload.status == status_filter)

    total = db.execute(count_stmt).scalar() or 0
    offset = (page - 1) * page_size
    items = db.execute(stmt.order_by(desc(DataUpload.created_at)).offset(offset).limit(page_size)).scalars().all()
    pages = (total + page_size - 1) // page_size if total > 0 else 0

    return PaginatedResponse[DataUploadResponse](
        items=[DataUploadResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/quality/{upload_id}", response_model=DataQualityReport)
def get_data_quality_report(
    upload_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DataQualityReport:
    """
    Generate an in-depth data quality report with missing values, duplicate counts, and health score.
    """
    try:
        return DataService.generate_quality_report(upload_id=upload_id, db=db)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except FileNotFoundError as fe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(fe))
    except Exception as e:
        logger.error(f"Error computing data quality for upload {upload_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to analyze dataset quality")


@router.get("/preview/{upload_id}", response_model=DatasetPreview)
def get_data_preview(
    upload_id: int,
    limit: int = Query(15, ge=1, le=100, description="Number of sample rows"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DatasetPreview:
    """
    Fetch preview rows and column schemas from an uploaded dataset.
    """
    try:
        return DataService.get_preview(upload_id=upload_id, db=db, limit=limit)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except FileNotFoundError as fe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(fe))
    except Exception as e:
        logger.error(f"Error reading dataset preview for upload {upload_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to load preview")


@router.post("/process", response_model=ProcessingJobStatus, status_code=status.HTTP_202_ACCEPTED)
def start_processing_job(
    request: ProcessingJobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProcessingJobStatus:
    """
    Trigger a background data processing or ETL job.
    """
    valid_types = ["data_processing", "model_training", "feature_engineering"]
    if request.job_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid job type '{request.job_type}'. Must be one of: {', '.join(valid_types)}",
        )

    job = DataService.create_processing_job(
        job_type=request.job_type,
        parameters=request.parameters,
        db=db,
    )
    return ProcessingJobStatus.model_validate(job)


@router.get("/jobs/{job_id}", response_model=ProcessingJobStatus)
def get_job_status(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProcessingJobStatus:
    """
    Retrieve real-time status and execution progress of a processing job.
    """
    job = DataService.get_processing_job(job_id=job_id, db=db)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Job with ID {job_id} not found")
    return ProcessingJobStatus.model_validate(job)


@router.post("/process-upload/{upload_id}")
def process_upload_and_sync(
    upload_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Manually trigger end-to-end data ingestion, customer segmentation, and demand forecasting
    for an uploaded dataset.
    """
    upload = db.execute(select(DataUpload).where(DataUpload.id == upload_id)).scalar_one_or_none()
    if not upload:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Upload not found")

    file_path = DataService.get_raw_data_dir() / upload.filename
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found on disk")

    try:
        result = DataService.process_and_sync_dataset(file_path=file_path, db=db, upload_record=upload)
        upload.status = "processed"
        db.commit()
        return {
            "message": "Dataset successfully processed. Customer segments and demand forecasts have been updated!",
            "details": result,
        }
    except Exception as e:
        logger.error(f"Failed to process upload {upload_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

