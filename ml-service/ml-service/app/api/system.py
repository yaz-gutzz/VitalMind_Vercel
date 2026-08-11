"""
Endpoints de estado e información del microservicio.
"""

from __future__ import annotations

from fastapi import APIRouter
from fastapi import status

from app.core.config import (
    APP_VERSION,
    RISK_MODEL_ALGORITHM,
    RISK_MODEL_VERSION,
    WELLBEING_MODEL_ALGORITHM,
    WELLBEING_MODEL_VERSION,
)
from app.schemas.common import (
    HealthResponse,
    ModelInformation,
    ModelsInfoResponse,
)
from app.services.model_loader import (
    model_artifacts,
)


router = APIRouter(
    tags=["system"],
)


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
)
def health_check() -> HealthResponse:
    """Comprueba que los modelos estén cargados."""
    models_loaded = (
        model_artifacts.models_loaded
    )

    return HealthResponse(
        status=(
            "healthy"
            if models_loaded
            else "unhealthy"
        ),
        models_loaded=models_loaded,
        service_version=APP_VERSION,
    )


@router.get(
    "/api/v1/models/info",
    response_model=ModelsInfoResponse,
    status_code=status.HTTP_200_OK,
)
def get_models_info() -> ModelsInfoResponse:
    """Devuelve información de los modelos."""
    return ModelsInfoResponse(
        risk_classifier=ModelInformation(
            version=RISK_MODEL_VERSION,
            algorithm=RISK_MODEL_ALGORITHM,
            loaded=(
                model_artifacts.risk_classifier
                is not None
            ),
        ),
        wellbeing_regressor=ModelInformation(
            version=WELLBEING_MODEL_VERSION,
            algorithm=(
                WELLBEING_MODEL_ALGORITHM
            ),
            loaded=(
                model_artifacts.wellbeing_regressor
                is not None
            ),
        ),
    )