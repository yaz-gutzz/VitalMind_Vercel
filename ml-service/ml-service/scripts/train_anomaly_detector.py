"""
Entrenamiento no supervisado del detector de anomalías
de VitalMind AI.

El script:
- utiliza únicamente el conjunto temporal de entrenamiento;
- excluye risk_level, wellbeing_score e is_anomaly;
- transforma variables numéricas y mood;
- entrena Isolation Forest;
- detecta registros atípicos sin usar etiquetas;
- recupera is_anomaly únicamente para evaluación externa;
- guarda el pipeline y los reportes.

La detección es exploratoria y no representa un diagnóstico.
"""

from __future__ import annotations

from pathlib import Path
import json
import sys
from typing import Any

import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import IsolationForest
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import (
    OneHotEncoder,
    StandardScaler,
)


# ============================================================
# 1. CONFIGURACIÓN
# ============================================================

RANDOM_SEED = 2026

EXPECTED_CONTAMINATION = 0.03

NUMERIC_FEATURES = [
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

CATEGORICAL_FEATURES = [
    "mood",
]

FEATURE_COLUMNS = (
    NUMERIC_FEATURES
    + CATEGORICAL_FEATURES
)


# ============================================================
# 2. RUTAS
# ============================================================

SCRIPT_PATH = Path(__file__).resolve()
ML_SERVICE_DIR = SCRIPT_PATH.parent.parent

TRAIN_DATA_PATH = (
    ML_SERVICE_DIR
    / "data"
    / "modeling"
    / "train_model.csv"
)

RAW_DATA_PATH = (
    ML_SERVICE_DIR
    / "data"
    / "raw"
    / "vitalmind_dataset_raw.csv"
)

MODELS_DIR = (
    ML_SERVICE_DIR
    / "app"
    / "models"
    / "anomaly-detection"
)

REPORTS_DIR = (
    ML_SERVICE_DIR
    / "reports"
    / "anomaly-detection"
)

MODEL_PATH = (
    MODELS_DIR
    / "isolation_forest_pipeline.joblib"
)

PREDICTIONS_PATH = (
    REPORTS_DIR
    / "training_anomaly_predictions.csv"
)

METRICS_PATH = (
    REPORTS_DIR
    / "external_evaluation_metrics.json"
)

CONFUSION_MATRIX_PATH = (
    REPORTS_DIR
    / "external_confusion_matrix.csv"
)

ANOMALY_SUMMARY_PATH = (
    REPORTS_DIR
    / "detected_anomaly_summary.csv"
)


# ============================================================
# 3. CARGA DE DATOS
# ============================================================

def load_training_data() -> pd.DataFrame:
    """Carga el conjunto temporal de entrenamiento."""
    if not TRAIN_DATA_PATH.exists():
        raise FileNotFoundError(
            "No se encontró el conjunto de entrenamiento:\n"
            f"{TRAIN_DATA_PATH}"
        )

    return pd.read_csv(
        TRAIN_DATA_PATH,
        parse_dates=["log_date"],
    )


def load_external_labels() -> pd.DataFrame:
    """
    Recupera is_anomaly desde el dataset crudo.

    La etiqueta se utiliza únicamente después del entrenamiento
    para evaluación externa.
    """
    if not RAW_DATA_PATH.exists():
        raise FileNotFoundError(
            "No se encontró el dataset crudo:\n"
            f"{RAW_DATA_PATH}"
        )

    raw_dataset = pd.read_csv(
        RAW_DATA_PATH,
        usecols=[
            "record_id",
            "is_anomaly",
        ],
    )

    if raw_dataset["record_id"].duplicated().any():
        raise ValueError(
            "Existen record_id duplicados "
            "en el dataset crudo."
        )

    raw_dataset["is_anomaly"] = (
        raw_dataset["is_anomaly"]
        .astype(bool)
    )

    return raw_dataset


def validate_training_data(
    dataset: pd.DataFrame,
) -> None:
    """Valida las columnas requeridas."""
    required_columns = (
        [
            "record_id",
            "user_id",
            "log_date",
        ]
        + FEATURE_COLUMNS
    )

    missing_columns = [
        column
        for column in required_columns
        if column not in dataset.columns
    ]

    if missing_columns:
        raise ValueError(
            "Faltan columnas requeridas: "
            f"{missing_columns}"
        )

    if dataset.empty:
        raise ValueError(
            "El conjunto de entrenamiento está vacío."
        )

    missing_values = int(
        dataset[FEATURE_COLUMNS]
        .isna()
        .sum()
        .sum()
    )

    if missing_values > 0:
        raise ValueError(
            "El conjunto conserva "
            f"{missing_values} valores faltantes."
        )


# ============================================================
# 4. PIPELINE
# ============================================================

def build_preprocessor() -> ColumnTransformer:
    """Construye el preprocesamiento."""
    return ColumnTransformer(
        transformers=[
            (
                "numeric",
                StandardScaler(),
                NUMERIC_FEATURES,
            ),
            (
                "categorical",
                OneHotEncoder(
                    handle_unknown="ignore",
                    sparse_output=False,
                ),
                CATEGORICAL_FEATURES,
            ),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )


def build_pipeline() -> Pipeline:
    """Construye el pipeline de Isolation Forest."""
    detector = IsolationForest(
        n_estimators=500,
        contamination=EXPECTED_CONTAMINATION,
        max_samples="auto",
        max_features=1.0,
        bootstrap=False,
        random_state=RANDOM_SEED,
        n_jobs=-1,
    )

    return Pipeline(
        steps=[
            (
                "preprocessor",
                build_preprocessor(),
            ),
            (
                "detector",
                detector,
            ),
        ]
    )


# ============================================================
# 5. PREDICCIONES
# ============================================================

def create_predictions(
    dataset: pd.DataFrame,
    pipeline: Pipeline,
) -> pd.DataFrame:
    """Genera predicciones y puntajes de anomalía."""
    features = dataset[
        FEATURE_COLUMNS
    ].copy()

    raw_predictions = pipeline.predict(
        features
    )

    decision_scores = pipeline.decision_function(
        features
    )

    anomaly_scores = -decision_scores

    result = dataset[
        [
            "record_id",
            "user_id",
            "log_date",
        ]
    ].copy()

    result["raw_prediction"] = (
        raw_predictions
    )

    result["predicted_anomaly"] = (
        raw_predictions == -1
    )

    result["decision_score"] = (
        decision_scores
    )

    result["anomaly_score"] = (
        anomaly_scores
    )

    return result


# ============================================================
# 6. EVALUACIÓN EXTERNA
# ============================================================

def attach_external_labels(
    predictions: pd.DataFrame,
    labels: pd.DataFrame,
) -> pd.DataFrame:
    """Une las predicciones con la etiqueta sintética."""
    result = predictions.merge(
        labels,
        on="record_id",
        how="left",
        validate="one_to_one",
    )

    if result["is_anomaly"].isna().any():
        missing_labels = int(
            result["is_anomaly"]
            .isna()
            .sum()
        )

        raise ValueError(
            "No fue posible recuperar "
            f"{missing_labels} etiquetas externas."
        )

    result["is_anomaly"] = (
        result["is_anomaly"]
        .astype(bool)
    )

    result["external_match"] = (
        result["predicted_anomaly"]
        == result["is_anomaly"]
    )

    return result


def calculate_external_metrics(
    predictions: pd.DataFrame,
) -> dict[str, Any]:
    """Calcula métricas usando la etiqueta solo como referencia."""
    y_true = predictions[
        "is_anomaly"
    ].astype(int)

    y_pred = predictions[
        "predicted_anomaly"
    ].astype(int)

    matrix = confusion_matrix(
        y_true,
        y_pred,
        labels=[0, 1],
    )

    true_negative = int(matrix[0, 0])
    false_positive = int(matrix[0, 1])
    false_negative = int(matrix[1, 0])
    true_positive = int(matrix[1, 1])

    detected_count = int(
        predictions[
            "predicted_anomaly"
        ].sum()
    )

    external_count = int(
        predictions[
            "is_anomaly"
        ].sum()
    )

    return {
        "method": "isolation_forest",
        "training_type": "unsupervised",
        "contamination": (
            EXPECTED_CONTAMINATION
        ),
        "records": int(
            len(predictions)
        ),
        "detected_anomalies": (
            detected_count
        ),
        "detected_percentage": float(
            detected_count
            / len(predictions)
            * 100
        ),
        "external_synthetic_anomalies": (
            external_count
        ),
        "external_synthetic_percentage": float(
            external_count
            / len(predictions)
            * 100
        ),
        "accuracy_external": float(
            accuracy_score(
                y_true,
                y_pred,
            )
        ),
        "precision_external": float(
            precision_score(
                y_true,
                y_pred,
                zero_division=0,
            )
        ),
        "recall_external": float(
            recall_score(
                y_true,
                y_pred,
                zero_division=0,
            )
        ),
        "f1_external": float(
            f1_score(
                y_true,
                y_pred,
                zero_division=0,
            )
        ),
        "confusion_matrix": {
            "true_negative": true_negative,
            "false_positive": false_positive,
            "false_negative": false_negative,
            "true_positive": true_positive,
        },
        "label_usage": (
            "External evaluation only; "
            "not used during training"
        ),
        "limitations": [
            "Synthetic dataset",
            "Synthetic external reference label",
            "Contamination configured at 3 percent",
            "Not clinically validated",
            "Detected anomalies require contextual review",
        ],
    }


# ============================================================
# 7. RESUMEN DE ANOMALÍAS
# ============================================================

def create_anomaly_summary(
    training_data: pd.DataFrame,
    predictions: pd.DataFrame,
) -> pd.DataFrame:
    """Compara registros normales y detectados como anómalos."""
    analysis_data = training_data.merge(
        predictions[
            [
                "record_id",
                "predicted_anomaly",
                "anomaly_score",
            ]
        ],
        on="record_id",
        how="left",
        validate="one_to_one",
    )

    summary_features = [
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
        "anomaly_score",
    ]

    summary = (
        analysis_data
        .groupby(
            "predicted_anomaly",
            as_index=False,
        )[summary_features]
        .mean()
    )

    summary["group"] = np.where(
        summary["predicted_anomaly"],
        "detected_anomaly",
        "normal",
    )

    ordered_columns = [
        "group",
        "predicted_anomaly",
        *summary_features,
    ]

    return summary[
        ordered_columns
    ]


# ============================================================
# 8. EXPORTACIÓN
# ============================================================

def save_outputs(
    pipeline: Pipeline,
    predictions: pd.DataFrame,
    metrics: dict[str, Any],
    anomaly_summary: pd.DataFrame,
) -> None:
    """Guarda modelo y reportes."""
    MODELS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    REPORTS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    joblib.dump(
        pipeline,
        MODEL_PATH,
    )

    predictions.to_csv(
        PREDICTIONS_PATH,
        index=False,
        encoding="utf-8-sig",
    )

    anomaly_summary.to_csv(
        ANOMALY_SUMMARY_PATH,
        index=False,
        encoding="utf-8-sig",
    )

    matrix = metrics[
        "confusion_matrix"
    ]

    matrix_dataframe = pd.DataFrame(
        [
            [
                matrix["true_negative"],
                matrix["false_positive"],
            ],
            [
                matrix["false_negative"],
                matrix["true_positive"],
            ],
        ],
        index=[
            "actual_normal",
            "actual_anomaly",
        ],
        columns=[
            "predicted_normal",
            "predicted_anomaly",
        ],
    )

    matrix_dataframe.to_csv(
        CONFUSION_MATRIX_PATH,
        encoding="utf-8-sig",
    )

    with METRICS_PATH.open(
        "w",
        encoding="utf-8",
    ) as metrics_file:
        json.dump(
            metrics,
            metrics_file,
            ensure_ascii=False,
            indent=2,
        )


# ============================================================
# 9. PRESENTACIÓN
# ============================================================

def print_results(
    metrics: dict[str, Any],
    predictions: pd.DataFrame,
    anomaly_summary: pd.DataFrame,
) -> None:
    """Muestra los resultados."""
    print("\n" + "=" * 70)
    print("DETECCIÓN NO SUPERVISADA DE ANOMALÍAS")
    print("=" * 70)

    print(
        f"Registros analizados: "
        f"{metrics['records']}"
    )

    print(
        "Contaminación configurada: "
        f"{metrics['contamination']:.2%}"
    )

    print(
        "Anomalías detectadas: "
        f"{metrics['detected_anomalies']} "
        f"({metrics['detected_percentage']:.2f} %)"
    )

    print(
        "Anomalías sintéticas externas: "
        f"{metrics['external_synthetic_anomalies']} "
        f"({metrics['external_synthetic_percentage']:.2f} %)"
    )

    print("\nEvaluación externa:")

    print(
        f"Accuracy:  "
        f"{metrics['accuracy_external']:.4f}"
    )

    print(
        f"Precision: "
        f"{metrics['precision_external']:.4f}"
    )

    print(
        f"Recall:    "
        f"{metrics['recall_external']:.4f}"
    )

    print(
        f"F1:        "
        f"{metrics['f1_external']:.4f}"
    )

    print("\nMatriz externa:")

    matrix = metrics[
        "confusion_matrix"
    ]

    print(
        f"Verdaderos normales: "
        f"{matrix['true_negative']}"
    )

    print(
        f"Falsos positivos: "
        f"{matrix['false_positive']}"
    )

    print(
        f"Falsos negativos: "
        f"{matrix['false_negative']}"
    )

    print(
        f"Verdaderas anomalías: "
        f"{matrix['true_positive']}"
    )

    print("\nRegistros con mayor puntaje de anomalía:")

    top_anomalies = (
        predictions
        .sort_values(
            "anomaly_score",
            ascending=False,
        )
        .head(10)
    )

    
    top_anomalies_display = top_anomalies[
        [
            "record_id",
            "user_id",
            "log_date",
            "anomaly_score",
            "predicted_anomaly",
            "is_anomaly",
        ]
    ].copy()

    top_anomalies_display[
        "anomaly_score"
    ] = top_anomalies_display[
        "anomaly_score"
    ].round(4)

    print(
        top_anomalies_display.to_string(
            index=False
        )
    )

    print("\nResumen promedio por grupo:")

    print(
        anomaly_summary
        .round(2)
        .to_string(index=False)
    )


# ============================================================
# 10. EJECUCIÓN
# ============================================================

def main() -> None:
    """Ejecuta la detección no supervisada."""
    try:
        training_data = (
            load_training_data()
        )

        validate_training_data(
            training_data
        )

        external_labels = (
            load_external_labels()
        )

        pipeline = build_pipeline()

        features = training_data[
            FEATURE_COLUMNS
        ].copy()

        pipeline.fit(
            features
        )

        predictions = create_predictions(
            dataset=training_data,
            pipeline=pipeline,
        )

        predictions = attach_external_labels(
            predictions=predictions,
            labels=external_labels,
        )

        metrics = (
            calculate_external_metrics(
                predictions
            )
        )

        anomaly_summary = (
            create_anomaly_summary(
                training_data=training_data,
                predictions=predictions,
            )
        )

        save_outputs(
            pipeline=pipeline,
            predictions=predictions,
            metrics=metrics,
            anomaly_summary=anomaly_summary,
        )

        print_results(
            metrics=metrics,
            predictions=predictions,
            anomaly_summary=anomaly_summary,
        )

        print("\nArchivos generados:")
        print(f"- {MODEL_PATH}")
        print(f"- {PREDICTIONS_PATH}")
        print(f"- {METRICS_PATH}")
        print(f"- {CONFUSION_MATRIX_PATH}")
        print(f"- {ANOMALY_SUMMARY_PATH}")

        print(
            "\nLa detección de anomalías "
            "finalizó correctamente."
        )

    except Exception as error:
        print(
            "\nError durante la detección "
            "de anomalías:"
        )
        print(error)
        sys.exit(1)


if __name__ == "__main__":
    main()