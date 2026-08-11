"""
Entrenamiento inicial del modelo de regresión de bienestar
para VitalMind AI.

Modelos comparados:
- Dummy Regressor.
- Ridge Regression.
- Random Forest Regressor.

El script utiliza los conjuntos temporales seguros preparados
previamente y recupera wellbeing_score desde el dataset crudo.

El conjunto de prueba se carga y valida, pero no se utiliza
durante la selección inicial.
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
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
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

TEST_PATH = (
    MODEL_DATA_DIR
    / "test_model.csv"
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

DUMMY_MODEL_PATH = (
    MODELS_DIR
    / "dummy_regressor_pipeline.joblib"
)

RIDGE_MODEL_PATH = (
    MODELS_DIR
    / "ridge_regressor_pipeline.joblib"
)

FOREST_MODEL_PATH = (
    MODELS_DIR
    / "random_forest_regressor_pipeline.joblib"
)

METRICS_PATH = (
    REPORTS_DIR
    / "initial_validation_metrics.json"
)

COMPARISON_PATH = (
    REPORTS_DIR
    / "initial_model_comparison.csv"
)

PREDICTIONS_PATH = (
    REPORTS_DIR
    / "validation_predictions.csv"
)


# ============================================================
# 3. CARGA Y PREPARACIÓN
# ============================================================

def load_csv(
    path: Path,
    parse_dates: bool = True,
) -> pd.DataFrame:
    """Carga un archivo CSV."""
    if not path.exists():
        raise FileNotFoundError(
            f"No se encontró el archivo esperado:\n{path}"
        )

    if parse_dates:
        return pd.read_csv(
            path,
            parse_dates=["log_date"],
        )

    return pd.read_csv(path)


def load_target_data() -> pd.DataFrame:
    """
    Recupera record_id y wellbeing_score desde el dataset crudo.

    Las variables derivadas utilizadas para construir el objetivo
    no se incorporan como características.
    """
    raw_dataset = load_csv(
        RAW_DATA_PATH,
        parse_dates=True,
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
            "El dataset crudo no contiene las columnas "
            f"requeridas: {missing_columns}"
        )

    target_data = raw_dataset[
        required_columns
    ].copy()

    if target_data["record_id"].duplicated().any():
        raise ValueError(
            "Existen record_id duplicados en el dataset crudo."
        )

    target_data[TARGET_COLUMN] = pd.to_numeric(
        target_data[TARGET_COLUMN],
        errors="coerce",
    )

    if target_data[TARGET_COLUMN].isna().any():
        missing_targets = int(
            target_data[TARGET_COLUMN]
            .isna()
            .sum()
        )

        raise ValueError(
            f"Existen {missing_targets} valores faltantes "
            f"en {TARGET_COLUMN}."
        )

    return target_data


def attach_target(
    dataset: pd.DataFrame,
    target_data: pd.DataFrame,
    dataset_name: str,
) -> pd.DataFrame:
    """Une el objetivo mediante record_id."""
    if "record_id" not in dataset.columns:
        raise ValueError(
            f"{dataset_name}: falta record_id."
        )

    result = dataset.merge(
        target_data,
        on="record_id",
        how="left",
        validate="one_to_one",
    )

    if result[TARGET_COLUMN].isna().any():
        missing_targets = int(
            result[TARGET_COLUMN]
            .isna()
            .sum()
        )

        raise ValueError(
            f"{dataset_name}: no fue posible recuperar "
            f"{missing_targets} objetivos."
        )

    return result


def validate_dataset(
    dataset: pd.DataFrame,
    dataset_name: str,
) -> None:
    """Valida las columnas y calidad del conjunto."""
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
            f"{dataset_name}: el conjunto está vacío."
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
# 4. PREPROCESAMIENTO
# ============================================================

def build_preprocessor(
    scale_numeric: bool,
) -> ColumnTransformer:
    """Construye el preprocesador del modelo."""
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


# ============================================================
# 5. MODELOS
# ============================================================

def build_dummy_pipeline() -> Pipeline:
    """Construye el modelo de referencia."""
    return Pipeline(
        steps=[
            (
                "preprocessor",
                build_preprocessor(
                    scale_numeric=False,
                ),
            ),
            (
                "regressor",
                DummyRegressor(
                    strategy="mean",
                ),
            ),
        ]
    )


def build_ridge_pipeline() -> Pipeline:
    """Construye el modelo Ridge."""
    return Pipeline(
        steps=[
            (
                "preprocessor",
                build_preprocessor(
                    scale_numeric=True,
                ),
            ),
            (
                "regressor",
                Ridge(
                    alpha=1.0,
                ),
            ),
        ]
    )


def build_forest_pipeline() -> Pipeline:
    """Construye Random Forest Regressor."""
    return Pipeline(
        steps=[
            (
                "preprocessor",
                build_preprocessor(
                    scale_numeric=False,
                ),
            ),
            (
                "regressor",
                RandomForestRegressor(
                    n_estimators=400,
                    max_depth=None,
                    min_samples_split=4,
                    min_samples_leaf=2,
                    random_state=RANDOM_SEED,
                    n_jobs=-1,
                ),
            ),
        ]
    )


# ============================================================
# 6. EVALUACIÓN
# ============================================================

def evaluate_model(
    model_name: str,
    pipeline: Pipeline,
    x_validation: pd.DataFrame,
    y_validation: pd.Series,
) -> tuple[dict[str, Any], pd.DataFrame]:
    """Evalúa un modelo sobre validación."""
    predictions = pipeline.predict(
        x_validation
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

    residuals = (
        y_validation.to_numpy()
        - predictions
    )

    metrics = {
        "model": model_name,
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
        "minimum_prediction": float(
            predictions.min()
        ),
        "maximum_prediction": float(
            predictions.max()
        ),
    }

    prediction_data = pd.DataFrame(
        {
            "actual_wellbeing_score": (
                y_validation.to_numpy()
            ),
            "predicted_wellbeing_score": (
                predictions
            ),
            "residual": residuals,
            "absolute_error": (
                np.abs(residuals)
            ),
            "model": model_name,
        },
        index=y_validation.index,
    )

    return metrics, prediction_data


def create_comparison(
    metrics: list[dict[str, Any]],
) -> pd.DataFrame:
    """Crea la tabla comparativa."""
    comparison = pd.DataFrame(
        [
            {
                "model": item["model"],
                "mae": item["mae"],
                "rmse": item["rmse"],
                "r2": item["r2"],
                "mean_residual": (
                    item["mean_residual"]
                ),
            }
            for item in metrics
        ]
    )

    return comparison.sort_values(
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
    ).reset_index(drop=True)


def print_metrics(
    metrics: dict[str, Any],
) -> None:
    """Muestra las métricas del modelo."""
    print("\n" + "=" * 65)
    print(f"Modelo: {metrics['model']}")
    print("=" * 65)

    print(
        f"MAE:  {metrics['mae']:.4f}"
    )

    print(
        f"RMSE: {metrics['rmse']:.4f}"
    )

    print(
        f"R²:   {metrics['r2']:.4f}"
    )

    print(
        "Residuo promedio: "
        f"{metrics['mean_residual']:.4f}"
    )

    print(
        "Rango de predicciones: "
        f"{metrics['minimum_prediction']:.2f} "
        f"a {metrics['maximum_prediction']:.2f}"
    )


# ============================================================
# 7. EXPORTACIÓN
# ============================================================

def save_outputs(
    models: dict[str, Pipeline],
    metrics: list[dict[str, Any]],
    predictions: pd.DataFrame,
    comparison: pd.DataFrame,
) -> None:
    """Guarda modelos y resultados."""
    MODELS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    REPORTS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    joblib.dump(
        models["dummy_regressor"],
        DUMMY_MODEL_PATH,
    )

    joblib.dump(
        models["ridge_regression"],
        RIDGE_MODEL_PATH,
    )

    joblib.dump(
        models["random_forest_regressor"],
        FOREST_MODEL_PATH,
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

    comparison.to_csv(
        COMPARISON_PATH,
        index=False,
        encoding="utf-8-sig",
    )

    predictions.to_csv(
        PREDICTIONS_PATH,
        index=False,
        encoding="utf-8-sig",
    )


# ============================================================
# 8. EJECUCIÓN
# ============================================================

def main() -> None:
    """Ejecuta el entrenamiento inicial."""
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

        test_dataset = attach_target(
            load_csv(TEST_PATH),
            target_data,
            "Prueba",
        )

        for name, dataset in [
            ("Entrenamiento", train_dataset),
            ("Validación", validation_dataset),
            ("Prueba", test_dataset),
        ]:
            validate_dataset(
                dataset,
                name,
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

        print("\nEntrenamiento inicial de regresión")
        print("=" * 65)

        print(
            f"Registros de entrenamiento: "
            f"{len(x_train)}"
        )

        print(
            f"Registros de validación: "
            f"{len(x_validation)}"
        )

        print(
            f"Registros reservados en prueba: "
            f"{len(test_dataset)}"
        )

        print(
            "Rango de wellbeing_score en train: "
            f"{y_train.min():.2f} "
            f"a {y_train.max():.2f}"
        )

        models = {
            "dummy_regressor": (
                build_dummy_pipeline()
            ),
            "ridge_regression": (
                build_ridge_pipeline()
            ),
            "random_forest_regressor": (
                build_forest_pipeline()
            ),
        }

        all_metrics: list[
            dict[str, Any]
        ] = []

        all_predictions: list[
            pd.DataFrame
        ] = []

        for model_name, pipeline in (
            models.items()
        ):
            print(
                f"\nEntrenando {model_name}..."
            )

            pipeline.fit(
                x_train,
                y_train,
            )

            metrics, predictions = (
                evaluate_model(
                    model_name=model_name,
                    pipeline=pipeline,
                    x_validation=x_validation,
                    y_validation=y_validation,
                )
            )

            all_metrics.append(metrics)
            all_predictions.append(
                predictions
            )

            print_metrics(metrics)

        comparison = create_comparison(
            all_metrics
        )

        combined_predictions = pd.concat(
            all_predictions,
            ignore_index=True,
        )

        save_outputs(
            models=models,
            metrics=all_metrics,
            predictions=combined_predictions,
            comparison=comparison,
        )

        print("\n" + "=" * 65)
        print("COMPARACIÓN INICIAL DE REGRESIÓN")
        print("=" * 65)

        print(
            comparison.round(4).to_string(
                index=False
            )
        )

        best_model = (
            comparison.iloc[0]["model"]
        )

        print(
            "\nMejor modelo provisional "
            "según MAE:"
        )

        print(best_model)

        print("\nArchivos generados:")
        print(f"- {DUMMY_MODEL_PATH}")
        print(f"- {RIDGE_MODEL_PATH}")
        print(f"- {FOREST_MODEL_PATH}")
        print(f"- {METRICS_PATH}")
        print(f"- {COMPARISON_PATH}")
        print(f"- {PREDICTIONS_PATH}")

        print(
            "\nEl conjunto de prueba continúa "
            "sin utilizarse para evaluación."
        )

    except Exception as error:
        print(
            "\nError durante el entrenamiento "
            "de regresión:"
        )

        print(error)
        sys.exit(1)


if __name__ == "__main__":
    main()