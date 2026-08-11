"""
Ajuste de hiperparámetros para los clasificadores de riesgo
de VitalMind AI.

Se comparan diferentes configuraciones de:

- Regresión Logística.
- Random Forest Classifier.

El conjunto de prueba permanece reservado.
"""

from __future__ import annotations

from pathlib import Path
import json
import sys
from typing import Any

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import ParameterGrid
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import (
    LabelEncoder,
    OneHotEncoder,
    StandardScaler,
)


# ============================================================
# 1. CONFIGURACIÓN
# ============================================================

RANDOM_SEED = 2026
TARGET_COLUMN = "risk_level"

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

MODEL_DATA_DIR = (
    ML_SERVICE_DIR
    / "data"
    / "modeling"
)

TRAIN_PATH = (
    MODEL_DATA_DIR
    / "train_model.csv"
)

VALIDATION_PATH = (
    MODEL_DATA_DIR
    / "validation_model.csv"
)

MODELS_DIR = (
    ML_SERVICE_DIR
    / "app"
    / "models"
    / "risk-classification"
)

REPORTS_DIR = (
    ML_SERVICE_DIR
    / "reports"
    / "classification"
)

BEST_MODEL_PATH = (
    MODELS_DIR
    / "best_risk_classifier_safe.joblib"
)

LABEL_ENCODER_PATH = (
    MODELS_DIR
    / "risk_label_encoder.joblib"
)

TUNING_RESULTS_PATH = (
    REPORTS_DIR
    / "safe_hyperparameter_tuning_results.csv"
)

BEST_METRICS_PATH = (
    REPORTS_DIR
    / "safe_best_validation_metrics.json"
)

# ============================================================
# 3. CARGA DE DATOS
# ============================================================

def load_dataset(path: Path) -> pd.DataFrame:
    """Carga un conjunto de datos."""
    if not path.exists():
        raise FileNotFoundError(
            f"No se encontró el archivo: {path}"
        )

    return pd.read_csv(
        path,
        parse_dates=["log_date"],
    )


def validate_columns(
    dataset: pd.DataFrame,
    dataset_name: str,
) -> None:
    """Valida la existencia de columnas requeridas."""
    required_columns = (
        FEATURE_COLUMNS
        + [TARGET_COLUMN]
    )

    missing_columns = [
        column
        for column in required_columns
        if column not in dataset.columns
    ]

    if missing_columns:
        raise ValueError(
            f"{dataset_name}: faltan columnas "
            f"{missing_columns}"
        )


# ============================================================
# 4. PREPROCESAMIENTO
# ============================================================

def build_preprocessor(
    scale_numeric: bool,
) -> ColumnTransformer:
    """Construye el preprocesador."""
    numeric_transformer: Any

    if scale_numeric:
        numeric_transformer = StandardScaler()
    else:
        numeric_transformer = "passthrough"

    categorical_transformer = OneHotEncoder(
        handle_unknown="ignore",
        sparse_output=False,
    )

    return ColumnTransformer(
        transformers=[
            (
                "numeric",
                numeric_transformer,
                NUMERIC_FEATURES,
            ),
            (
                "categorical",
                categorical_transformer,
                CATEGORICAL_FEATURES,
            ),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )


def build_pipeline(
    model_name: str,
    parameters: dict[str, Any],
) -> Pipeline:
    """Construye el pipeline según el modelo."""
    if model_name == "logistic_regression":
        classifier = LogisticRegression(
            random_state=RANDOM_SEED,
            max_iter=3000,
            **parameters,
        )

        preprocessor = build_preprocessor(
            scale_numeric=True,
        )

    elif model_name == "random_forest":
        classifier = RandomForestClassifier(
            random_state=RANDOM_SEED,
            n_jobs=-1,
            **parameters,
        )

        preprocessor = build_preprocessor(
            scale_numeric=False,
        )

    else:
        raise ValueError(
            f"Modelo no soportado: {model_name}"
        )

    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", classifier),
        ]
    )


# ============================================================
# 5. EVALUACIÓN
# ============================================================

