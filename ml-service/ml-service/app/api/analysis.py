"""
Endpoint principal de inferencia conjunta.
"""

from __future__ import annotations

from fastapi import (
    APIRouter,
    HTTPException,
    status,
)

from app.schemas.inference import (
    AnalysisRequest,
    AnalysisResponse,
    ValidationErrorResponse,
)
from app.services.inference_service import (
    analyze_request,
)


router = APIRouter(
    prefix="/api/v1",
    tags=["analysis"],
)


@router.post(
    "/analyze",
    response_model=AnalysisResponse,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_422_UNPROCESSABLE_CONTENT: {
            "model": ValidationErrorResponse,
            "description": (
                "La solicitud no contiene datos "
                "suficientes o válidos."
            ),
        },
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "description": (
                "No fue posible ejecutar "
                "la inferencia."
            ),
        },
    },
)
def analyze(
    request: AnalysisRequest,
) -> AnalysisResponse:
    """Ejecuta riesgo y bienestar en una sola solicitud."""
    try:
        return analyze_request(
            request
        )

    except ValueError as error:
        raise HTTPException(
            status_code=(
                status
                .HTTP_422_UNPROCESSABLE_ENTITY
            ),
            detail={
                "request_id": (
                    request.request_id
                ),
                "status": (
                    "validation_error"
                ),
                "message": str(error),
            },
        ) from error

    except RuntimeError as error:
        # El detalle interno no se expone al cliente.
        raise HTTPException(
            status_code=(
                status
                .HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail={
                "request_id": (
                    request.request_id
                ),
                "status": "internal_error",
                "message": (
                    "No fue posible ejecutar "
                    "la inferencia."
                ),
            },
        ) from error