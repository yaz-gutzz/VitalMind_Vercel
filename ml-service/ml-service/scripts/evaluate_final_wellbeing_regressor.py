"""
Evaluación final del modelo de regresión de bienestar
de VitalMind AI.

Este script:
- carga el mejor regresor ya seleccionado;
- utiliza una sola vez el conjunto de prueba;
- calcula métricas finales de regresión;
- guarda predicciones y análisis de errores;
- no vuelve a ajustar el modelo.

Los resultados provienen de datos sintéticos y no representan
una validación clínica.
"""

from __future__ import annotations

from pathlib import Path
import json
import sys
from typing import Any

import joblib
import numpy as np
import pandas as pd

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    median_absolute_error,
    r2_score,
)


# ============================================================
# 1. CONFIGURACIÓN
# ============================================================

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

TEST_PATH = (
    MODEL_DATA_DIR
    / "test_model.csv"
)

MODEL_PATH = (
    ML_SERVICE_DIR
    / "app"
    / "models"
    / "wellbeing-regression"
    / "best_wellbeing_regressor.joblib"
)

REPORTS_DIR = (
    ML_SERVICE_DIR
    / "reports"
    / "regression"
)

FINAL_METRICS_PATH = (
    REPORTS_DIR
    / "final_test_metrics.json"
)

FINAL_PREDICTIONS_PATH = (
    REPORTS_DIR
    / "final_test_predictions.csv"
)

FINAL_ERROR_SUMMARY_PATH = (
    REPORTS_DIR
    / "final_test_error_summary.csv"
)


# ============================================================
# 3. CARGA DE DATOS
# ============================================================

def load_csv(
    path: Path,
) -> pd.DataFrame:
    """Carga un archivo CSV."""
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
            f"Existen valores inválidos en {TARGET_COLUMN}."
        )

    return target_data


def attach_target(
    dataset: pd.DataFrame,
    target_data: pd.DataFrame,
) -> pd.DataFrame:
    """Une el conjunto de prueba con su objetivo."""
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
            "No fue posible recuperar "
            f"{missing_targets} objetivos."
        )

    return result


def validate_test_dataset(
    dataset: pd.DataFrame,
) -> None:
    """Valida la calidad del conjunto de prueba."""
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
            "Faltan columnas en el conjunto de prueba: "
            f"{missing_columns}"
        )

    if dataset.empty:
        raise ValueError(
            "El conjunto de prueba está vacío."
        )

    missing_values = int(
        dataset[required_columns]
        .isna()
        .sum()
        .sum()
    )

    if missing_values > 0:
        raise ValueError(
            "El conjunto de prueba conserva "
            f"{missing_values} valores faltantes."
        )


# ============================================================
# 4. CARGA DEL MODELO
# ============================================================