def calculate_metrics(
    model_name: str,
    parameters: dict[str, Any],
    pipeline: Pipeline,
    x_validation: pd.DataFrame,
    y_validation: pd.Series,
    label_encoder: LabelEncoder,
) -> dict[str, Any]:
    """Calcula métricas de validación."""
    predictions = pipeline.predict(
        x_validation
    )

    probabilities = pipeline.predict_proba(
        x_validation
    )

    accuracy = accuracy_score(
        y_validation,
        predictions,
    )

    precision_weighted = precision_score(
        y_validation,
        predictions,
        average="weighted",
        zero_division=0,
    )

    recall_weighted = recall_score(
        y_validation,
        predictions,
        average="weighted",
        zero_division=0,
    )

    f1_weighted = f1_score(
        y_validation,
        predictions,
        average="weighted",
        zero_division=0,
    )

    f1_macro = f1_score(
        y_validation,
        predictions,
        average="macro",
        zero_division=0,
    )

    report = classification_report(
        y_validation,
        predictions,
        target_names=label_encoder.classes_,
        output_dict=True,
        zero_division=0,
    )

    matrix = confusion_matrix(
        y_validation,
        predictions,
    )

    try:
        roc_auc = roc_auc_score(
            y_validation,
            probabilities,
            average="weighted",
            multi_class="ovr",
        )
    except ValueError:
        roc_auc = None

    return {
        "model": model_name,
        "parameters": parameters,
        "accuracy": float(accuracy),
        "precision_weighted": float(
            precision_weighted
        ),
        "recall_weighted": float(
            recall_weighted
        ),
        "f1_weighted": float(
            f1_weighted
        ),
        "f1_macro": float(f1_macro),
        "roc_auc_weighted_ovr": (
            float(roc_auc)
            if roc_auc is not None
            else None
        ),
        "high_precision": float(
            report["high"]["precision"]
        ),
        "high_recall": float(
            report["high"]["recall"]
        ),
        "high_f1": float(
            report["high"]["f1-score"]
        ),
        "classification_report": report,
        "confusion_matrix": matrix.tolist(),
        "classes": (
            label_encoder.classes_.tolist()
        ),
    }


# ============================================================
# 6. ESPACIOS DE BÚSQUEDA
# ============================================================

LOGISTIC_PARAMETER_GRID = {
    "C": [
        0.01,
        0.1,
        0.5,
        1.0,
        2.0,
        5.0,
        10.0,
    ],
    "class_weight": [
        None,
        "balanced",
    ],
    "solver": [
        "lbfgs",
    ],
}

RANDOM_FOREST_PARAMETER_GRID = {
    "n_estimators": [
        200,
        400,
        600,
    ],
    "max_depth": [
        None,
        10,
        20,
    ],
    "min_samples_split": [
        2,
        4,
        8,
    ],
    "min_samples_leaf": [
        1,
        2,
        4,
    ],
    "max_features": [
        "sqrt",
        "log2",
    ],
    "class_weight": [
        None,
        "balanced",
    ],
}


# ============================================================
# 7. AJUSTE
# ============================================================

def tune_model(
    model_name: str,
    parameter_grid: dict[str, list[Any]],
    x_train: pd.DataFrame,
    y_train: pd.Series,
    x_validation: pd.DataFrame,
    y_validation: pd.Series,
    label_encoder: LabelEncoder,
) -> tuple[
    list[dict[str, Any]],
    Pipeline,
    dict[str, Any],
]:
    """Evalúa todas las combinaciones de parámetros."""
    combinations = list(
        ParameterGrid(parameter_grid)
    )

    print(
        f"\nAjustando {model_name}: "
        f"{len(combinations)} combinaciones"
    )

    results: list[dict[str, Any]] = []

    best_pipeline: Pipeline | None = None
    best_metrics: dict[str, Any] | None = None

    for index, parameters in enumerate(
        combinations,
        start=1,
    ):
        print(
            f"[{index}/{len(combinations)}] "
            f"{parameters}"
        )

        pipeline = build_pipeline(
            model_name=model_name,
            parameters=parameters,
        )

        pipeline.fit(
            x_train,
            y_train,
        )

        metrics = calculate_metrics(
            model_name=model_name,
            parameters=parameters,
            pipeline=pipeline,
            x_validation=x_validation,
            y_validation=y_validation,
            label_encoder=label_encoder,
        )

        results.append(metrics)

        if best_metrics is None:
            best_metrics = metrics
            best_pipeline = pipeline
            continue

        current_score = (
            metrics["f1_macro"],
            metrics["high_recall"],
            metrics["roc_auc_weighted_ovr"]
            or 0,
            metrics["accuracy"],
        )

        best_score = (
            best_metrics["f1_macro"],
            best_metrics["high_recall"],
            best_metrics[
                "roc_auc_weighted_ovr"
            ]
            or 0,
            best_metrics["accuracy"],
        )

        if current_score > best_score:
            best_metrics = metrics
            best_pipeline = pipeline

    if (
        best_pipeline is None
        or best_metrics is None
    ):
        raise RuntimeError(
            f"No se obtuvo resultado para {model_name}"
        )

    return (
        results,
        best_pipeline,
        best_metrics,
    )


# ============================================================
# 8. EXPORTACIÓN
# ============================================================

def create_results_dataframe(
    results: list[dict[str, Any]],
) -> pd.DataFrame:
    """Convierte los resultados a tabla."""
    rows = []

    for result in results:
        row = {
            "model": result["model"],
            "accuracy": result["accuracy"],
            "precision_weighted": (
                result["precision_weighted"]
            ),
            "recall_weighted": (
                result["recall_weighted"]
            ),
            "f1_weighted": result[
                "f1_weighted"
            ],
            "f1_macro": result["f1_macro"],
            "roc_auc_weighted_ovr": result[
                "roc_auc_weighted_ovr"
            ],
            "high_precision": result[
                "high_precision"
            ],
            "high_recall": result[
                "high_recall"
            ],
            "high_f1": result["high_f1"],
        }

        for parameter_name, value in (
            result["parameters"].items()
        ):
            row[
                f"param_{parameter_name}"
            ] = value

        rows.append(row)

    return (
        pd.DataFrame(rows)
        .sort_values(
            by=[
                "f1_macro",
                "high_recall",
                "roc_auc_weighted_ovr",
                "accuracy",
            ],
            ascending=False,
        )
        .reset_index(drop=True)
    )


