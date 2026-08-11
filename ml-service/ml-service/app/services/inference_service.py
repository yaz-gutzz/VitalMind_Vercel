"""
Servicio de preprocesamiento e inferencia conjunta.

Este módulo:
- calcula BMI;
- aplica imputaciones autorizadas;
- crea la entrada esperada por los modelos;
- ejecuta clasificación y regresión;
- construye la respuesta normalizada.
"""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd

from app.core.config import (
    DISCLAIMER,
    RISK_MODEL_VERSION,
    WELLBEING_MODEL_VERSION,
)
from app.schemas.inference import (
    AnalysisRequest,
    AnalysisResponse,
    AnalysisResults,
    MissingDataReport,
    ModelVersions,
    RiskClassificationResult,
    RiskProbabilities,
    WellbeingResult,
)
from app.services.model_loader import (
    model_artifacts,
)
from app.services.recommendation_service import (
    generate_recommendations,   )


NUMERIC_MODEL_FEATURES = [
    "age",
    "height_cm",
    "weight_kg",
    "bmi",
    "water_glasses",
    "exercise_minutes",
    "sleep_hours",
    "healthy_meals_count",
    "meditation_minutes",
    "pain",
    "temperature_c",
    "systolic_mmhg",
    "diastolic_mmhg",
    "glucose_mg_dl",
    "heart_rate_bpm",
    "stress_level",
    "energy_level",
    "sleep_quality",
]

CATEGORICAL_MODEL_FEATURES = [
    "mood",
]

MODEL_FEATURES = (
    NUMERIC_MODEL_FEATURES
    + CATEGORICAL_MODEL_FEATURES
)

IMPUTABLE_FIELDS = [
    "water_glasses",
    "exercise_minutes",
    "sleep_hours",
    "healthy_meals_count",
    "meditation_minutes",
    "pain",
    "temperature_c",
    "systolic_mmhg",
    "diastolic_mmhg",
    "glucose_mg_dl",
    "heart_rate_bpm",
]


def calculate_bmi(
    height_cm: float,
    weight_kg: float,
) -> float:
    """Calcula BMI con altura en centímetros."""
    height_m = height_cm / 100

    if height_m <= 0:
        raise ValueError(
            "height_cm debe ser mayor que cero."
        )

    bmi = weight_kg / (
        height_m ** 2
    )

    if not np.isfinite(bmi):
        raise ValueError(
            "No fue posible calcular un BMI válido."
        )
    if not 10 <= bmi <= 70:
        raise ValueError(
            "El BMI calculado está fuera del rango "
            "admitido por los modelos"
        )

    return float(bmi)


def get_numeric_medians() -> dict[str, float]:
    """Obtiene medianas aprendidas únicamente desde train."""
    metadata = (
        model_artifacts
        .preprocessing_metadata
    )

    if metadata is None:
        raise RuntimeError(
            "Los metadatos de preprocesamiento "
            "no están cargados."
        )

    numeric_medians = metadata.get(
        "numeric_medians"
    )

    if not isinstance(
        numeric_medians,
        dict,
    ):
        raise RuntimeError(
            "No se encontraron las medianas "
            "de entrenamiento."
        )

    return {
        str(field): float(value)
        for field, value
        in numeric_medians.items()
    }


def prepare_model_features(
    request: AnalysisRequest,
) -> tuple[
    pd.DataFrame,
    float,
    MissingDataReport,
]:
    """
    Prepara un único registro para ambos modelos.

    Nunca sustituye faltantes automáticamente por cero.
    """
    feature_values = (
        request.features.model_dump()
    )

    calculated_bmi = calculate_bmi(
        height_cm=feature_values[
            "height_cm"
        ],
        weight_kg=feature_values[
            "weight_kg"
        ],
    )

    feature_values["bmi"] = (
        calculated_bmi
    )

    numeric_medians = (
        get_numeric_medians()
    )

    imputed_fields: list[str] = []
    warnings: list[str] = []

    for field_name in IMPUTABLE_FIELDS:
        value = feature_values.get(
            field_name
        )

        if value is not None:
            continue

        if field_name not in numeric_medians:
            raise RuntimeError(
                "No existe un valor de imputación "
                f"autorizado para {field_name}."
            )

        feature_values[field_name] = (
            numeric_medians[field_name]
        )

        imputed_fields.append(
            field_name
        )

        warnings.append(
            f"{field_name} fue imputado con "
            "la mediana aprendida desde entrenamiento."
        )

    model_record = {
        feature_name: feature_values[
            feature_name
        ]
        for feature_name in MODEL_FEATURES
    }

    model_dataframe = pd.DataFrame(
        [model_record],
        columns=MODEL_FEATURES,
    )

    missing_after_preprocessing = (
        model_dataframe
        .columns[
            model_dataframe
            .isna()
            .any()
        ]
        .tolist()
    )

    if missing_after_preprocessing:
        raise RuntimeError(
            "Persisten valores faltantes después "
            f"del preprocesamiento: "
            f"{missing_after_preprocessing}"
        )

    report = MissingDataReport(
        required_missing=[],
        imputed_fields=imputed_fields,
        warnings=warnings,
    )

    return (
        model_dataframe,
        calculated_bmi,
        report,
    )


