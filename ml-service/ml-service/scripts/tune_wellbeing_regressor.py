"""
Ajuste de hiperparámetros para los modelos de regresión
de bienestar de VitalMind AI.

Modelos ajustados:
- Ridge Regression.
- Random Forest Regressor.

La selección se realiza exclusivamente con entrenamiento
y validación temporal segura.

El conjunto de prueba permanece reservado.
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
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import ParameterGrid
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import (
    OneHotEncoder,
    StandardScaler,
)


# ============================================================
# 1. CONFIGURACIÓN
# ============================================================

RANDOM_SEED = 2026
TARGET_COLUMN = "wellbeing_score"

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

RAW_DATA_PATH = (
    ML_SERVICE_DIR
    / "data"
    / "raw"
    / "vitalmind_dataset_raw.csv"
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
    / "wellbeing-regression"
)

REPORTS_DIR = (
    ML_SERVICE_DIR
    / "reports"
    / "regression"
)

BEST_MODEL_PATH = (
    MODELS_DIR
    / "best_wellbeing_regressor.joblib"
)

TUNING_RESULTS_PATH = (
    REPORTS_DIR
    / "hyperparameter_tuning_results.csv"
)

BEST_METRICS_PATH = (
    REPORTS_DIR
    / "best_validation_metrics.json"
)

BEST_PREDICTIONS_PATH = (
    REPORTS_DIR
    / "best_validation_predictions.csv"
)


# ============================================================
# 3. ESPACIOS DE BÚSQUEDA
# ============================================================

RIDGE_PARAMETER_GRID = {
    "alpha": [
        0.001,
        0.01,
        0.1,
        0.5,
        1.0,
        2.0,
        5.0,
        10.0,
        25.0,
        50.0,
        100.0,
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
        30,
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
        1.0,
    ],
}


# ============================================================
# 4. CARGA DE DATOS
# ============================================================

def load_csv(
    path: Path,
) -> pd.DataFrame:
    """Carga un archivo CSV con fecha."""
    if not path.exists():
        raise FileNotFoundError(
            f"No se encontró el archivo:\n{path}"
        )

    return pd.read_csv(
        path,
        parse_dates=["log_date"],
    )


def load_target_data() -> pd.DataFrame:
    """Recupera wellbeing_score mediante record_id."""
    raw_dataset = load_csv(
        RAW_DATA_PATH
    )

    required_columns = [
        "record_id",
        TARGET_COLUMN,
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in raw_dataset.columns
    ]

    if missing_columns:
        raise ValueError(
            "El dataset crudo no contiene: "
            f"{missing_columns}"
        )

    target_data = raw_dataset[
        required_columns
    ].copy()

    if target_data["record_id"].duplicated().any():
        raise ValueError(
            "Existen record_id duplicados."
        )

    target_data[TARGET_COLUMN] = pd.to_numeric(
        target_data[TARGET_COLUMN],
        errors="coerce",
    )

    if target_data[TARGET_COLUMN].isna().any():
        raise ValueError(
            "Existen valores inválidos o faltantes "
            f"en {TARGET_COLUMN}."
        )

    return target_data


def attach_target(
    dataset: pd.DataFrame,
    target_data: pd.DataFrame,
    dataset_name: str,
) -> pd.DataFrame:
    """Une las características con su objetivo."""
    result = dataset.merge(
        target_data,
        on="record_id",
        how="left",
        validate="one_to_one",
    )

    missing_targets = int(
        result[TARGET_COLUMN]
        .isna()
        .sum()
    )

    if missing_targets > 0:
        raise ValueError(
            f"{dataset_name}: faltan "
            f"{missing_targets} objetivos."
        )

    return result


def validate_dataset(
    dataset: pd.DataFrame,
    dataset_name: str,
) -> None:
    """Valida las columnas necesarias."""
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

    if dataset.empty:
        raise ValueError(
            f"{dataset_name}: el dataset está vacío."
        )

    missing_values = int(
        dataset[required_columns]
        .isna()
        .sum()
        .sum()
    )

    if missing_values > 0:
        raise ValueError(
            f"{dataset_name}: conserva "
            f"{missing_values} valores faltantes."
        )


# ============================================================
# 5. PREPROCESAMIENTO Y MODELOS
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
    """Construye el pipeline correspondiente."""
    if model_name == "ridge_regression":
        preprocessor = build_preprocessor(
            scale_numeric=True,
        )

        regressor = Ridge(
            **parameters,
        )

    elif model_name == "random_forest_regressor":
        preprocessor = build_preprocessor(
            scale_numeric=False,
        )

        regressor = RandomForestRegressor(
            random_state=RANDOM_SEED,
            n_jobs=-1,
            **parameters,
        )

    else:
        raise ValueError(
            f"Modelo no soportado: {model_name}"
        )

    return Pipeline(
        steps=[
            (
                "preprocessor",
                preprocessor,
            ),
            (
                "regressor",
                regressor,
            ),
        ]
    )


# ============================================================
# 6. EVALUACIÓN
# ============================================================

def calculate_metrics(
    model_name: str,
    parameters: dict[str, Any],
    pipeline: Pipeline,
    x_validation: pd.DataFrame,
    y_validation: pd.Series,
) -> tuple[
    dict[str, Any],
    pd.DataFrame,
]:
    """Calcula métricas y predicciones."""
    predictions = pipeline.predict(
        x_validation
    )

    residuals = (
        y_validation.to_numpy()
        - predictions
    )

    absolute_errors = np.abs(
        residuals
    )

    squared_errors = np.square(
        residuals
    )

    mae = mean_absolute_error(
        y_validation,
        predictions,
    )

    mse = mean_squared_error(
        y_validation,
        predictions,
    )

    rmse = float(
        np.sqrt(mse)
    )

    r2 = r2_score(
        y_validation,
        predictions,
    )

    metrics = {
        "model": model_name,
        "parameters": parameters,
        "records": int(
            len(y_validation)
        ),
        "mae": float(mae),
        "mse": float(mse),
        "rmse": rmse,
        "r2": float(r2),
        "mean_residual": float(
            residuals.mean()
        ),
        "residual_standard_deviation": float(
            residuals.std()
        ),
        "median_absolute_error_manual": float(
            np.median(
                absolute_errors
            )
        ),
        "maximum_absolute_error": float(
            absolute_errors.max()
        ),
        "mean_squared_error_manual": float(
            squared_errors.mean()
        ),
        "minimum_prediction": float(
            predictions.min()
        ),
        "maximum_prediction": float(
            predictions.max()
        ),
    }

    predictions_dataframe = pd.DataFrame(
        {
            "actual_wellbeing_score": (
                y_validation.to_numpy()
            ),
            "predicted_wellbeing_score": (
                predictions
            ),
            "residual": residuals,
            "absolute_error": (
                absolute_errors
            ),
            "model": model_name,
        },
        index=y_validation.index,
    )

    return (
        metrics,
        predictions_dataframe,
    )


def is_better_result(
    current_metrics: dict[str, Any],
    best_metrics: dict[str, Any],
) -> bool:
    """Determina si una configuración es mejor."""
    current_score = (
        -current_metrics["mae"],
        -current_metrics["rmse"],
        current_metrics["r2"],
        -abs(
            current_metrics[
                "mean_residual"
            ]
        ),
    )

    best_score = (
        -best_metrics["mae"],
        -best_metrics["rmse"],
        best_metrics["r2"],
        -abs(
            best_metrics[
                "mean_residual"
            ]
        ),
    )

    return current_score > best_score


# ============================================================
# 7. AJUSTE DE HIPERPARÁMETROS
# ============================================================

def tune_model(
    model_name: str,
    parameter_grid: dict[str, list[Any]],
    x_train: pd.DataFrame,
    y_train: pd.Series,
    x_validation: pd.DataFrame,
    y_validation: pd.Series,
) -> tuple[
    list[dict[str, Any]],
    Pipeline,
    dict[str, Any],
    pd.DataFrame,
]:
    """Evalúa todas las combinaciones."""
    combinations = list(
        ParameterGrid(
            parameter_grid
        )
    )

    print(
        f"\nAjustando {model_name}: "
        f"{len(combinations)} combinaciones"
    )

    all_results: list[
        dict[str, Any]
    ] = []

    best_pipeline: Pipeline | None = None
    best_metrics: dict[str, Any] | None = None
    best_predictions: pd.DataFrame | None = None

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

        metrics, predictions = (
            calculate_metrics(
                model_name=model_name,
                parameters=parameters,
                pipeline=pipeline,
                x_validation=x_validation,
                y_validation=y_validation,
            )
        )

        all_results.append(
            metrics
        )

        if best_metrics is None:
            best_pipeline = pipeline
            best_metrics = metrics
            best_predictions = predictions
            continue

        if is_better_result(
            metrics,
            best_metrics,
        ):
            best_pipeline = pipeline
            best_metrics = metrics
            best_predictions = predictions

    if (
        best_pipeline is None
        or best_metrics is None
        or best_predictions is None
    ):
        raise RuntimeError(
            "No se encontró una configuración válida "
            f"para {model_name}."
        )

    return (
        all_results,
        best_pipeline,
        best_metrics,
        best_predictions,
    )


# ============================================================
# 8. EXPORTACIÓN
# ============================================================

def create_results_dataframe(
    results: list[dict[str, Any]],
) -> pd.DataFrame:
    """Convierte los resultados en una tabla."""
    rows: list[
        dict[str, Any]
    ] = []

    for result in results:
        row = {
            "model": result["model"],
            "mae": result["mae"],
            "rmse": result["rmse"],
            "r2": result["r2"],
            "mean_residual": (
                result["mean_residual"]
            ),
            "median_absolute_error": (
                result[
                    "median_absolute_error_manual"
                ]
            ),
            "maximum_absolute_error": (
                result[
                    "maximum_absolute_error"
                ]
            ),
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
                "mae",
                "rmse",
                "r2",
            ],
            ascending=[
                True,
                True,
                False,
            ],
        )
        .reset_index(drop=True)
    )


def save_outputs(
    all_results: list[dict[str, Any]],
    best_pipeline: Pipeline,
    best_metrics: dict[str, Any],
    best_predictions: pd.DataFrame,
) -> None:
    """Guarda el modelo y reportes."""
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

    joblib.dump(
        best_pipeline,
        BEST_MODEL_PATH,
    )

    results_dataframe.to_csv(
        TUNING_RESULTS_PATH,
        index=False,
        encoding="utf-8-sig",
    )

    best_predictions.to_csv(
        BEST_PREDICTIONS_PATH,
        index=False,
        encoding="utf-8-sig",
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
    """Ejecuta el ajuste de regresión."""
    try:
        target_data = load_target_data()

        train_dataset = attach_target(
            load_csv(TRAIN_PATH),
            target_data,
            "Entrenamiento",
        )

        validation_dataset = attach_target(
            load_csv(VALIDATION_PATH),
            target_data,
            "Validación",
        )

        validate_dataset(
            train_dataset,
            "Entrenamiento",
        )

        validate_dataset(
            validation_dataset,
            "Validación",
        )

        x_train = train_dataset[
            FEATURE_COLUMNS
        ].copy()

        y_train = train_dataset[
            TARGET_COLUMN
        ].copy()

        x_validation = validation_dataset[
            FEATURE_COLUMNS
        ].copy()

        y_validation = validation_dataset[
            TARGET_COLUMN
        ].copy()

        ridge_results, (
            ridge_best_pipeline
        ), ridge_best_metrics, (
            ridge_best_predictions
        ) = tune_model(
            model_name="ridge_regression",
            parameter_grid=(
                RIDGE_PARAMETER_GRID
            ),
            x_train=x_train,
            y_train=y_train,
            x_validation=x_validation,
            y_validation=y_validation,
        )

        forest_results, (
            forest_best_pipeline
        ), forest_best_metrics, (
            forest_best_predictions
        ) = tune_model(
            model_name=(
                "random_forest_regressor"
            ),
            parameter_grid=(
                RANDOM_FOREST_PARAMETER_GRID
            ),
            x_train=x_train,
            y_train=y_train,
            x_validation=x_validation,
            y_validation=y_validation,
        )

        candidate_models = [
            (
                ridge_best_pipeline,
                ridge_best_metrics,
                ridge_best_predictions,
            ),
            (
                forest_best_pipeline,
                forest_best_metrics,
                forest_best_predictions,
            ),
        ]

        best_pipeline, (
            best_metrics
        ), best_predictions = min(
            candidate_models,
            key=lambda item: (
                item[1]["mae"],
                item[1]["rmse"],
                -item[1]["r2"],
                abs(
                    item[1][
                        "mean_residual"
                    ]
                ),
            ),
        )

        all_results = (
            ridge_results
            + forest_results
        )

        save_outputs(
            all_results=all_results,
            best_pipeline=best_pipeline,
            best_metrics=best_metrics,
            best_predictions=best_predictions,
        )

        print("\n" + "=" * 65)
        print("MEJOR MODELO DE REGRESIÓN AJUSTADO")
        print("=" * 65)

        print(
            f"Modelo: "
            f"{best_metrics['model']}"
        )

        print(
            "Parámetros: "
            f"{best_metrics['parameters']}"
        )

        print(
            f"MAE: "
            f"{best_metrics['mae']:.4f}"
        )

        print(
            f"RMSE: "
            f"{best_metrics['rmse']:.4f}"
        )

        print(
            f"R²: "
            f"{best_metrics['r2']:.4f}"
        )

        print(
            "Residuo promedio: "
            f"{best_metrics['mean_residual']:.4f}"
        )

        print(
            "Error absoluto máximo: "
            f"{best_metrics['maximum_absolute_error']:.4f}"
        )

        print("\nArchivos generados:")
        print(f"- {BEST_MODEL_PATH}")
        print(f"- {TUNING_RESULTS_PATH}")
        print(f"- {BEST_METRICS_PATH}")
        print(f"- {BEST_PREDICTIONS_PATH}")

        print(
            "\nEl conjunto de prueba continúa "
            "sin utilizarse."
        )

    except Exception as error:
        print(
            "\nError durante el ajuste "
            "de regresión:"
        )
        print(error)
        sys.exit(1)


if __name__ == "__main__":
    main()