"""
Carga centralizada de artefactos de Machine Learning.

Los modelos se cargan una sola vez durante el inicio
del microservicio.
"""

from __future__ import annotations

from dataclasses import dataclass
import json
from pathlib import Path
from typing import Any

import joblib

from app.core.config import (
    PREPROCESSING_METADATA_PATH,
    RISK_LABEL_ENCODER_PATH,
    RISK_MODEL_PATH,
    WELLBEING_MODEL_PATH,
)


@dataclass
class ModelArtifacts:
    """Contenedor de artefactos cargados."""

    risk_classifier: Any | None = None
    risk_label_encoder: Any | None = None
    wellbeing_regressor: Any | None = None
    preprocessing_metadata: dict[str, Any] | None = None

    @property
    def models_loaded(self) -> bool:
        """Indica si todos los artefactos están disponibles."""
        return all(
            [
                self.risk_classifier is not None,
                self.risk_label_encoder is not None,
                self.wellbeing_regressor is not None,
                self.preprocessing_metadata is not None,
            ]
        )


model_artifacts = ModelArtifacts()


def validate_artifact_path(
    path: Path,
    artifact_name: str,
) -> None:
    """Valida que un artefacto exista."""
    if not path.exists():
        raise FileNotFoundError(
            f"No se encontró {artifact_name}: {path}"
        )

    if not path.is_file():
        raise FileNotFoundError(
            f"La ruta de {artifact_name} no es un archivo: "
            f"{path}"
        )


def load_preprocessing_metadata(
    path: Path,
) -> dict[str, Any]:
    """Carga los valores de imputación aprendidos con train."""
    validate_artifact_path(
        path,
        "los metadatos de preprocesamiento",
    )

    with path.open(
        "r",
        encoding="utf-8",
    ) as metadata_file:
        metadata = json.load(
            metadata_file
        )

    if (
        "numeric_medians" not in metadata
        or "categorical_modes" not in metadata
    ):
        raise ValueError(
            "Los metadatos de preprocesamiento "
            "no contienen las claves requeridas."
        )

    return metadata


def load_all_artifacts() -> ModelArtifacts:
    """Carga todos los artefactos del servicio."""
    validate_artifact_path(
        RISK_MODEL_PATH,
        "el clasificador de riesgo",
    )

    validate_artifact_path(
        RISK_LABEL_ENCODER_PATH,
        "el codificador de riesgo",
    )

    validate_artifact_path(
        WELLBEING_MODEL_PATH,
        "el regresor de bienestar",
    )

    model_artifacts.risk_classifier = joblib.load(
        RISK_MODEL_PATH
    )

    model_artifacts.risk_label_encoder = joblib.load(
        RISK_LABEL_ENCODER_PATH
    )

    model_artifacts.wellbeing_regressor = joblib.load(
        WELLBEING_MODEL_PATH
    )

    model_artifacts.preprocessing_metadata = (
        load_preprocessing_metadata(
            PREPROCESSING_METADATA_PATH
        )
    )

    if not model_artifacts.models_loaded:
        raise RuntimeError(
            "No fue posible cargar todos los "
            "artefactos de Machine Learning."
        )

    return model_artifacts


def unload_all_artifacts() -> None:
    """Libera las referencias de los artefactos."""
    model_artifacts.risk_classifier = None
    model_artifacts.risk_label_encoder = None
    model_artifacts.wellbeing_regressor = None
    model_artifacts.preprocessing_metadata = None