from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)

from app.schemas.inference import (
    AnalysisFeatures,)

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


class ChatContext(BaseModel):
    """
    Contexto analítico proporcionado por VitalMind AI.
    """

    model_config = ConfigDict(
        extra="forbid",
    )

    risk_level: RiskLevel

    wellbeing_score: float = Field(
        ge=0,
        le=100,
    )

    wellbeing_level: WellbeingLevel

    bmi: float = Field(
        gt=0,
        le=100,
    )

    recommendations: list[str] = Field(
        default_factory=list,
        max_length=10,
    )


class ChatRequest(BaseModel):
    """
    Solicitud del chatbot enviada por Backend.
    """

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

    message: str = Field(
        min_length=1,
        max_length=2000,
    )

    context: ChatContext


class ChatMetadata(BaseModel):
    """
    Información del proveedor generativo utilizado.
    """

    provider: str
    model: str
    context_used: bool


class ChatResponse(BaseModel):
    """
    Respuesta exitosa del chatbot.
    """

    request_id: str
    user_id: str
    analysis_date: date

    answer: str

    metadata: ChatMetadata

    disclaimer: str

class ChatAnalyzeRequest(BaseModel):
    """
    Solicitud combinada para analizar al usuario
    y generar posteriormente una respuesta conversacional.
    """

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

    message: str = Field(
        min_length=1,
        max_length=2000,
    )

    features: AnalysisFeatures