def interpret_wellbeing(
    score: float,
) -> str:
    """Convierte el puntaje en un nivel interpretativo."""
    if score >= 75:
        return "high"

    if score >= 50:
        return "medium"

    return "low"


def predict_risk(
    model_input: pd.DataFrame,
) -> RiskClassificationResult:
    """Ejecuta el clasificador de riesgo."""
    classifier = (
        model_artifacts.risk_classifier
    )

    label_encoder = (
        model_artifacts
        .risk_label_encoder
    )

    if (
        classifier is None
        or label_encoder is None
    ):
        raise RuntimeError(
            "El clasificador de riesgo "
            "no está disponible."
        )

    encoded_prediction = (
        classifier.predict(
            model_input
        )
    )

    probability_values = (
        classifier.predict_proba(
            model_input
        )[0]
    )

    risk_level = str(
        label_encoder.inverse_transform(
            encoded_prediction
        )[0]
    )

    probabilities = {
        str(class_name): float(
            probability_values[index]
        )
        for index, class_name
        in enumerate(
            label_encoder.classes_
        )
    }

    required_classes = {
        "low",
        "medium",
        "high",
    }

    if set(probabilities) != required_classes:
        raise RuntimeError(
            "Las clases del modelo no coinciden "
            "con el contrato del servicio."
        )

    return RiskClassificationResult(
        risk_level=risk_level,
        confidence=round(
            float(
                probability_values.max()
            ),
            6,
        ),
        probabilities=RiskProbabilities(
            low=round(
                probabilities["low"],
                6,
            ),
            medium=round(
                probabilities["medium"],
                6,
            ),
            high=round(
                probabilities["high"],
                6,
            ),
        ),
    )


def predict_wellbeing(
    model_input: pd.DataFrame,
) -> WellbeingResult:
    """Ejecuta el regresor de bienestar."""
    regressor = (
        model_artifacts
        .wellbeing_regressor
    )

    if regressor is None:
        raise RuntimeError(
            "El regresor de bienestar "
            "no está disponible."
        )

    raw_score = float(
        regressor.predict(
            model_input
        )[0]
    )

    bounded_score = float(
        np.clip(
            raw_score,
            0,
            100,
        )
    )

    return WellbeingResult(
        score=round(
            bounded_score,
            4,
        ),
        level=interpret_wellbeing(
            bounded_score
        ),
    )


def analyze_request(
    request: AnalysisRequest,
) -> AnalysisResponse:
    """Ejecuta la inferencia conjunta."""
    if not model_artifacts.models_loaded:
        raise RuntimeError(
            "Los modelos no están cargados."
        )

    (
        model_input,
        calculated_bmi,
        missing_report,
    ) = prepare_model_features(
        request
    )

    risk_result = predict_risk(
        model_input
    )

    wellbeing_result = (
        predict_wellbeing(
            model_input
        )
    )

    recommendations = generate_recommendations(
    features=request.features.model_dump(),
    risk_level=risk_result.risk_level,
    wellbeing_score=wellbeing_result.score,
    )

    return AnalysisResponse(
        request_id=request.request_id,
        user_id=request.user_id,
        analysis_date=(
            request.analysis_date
        ),
        results=AnalysisResults(
            risk_classification=(
                risk_result
            ),
            wellbeing=wellbeing_result,
            calculated_bmi=round(
                calculated_bmi,
                4,
            ),
            recommendations=recommendations,
        ),
        model_versions=ModelVersions(
            risk_classifier=(
                RISK_MODEL_VERSION
            ),
            wellbeing_regressor=(
                WELLBEING_MODEL_VERSION
            ),
        ),
        missing_data_report=(
            missing_report
        ),
        disclaimer=DISCLAIMER,
    )