def load_model() -> Any:
    """Carga el modelo de regresión seleccionado."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            "No se encontró el mejor regresor:\n"
            f"{MODEL_PATH}"
        )

    return joblib.load(
        MODEL_PATH
    )


# ============================================================
# 5. MÉTRICAS
# ============================================================

def calculate_metrics(
    y_true: pd.Series,
    predictions: np.ndarray,
) -> dict[str, Any]:
    """Calcula métricas finales de regresión."""
    residuals = (
        y_true.to_numpy()
        - predictions
    )

    absolute_errors = np.abs(
        residuals
    )

    squared_errors = np.square(
        residuals
    )

    mae = mean_absolute_error(
        y_true,
        predictions,
    )

    mse = mean_squared_error(
        y_true,
        predictions,
    )

    rmse = float(
        np.sqrt(mse)
    )

    median_ae = median_absolute_error(
        y_true,
        predictions,
    )

    r2 = r2_score(
        y_true,
        predictions,
    )

    return {
        "evaluation_stage": "final_test",
        "model": "ridge_regression",
        "parameters": {
            "alpha": 10.0,
        },
        "dataset": "test_model.csv",
        "records": int(
            len(y_true)
        ),
        "mae": float(mae),
        "mse": float(mse),
        "rmse": rmse,
        "median_absolute_error": float(
            median_ae
        ),
        "r2": float(r2),
        "mean_residual": float(
            residuals.mean()
        ),
        "residual_standard_deviation": float(
            residuals.std()
        ),
        "minimum_residual": float(
            residuals.min()
        ),
        "maximum_residual": float(
            residuals.max()
        ),
        "minimum_absolute_error": float(
            absolute_errors.min()
        ),
        "maximum_absolute_error": float(
            absolute_errors.max()
        ),
        "error_percentiles": {
            "p25": float(
                np.percentile(
                    absolute_errors,
                    25,
                )
            ),
            "p50": float(
                np.percentile(
                    absolute_errors,
                    50,
                )
            ),
            "p75": float(
                np.percentile(
                    absolute_errors,
                    75,
                )
            ),
            "p90": float(
                np.percentile(
                    absolute_errors,
                    90,
                )
            ),
            "p95": float(
                np.percentile(
                    absolute_errors,
                    95,
                )
            ),
        },
        "actual_range": {
            "minimum": float(
                y_true.min()
            ),
            "maximum": float(
                y_true.max()
            ),
        },
        "prediction_range": {
            "minimum": float(
                predictions.min()
            ),
            "maximum": float(
                predictions.max()
            ),
        },
        "mean_squared_error_manual": float(
            squared_errors.mean()
        ),
        "limitations": [
            "Synthetic target",
            "Not clinically validated",
            "Test set used once after model selection",
        ],
    }


# ============================================================
# 6. PREDICCIONES Y RESUMEN
# ============================================================

def create_predictions_dataframe(
    test_dataset: pd.DataFrame,
    y_true: pd.Series,
    predictions: np.ndarray,
) -> pd.DataFrame:
    """Construye las predicciones finales."""
    residuals = (
        y_true.to_numpy()
        - predictions
    )

    result = pd.DataFrame(
        {
            "record_id": test_dataset[
                "record_id"
            ].values,
            "user_id": test_dataset[
                "user_id"
            ].values,
            "log_date": test_dataset[
                "log_date"
            ].values,
            "actual_wellbeing_score": (
                y_true.to_numpy()
            ),
            "predicted_wellbeing_score": (
                predictions
            ),
            "residual": residuals,
            "absolute_error": np.abs(
                residuals
            ),
            "squared_error": np.square(
                residuals
            ),
        }
    )

    result["error_direction"] = np.where(
        result["residual"] > 0,
        "underestimation",
        np.where(
            result["residual"] < 0,
            "overestimation",
            "exact",
        ),
    )

    return result


def create_error_summary(
    predictions: pd.DataFrame,
) -> pd.DataFrame:
    """Resume los errores por intervalos."""
    bins = [
        0,
        2,
        5,
        10,
        float("inf"),
    ]

    labels = [
        "0_to_2",
        "more_than_2_to_5",
        "more_than_5_to_10",
        "more_than_10",
    ]

    error_groups = pd.cut(
        predictions["absolute_error"],
        bins=bins,
        labels=labels,
        include_lowest=True,
        right=True,
    )

    summary = (
        predictions
        .assign(
            error_interval=error_groups
        )
        .groupby(
            "error_interval",
            observed=False,
        )
        .agg(
            records=(
                "absolute_error",
                "size",
            ),
            mean_absolute_error=(
                "absolute_error",
                "mean",
            ),
            maximum_absolute_error=(
                "absolute_error",
                "max",
            ),
        )
        .reset_index()
    )

    summary["percentage"] = (
        summary["records"]
        / len(predictions)
        * 100
    )

    return summary


# ============================================================
# 7. EXPORTACIÓN
# ============================================================

def save_outputs(
    metrics: dict[str, Any],
    predictions: pd.DataFrame,
    error_summary: pd.DataFrame,
) -> None:
    """Guarda los resultados finales."""
    REPORTS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    with FINAL_METRICS_PATH.open(
        "w",
        encoding="utf-8",
    ) as metrics_file:
        json.dump(
            metrics,
            metrics_file,
            ensure_ascii=False,
            indent=2,
        )

    predictions.to_csv(
        FINAL_PREDICTIONS_PATH,
        index=False,
        encoding="utf-8-sig",
    )

    error_summary.to_csv(
        FINAL_ERROR_SUMMARY_PATH,
        index=False,
        encoding="utf-8-sig",
    )


# ============================================================
# 8. PRESENTACIÓN
# ============================================================

def print_results(
    metrics: dict[str, Any],
    error_summary: pd.DataFrame,
) -> None:
    """Muestra los resultados finales."""
    print("\n" + "=" * 65)
    print("EVALUACIÓN FINAL DEL REGRESOR DE BIENESTAR")
    print("=" * 65)

    print(
        f"Modelo: "
        f"{metrics['model']}"
    )

    print(
        f"Parámetros: "
        f"{metrics['parameters']}"
    )

    print(
        f"Registros de prueba: "
        f"{metrics['records']}"
    )

    print(
        f"MAE: "
        f"{metrics['mae']:.4f}"
    )

    print(
        f"RMSE: "
        f"{metrics['rmse']:.4f}"
    )

    print(
        "Mediana del error absoluto: "
        f"{metrics['median_absolute_error']:.4f}"
    )

    print(
        f"R²: "
        f"{metrics['r2']:.4f}"
    )

    print(
        "Residuo promedio: "
        f"{metrics['mean_residual']:.4f}"
    )

    print(
        "Error absoluto máximo: "
        f"{metrics['maximum_absolute_error']:.4f}"
    )

    print("\nPercentiles del error absoluto:")

    for percentile, value in (
        metrics["error_percentiles"].items()
    ):
        print(
            f"- {percentile}: "
            f"{value:.4f}"
        )

    print("\nDistribución de errores:")

    print(
        error_summary
        .round(4)
        .to_string(index=False)
    )


# ============================================================
# 9. EJECUCIÓN
# ============================================================

def main() -> None:
    """Ejecuta la evaluación final."""
    try:
        target_data = load_target_data()

        test_dataset = attach_target(
            load_csv(TEST_PATH),
            target_data,
        )

        validate_test_dataset(
            test_dataset
        )

        model = load_model()

        x_test = test_dataset[
            FEATURE_COLUMNS
        ].copy()

        y_test = test_dataset[
            TARGET_COLUMN
        ].copy()

        predictions = model.predict(
            x_test
        )

        metrics = calculate_metrics(
            y_true=y_test,
            predictions=predictions,
        )

        prediction_results = (
            create_predictions_dataframe(
                test_dataset=test_dataset,
                y_true=y_test,
                predictions=predictions,
            )
        )

        error_summary = (
            create_error_summary(
                prediction_results
            )
        )

        save_outputs(
            metrics=metrics,
            predictions=prediction_results,
            error_summary=error_summary,
        )

        print_results(
            metrics=metrics,
            error_summary=error_summary,
        )

        print("\nArchivos generados:")
        print(f"- {FINAL_METRICS_PATH}")
        print(f"- {FINAL_PREDICTIONS_PATH}")
        print(
            f"- {FINAL_ERROR_SUMMARY_PATH}"
        )

        print(
            "\nLa evaluación final se realizó "
            "sin modificar el modelo."
        )

        print(
            "El conjunto de prueba no deberá "
            "usarse para nuevos ajustes."
        )

    except Exception as error:
        print(
            "\nError durante la evaluación "
            "final del regresor:"
        )

        print(error)
        sys.exit(1)


if __name__ == "__main__":
    main()