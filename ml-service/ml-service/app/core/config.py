"""
Configuración central del microservicio ML de VitalMind AI.
"""

from __future__ import annotations

from pathlib import Path
from typing import Final


APP_NAME: Final[str] = "VitalMind AI ML Service"
APP_VERSION: Final[str] = "1.0.0"
API_PREFIX: Final[str] = "/api/v1"

RISK_MODEL_VERSION: Final[str] = "1.0.0"
WELLBEING_MODEL_VERSION: Final[str] = "1.0.0"

RISK_MODEL_ALGORITHM: Final[str] = (
    "logistic_regression"
)

WELLBEING_MODEL_ALGORITHM: Final[str] = (
    "ridge_regression"
)

APP_DIR: Final[Path] = (
    Path(__file__).resolve().parent.parent
)

ML_SERVICE_DIR: Final[Path] = APP_DIR.parent

RISK_MODEL_PATH: Final[Path] = (
    APP_DIR
    / "models"
    / "risk-classification"
    / "best_risk_classifier_safe.joblib"
)

RISK_LABEL_ENCODER_PATH: Final[Path] = (
    APP_DIR
    / "models"
    / "risk-classification"
    / "risk_label_encoder.joblib"
)

WELLBEING_MODEL_PATH: Final[Path] = (
    APP_DIR
    / "models"
    / "wellbeing-regression"
    / "best_wellbeing_regressor.joblib"
)

PREPROCESSING_METADATA_PATH: Final[Path] = (
    ML_SERVICE_DIR
    / "data"
    / "modeling"
    / "preprocessing_metadata.json"
)

DISCLAIMER: Final[str] = (
    "Resultados preventivos generados con modelos "
    "entrenados sobre datos sintéticos. No representan "
    "un diagnóstico clínico."
)