def save_outputs(
    all_results: list[dict[str, Any]],
    best_pipeline: Pipeline,
    best_metrics: dict[str, Any],
    label_encoder: LabelEncoder,
) -> None:
    """Guarda artefactos del ajuste."""
    MODELS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    REPORTS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    results_dataframe = (
        create_results_dataframe(
            all_results
        )
    )

    results_dataframe.to_csv(
        TUNING_RESULTS_PATH,
        index=False,
        encoding="utf-8-sig",
    )

    joblib.dump(
        best_pipeline,
        BEST_MODEL_PATH,
    )

    joblib.dump(
        label_encoder,
        LABEL_ENCODER_PATH,
    )

    with BEST_METRICS_PATH.open(
        "w",
        encoding="utf-8",
    ) as metrics_file:
        json.dump(
            best_metrics,
            metrics_file,
            ensure_ascii=False,
            indent=2,
        )


# ============================================================
# 9. EJECUCIÓN PRINCIPAL
# ============================================================

def main() -> None:
    """Ejecuta el ajuste completo."""
    try:
        train_dataset = load_dataset(
            TRAIN_PATH
        )

        validation_dataset = load_dataset(
            VALIDATION_PATH
        )

        validate_columns(
            train_dataset,
            "Entrenamiento",
        )

        validate_columns(
            validation_dataset,
            "Validación",
        )

        x_train = train_dataset[
            FEATURE_COLUMNS
        ].copy()

        x_validation = validation_dataset[
            FEATURE_COLUMNS
        ].copy()

        label_encoder = LabelEncoder()

        y_train = pd.Series(
            label_encoder.fit_transform(
                train_dataset[TARGET_COLUMN]
            ),
            index=train_dataset.index,
        )

        y_validation = pd.Series(
            label_encoder.transform(
                validation_dataset[
                    TARGET_COLUMN
                ]
            ),
            index=validation_dataset.index,
        )

        logistic_results, (
            logistic_best_pipeline
        ), logistic_best_metrics = tune_model(
            model_name="logistic_regression",
            parameter_grid=(
                LOGISTIC_PARAMETER_GRID
            ),
            x_train=x_train,
            y_train=y_train,
            x_validation=x_validation,
            y_validation=y_validation,
            label_encoder=label_encoder,
        )

        forest_results, (
            forest_best_pipeline
        ), forest_best_metrics = tune_model(
            model_name="random_forest",
            parameter_grid=(
                RANDOM_FOREST_PARAMETER_GRID
            ),
            x_train=x_train,
            y_train=y_train,
            x_validation=x_validation,
            y_validation=y_validation,
            label_encoder=label_encoder,
        )

        candidate_models = [
            (
                logistic_best_pipeline,
                logistic_best_metrics,
            ),
            (
                forest_best_pipeline,
                forest_best_metrics,
            ),
        ]

        best_pipeline, best_metrics = max(
            candidate_models,
            key=lambda item: (
                item[1]["f1_macro"],
                item[1]["high_recall"],
                item[1][
                    "roc_auc_weighted_ovr"
                ]
                or 0,
                item[1]["accuracy"],
            ),
        )

        all_results = (
            logistic_results
            + forest_results
        )

        save_outputs(
            all_results=all_results,
            best_pipeline=best_pipeline,
            best_metrics=best_metrics,
            label_encoder=label_encoder,
        )

        print("\n" + "=" * 65)
        print("MEJOR MODELO AJUSTADO")
        print("=" * 65)

        print(
            f"Modelo: {best_metrics['model']}"
        )

        print(
            f"Parámetros: "
            f"{best_metrics['parameters']}"
        )

        print(
            f"Accuracy: "
            f"{best_metrics['accuracy']:.4f}"
        )

        print(
            f"F1 macro: "
            f"{best_metrics['f1_macro']:.4f}"
        )

        print(
            f"Recall high: "
            f"{best_metrics['high_recall']:.4f}"
        )

        print(
            f"ROC-AUC: "
            f"{best_metrics['roc_auc_weighted_ovr']:.4f}"
        )

        print("\nArchivos generados:")
        print(f"- {BEST_MODEL_PATH}")
        print(f"- {TUNING_RESULTS_PATH}")
        print(f"- {BEST_METRICS_PATH}")

        print(
            "\nEl conjunto de prueba "
            "continúa sin utilizarse."
        )

    except Exception as error:
        print(
            "\nError durante el ajuste:"
        )
        print(error)
        sys.exit(1)


if __name__ == "__main__":
    main()