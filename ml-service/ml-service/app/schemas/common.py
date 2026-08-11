"""
Esquemas comunes del microservicio ML.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Respuesta del endpoint de salud."""

    status: Literal[
        "healthy",
        "unhealthy",
    ]

    models_loaded: bool
    service_version: str


class ModelInformation(BaseModel):
    """Información de un modelo cargado."""

    version: str
    algorithm: str
    loaded: bool


class ModelsInfoResponse(BaseModel):
    """Información de los modelos disponibles."""

    risk_classifier: ModelInformation
    wellbeing_regressor: ModelInformation