"""
Esquemas de entrada y respuesta para la inferencia conjunta.
"""

from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


MoodValue = Literal[
    "muy mal",
    "mal",
    "regular",
    "bien",
    "muy bien",
]

RiskLevel = Literal[
    "low",
    "medium",
    "high",
]

WellbeingLevel = Literal[
    "low",
    "medium",
    "high",
]


class AnalysisFeatures(BaseModel):
    """
    Variables enviadas por Backend.

    Los campos indispensables son obligatorios.
    Los campos imputables pueden recibirse como null
    o no incluirse.
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    # Campos indispensables
    age: int = Field(
        ge=18,
        le=100,
    )

    height_cm: float = Field(
        gt=120,
        le=220,
    )

    weight_kg: float = Field(
        gt=30,
        le=250,
    )

    mood: MoodValue

    stress_level: float = Field(
        ge=1,
        le=10,
    )

    energy_level: float = Field(
        ge=1,
        le=10,
    )

    sleep_quality: float = Field(
        ge=1,
        le=10,
    )

    # Campos autorizados para imputación
    water_glasses: float | None = Field(
        default=None,
        ge=0,
        le=30,
    )

    exercise_minutes: float | None = Field(
        default=None,
        ge=0,
        le=600,
    )

    sleep_hours: float | None = Field(
        default=None,
        ge=0,
        le=24,
    )

    healthy_meals_count: float | None = Field(
        default=None,
        ge=0,
        le=5,
    )

    meditation_minutes: float | None = Field(
        default=None,
        ge=0,
        le=300,
    )

    pain: float | None = Field(
        default=None,
        ge=0,
        le=10,
    )

    temperature_c: float | None = Field(
        default=None,
        ge=30,
        le=45,
    )

    systolic_mmhg: float | None = Field(
        default=None,
        ge=60,
        le=250,
    )

    diastolic_mmhg: float | None = Field(
        default=None,
        ge=30,
        le=160,
    )

    glucose_mg_dl: float | None = Field(
        default=None,
        ge=30,
        le=600,
    )

    heart_rate_bpm: float | None = Field(
        default=None,
        ge=30,
        le=250,
    )

    @field_validator(
        "mood",
        mode="before",
    )
    @classmethod
    def normalize_mood(
        cls,
        value: object,
    ) -> object:
        """Normaliza mood antes de validar su categoría."""
        if not isinstance(value, str):
            return value

        return " ".join(
            value.strip().lower().split()
        )


class AnalysisRequest(BaseModel):
    """Solicitud enviada por Backend."""

    model_config = ConfigDict(
        extra="forbid",
    )

    request_id: str = Field(
        min_length=1,
        max_length=100,
    )

    user_id: str = Field(
        min_length=1,
        max_length=100,
    )

    analysis_date: date
    features: AnalysisFeatures


class RiskProbabilities(BaseModel):
    """Probabilidad producida para cada clase."""

    low: float
    medium: float
    high: float


class RiskClassificationResult(BaseModel):
    """Resultado del clasificador."""

    risk_level: RiskLevel
    confidence: float
    probabilities: RiskProbabilities


class WellbeingResult(BaseModel):
    """Resultado del regresor."""

    score: float
    level: WellbeingLevel


class AnalysisResults(BaseModel):
    """Resultados conjuntos."""

    risk_classification: RiskClassificationResult
    wellbeing: WellbeingResult
    calculated_bmi: float
    recommendations: list[str] 


class ModelVersions(BaseModel):
    """Versiones de los modelos utilizados."""

    risk_classifier: str
    wellbeing_regressor: str


class MissingDataReport(BaseModel):
    """Reporte del tratamiento de datos faltantes."""

    required_missing: list[str]
    imputed_fields: list[str]
    warnings: list[str]


class AnalysisResponse(BaseModel):
    """Respuesta exitosa de inferencia."""

    request_id: str
    user_id: str
    analysis_date: date
    results: AnalysisResults
    model_versions: ModelVersions
    missing_data_report: MissingDataReport
    disclaimer: str


class ValidationErrorResponse(BaseModel):
    """Respuesta controlada de validación."""

    request_id: str | None = None

    status: Literal[
        "validation_error"
    ] = "validation_error"

    message: str
    missing_data_report: MissingDataReport