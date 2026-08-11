"""
Entrenamiento inicial del clasificador de riesgo de VitalMind AI.

Modelos comparados:
- Regresión Logística.
- Random Forest Classifier.

El script:
- carga los conjuntos temporales;
- selecciona variables sin fuga de información;
- construye pipelines reproducibles;
- entrena los modelos;
- evalúa sobre validación;
- guarda métricas, predicciones y modelos provisionales.

Los resultados corresponden a datos sintéticos y no representan
una validación clínica.
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

RISK_ORDER = [
    "low",
    "medium",
    "high",
]

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

TRAIN_DATA_PATH = (
    MODEL_DATA_DIR
    / "train_model.csv"
)

VALIDATION_DATA_PATH = (
    MODEL_DATA_DIR
    / "validation_model.csv"
)

TEST_DATA_PATH = (
    MODEL_DATA_DIR
    / "test_model.csv"
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

LOGISTIC_MODEL_PATH = (
    MODELS_DIR
    / "logistic_regression_pipeline.joblib"
)

RANDOM_FOREST_MODEL_PATH = (
    MODELS_DIR
    / "random_forest_pipeline.joblib"
)

LABEL_ENCODER_PATH = (
    MODELS_DIR
    / "risk_label_encoder.joblib"
)

METRICS_PATH = (
    REPORTS_DIR
    / "safe_validation_metrics.json"
)

PREDICTIONS_PATH = (
    REPORTS_DIR
    / "safe_validation_predictions.csv"
)

COMPARISON_PATH = (
    REPORTS_DIR
    / "safe_model_comparison.csv"
)

# ============================================================
# 3. CARGA Y VALIDACIÓN
# ============================================================

def load_dataset(path: Path) -> pd.DataFrame:
    """Carga un conjunto de datos desde CSV."""
    if not path.exists():
        raise FileNotFoundError(
            f"No se encontró el archivo esperado:\n{path}"
        )

    return pd.read_csv(
        path,
        parse_dates=["log_date"],
    )


def validate_dataset(
    dataset: pd.DataFrame,
    dataset_name: str,
) -> list[str]:
    """Valida las columnas necesarias para entrenamiento."""
    errors: list[str] = []

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
        errors.append(
            f"{dataset_name}: faltan columnas: "
            f"{missing_columns}"
        )

        return errors

    if dataset.empty:
        errors.append(
            f"{dataset_name}: el conjunto está vacío."
        )

    if dataset[FEATURE_COLUMNS].isna().any().any():
        missing_counts = (
            dataset[FEATURE_COLUMNS]
            .isna()
            .sum()
        )

        affected_columns = (
            missing_counts[missing_counts > 0]
            .to_dict()
        )

        errors.append(
            f"{dataset_name}: existen valores faltantes "
            f"en las características: {affected_columns}"
        )

    if dataset[TARGET_COLUMN].isna().any():
        errors.append(
            f"{dataset_name}: existen valores faltantes "
            f"en {TARGET_COLUMN}."
        )

    invalid_labels = (
        set(dataset[TARGET_COLUMN].unique())
        - set(RISK_ORDER)
    )

    if invalid_labels:
        errors.append(
            f"{dataset_name}: etiquetas inválidas: "
            f"{sorted(invalid_labels)}"
        )

    return errors


# ============================================================
# 4. PREPARACIÓN
# ============================================================

def prepare_features_and_target(
    dataset: pd.DataFrame,
    label_encoder: LabelEncoder,
    fit_encoder: bool,
) -> tuple[pd.DataFrame, pd.Series]:
    """Separa características y codifica la variable objetivo."""
    features = dataset[
        FEATURE_COLUMNS
    ].copy()

    raw_target = dataset[
        TARGET_COLUMN
    ].astype(str)

    if fit_encoder:
        target = label_encoder.fit_transform(
            raw_target
        )
    else:
        target = label_encoder.transform(
            raw_target
        )

    return features, pd.Series(
        target,
        index=dataset.index,
        name=TARGET_COLUMN,
    )


def build_preprocessor(
    scale_numeric: bool,
) -> ColumnTransformer:
    """Construye el preprocesador según el modelo."""
    if scale_numeric:
        numeric_transformer: Any = StandardScaler()
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

def build_logistic_pipeline() -> Pipeline:
    """Construye el pipeline de Regresión Logística."""
    preprocessor = build_preprocessor(
        scale_numeric=True,
    )

    classifier = LogisticRegression(
        max_iter=2000,
        class_weight="balanced",
        random_state=RANDOM_SEED,
        solver="lbfgs",
    )

    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", classifier),
        ]
    )


def build_random_forest_pipeline() -> Pipeline:
    """Construye el pipeline de Random Forest."""
    preprocessor = build_preprocessor(
        scale_numeric=False,
    )

    classifier = RandomForestClassifier(
        n_estimators=400,
        max_depth=None,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=RANDOM_SEED,
        n_jobs=-1,
    )

    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", classifier),
        ]
    )


# ============================================================
# 6. EVALUACIÓN
# ============================================================

def calculate_multiclass_roc_auc(
    y_true: pd.Series,
    probabilities: Any,
) -> float | None:
    """Calcula ROC-AUC multiclase cuando sea posible."""
    try:
        return float(
            roc_auc_score(
                y_true,
                probabilities,
                multi_class="ovr",
                average="weighted",
            )
        )
    except ValueError:
        return None


def evaluate_model(
    model_name: str,
    pipeline: Pipeline,
    x_validation: pd.DataFrame,
    y_validation: pd.Series,
    label_encoder: LabelEncoder,
) -> tuple[dict[str, Any], pd.DataFrame]:
    """Evalúa un pipeline sobre validación."""
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

    roc_auc_weighted = (
        calculate_multiclass_roc_auc(
            y_true=y_validation,
            probabilities=probabilities,
        )
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

    metrics = {
        "model": model_name,
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
            roc_auc_weighted
        ),
        "classification_report": report,
        "confusion_matrix": matrix.tolist(),
        "classes": (
            label_encoder.classes_.tolist()
        ),
    }

    prediction_data = pd.DataFrame(
        {
            "actual_encoded": y_validation,
            "predicted_encoded": predictions,
            "actual_risk_level": (
                label_encoder.inverse_transform(
                    y_validation
                )
            ),
            "predicted_risk_level": (
                label_encoder.inverse_transform(
                    predictions
                )
            ),
            "model": model_name,
        },
        index=x_validation.index,
    )

    for class_index, class_name in enumerate(
        label_encoder.classes_
    ):
        prediction_data[
            f"probability_{class_name}"
        ] = probabilities[:, class_index]

    return metrics, prediction_data


# ============================================================
# 7. PRESENTACIÓN DE RESULTADOS
# ============================================================

def print_model_results(
    metrics: dict[str, Any],
) -> None:
    """Muestra las métricas principales."""
    print("\n" + "=" * 65)
    print(f"Modelo: {metrics['model']}")
    print("=" * 65)

    print(
        f"Accuracy:           "
        f"{metrics['accuracy']:.4f}"
    )

    print(
        f"Precision weighted: "
        f"{metrics['precision_weighted']:.4f}"
    )

    print(
        f"Recall weighted:    "
        f"{metrics['recall_weighted']:.4f}"
    )

    print(
        f"F1 weighted:        "
        f"{metrics['f1_weighted']:.4f}"
    )

    print(
        f"F1 macro:           "
        f"{metrics['f1_macro']:.4f}"
    )

    roc_auc = metrics[
        "roc_auc_weighted_ovr"
    ]

    if roc_auc is not None:
        print(
            f"ROC-AUC weighted:   "
            f"{roc_auc:.4f}"
        )
    else:
        print(
            "ROC-AUC weighted:   "
            "No disponible"
        )

    print("\nMatriz de confusión:")

    matrix = pd.DataFrame(
        metrics["confusion_matrix"],
        index=metrics["classes"],
        columns=metrics["classes"],
    )

    print(matrix)

    print("\nReporte de clasificación:")

    report_dataframe = pd.DataFrame(
        metrics["classification_report"]
    ).T

    print(
        report_dataframe.round(4)
    )


def create_comparison_dataframe(
    all_metrics: list[dict[str, Any]],
) -> pd.DataFrame:
    """Construye una tabla resumida de comparación."""
    rows = []

    for metrics in all_metrics:
        rows.append(
            {
                "model": metrics["model"],
                "accuracy": metrics["accuracy"],
                "precision_weighted": (
                    metrics[
                        "precision_weighted"
                    ]
                ),
                "recall_weighted": (
                    metrics[
                        "recall_weighted"
                    ]
                ),
                "f1_weighted": (
                    metrics["f1_weighted"]
                ),
                "f1_macro": metrics["f1_macro"],
                "roc_auc_weighted_ovr": (
                    metrics[
                        "roc_auc_weighted_ovr"
                    ]
                ),
            }
        )

    comparison = pd.DataFrame(rows)

    return comparison.sort_values(
        by=[
            "f1_macro",
            "recall_weighted",
            "accuracy",
        ],
        ascending=False,
    ).reset_index(drop=True)


# ============================================================
# 8. EXPORTACIÓN
# ============================================================

def create_output_directories() -> None:
    """Crea los directorios necesarios."""
    MODELS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    REPORTS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )


def save_results(
    logistic_pipeline: Pipeline,
    random_forest_pipeline: Pipeline,
    label_encoder: LabelEncoder,
    all_metrics: list[dict[str, Any]],
    all_predictions: pd.DataFrame,
    comparison: pd.DataFrame,
) -> None:
    """Guarda modelos, métricas y predicciones."""
    create_output_directories()

    joblib.dump(
        logistic_pipeline,
        LOGISTIC_MODEL_PATH,
    )

    joblib.dump(
        random_forest_pipeline,
        RANDOM_FOREST_MODEL_PATH,
    )

    joblib.dump(
        label_encoder,
        LABEL_ENCODER_PATH,
    )

    with METRICS_PATH.open(
        "w",
        encoding="utf-8",
    ) as metrics_file:
        json.dump(
            all_metrics,
            metrics_file,
            ensure_ascii=False,
            indent=2,
        )

    all_predictions.to_csv(
        PREDICTIONS_PATH,
        index=False,
        encoding="utf-8-sig",
    )

    comparison.to_csv(
        COMPARISON_PATH,
        index=False,
        encoding="utf-8-sig",
    )


# ============================================================
# 9. EJECUCIÓN
# ============================================================

def main() -> None:
    """Ejecuta el entrenamiento inicial."""
    try:
        train_dataset = load_dataset(
            TRAIN_DATA_PATH
        )

        validation_dataset = load_dataset(
            VALIDATION_DATA_PATH
        )

        test_dataset = load_dataset(
            TEST_DATA_PATH
        )

        all_errors: list[str] = []

        for name, dataset in [
            ("Entrenamiento", train_dataset),
            ("Validación", validation_dataset),
            ("Prueba", test_dataset),
        ]:
            all_errors.extend(
                validate_dataset(
                    dataset=dataset,
                    dataset_name=name,
                )
            )

        if all_errors:
            print(
                "\nNo fue posible iniciar "
                "el entrenamiento:\n"
            )

            for error in all_errors:
                print(f"- {error}")

            sys.exit(1)

        label_encoder = LabelEncoder()

        x_train, y_train = (
            prepare_features_and_target(
                dataset=train_dataset,
                label_encoder=label_encoder,
                fit_encoder=True,
            )
        )

        x_validation, y_validation = (
            prepare_features_and_target(
                dataset=validation_dataset,
                label_encoder=label_encoder,
                fit_encoder=False,
            )
        )

        print("\nEntrenamiento inicial")
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
            f"Variables numéricas: "
            f"{len(NUMERIC_FEATURES)}"
        )
        print(
            f"Variables categóricas: "
            f"{len(CATEGORICAL_FEATURES)}"
        )
        print(
            "Clases codificadas: "
            f"{dict(zip(label_encoder.classes_, label_encoder.transform(label_encoder.classes_)))}"
        )

        logistic_pipeline = (
            build_logistic_pipeline()
        )

        random_forest_pipeline = (
            build_random_forest_pipeline()
        )

        models = [
            (
                "logistic_regression",
                logistic_pipeline,
            ),
            (
                "random_forest",
                random_forest_pipeline,
            ),
        ]

        all_metrics: list[dict[str, Any]] = []
        all_predictions: list[pd.DataFrame] = []

        for model_name, pipeline in models:
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
                    label_encoder=label_encoder,
                )
            )

            all_metrics.append(metrics)
            all_predictions.append(predictions)

            print_model_results(metrics)

        comparison = (
            create_comparison_dataframe(
                all_metrics
            )
        )

        combined_predictions = pd.concat(
            all_predictions,
            ignore_index=True,
        )

        save_results(
            logistic_pipeline=logistic_pipeline,
            random_forest_pipeline=(
                random_forest_pipeline
            ),
            label_encoder=label_encoder,
            all_metrics=all_metrics,
            all_predictions=(
                combined_predictions
            ),
            comparison=comparison,
        )

        print("\n" + "=" * 65)
        print("Comparación inicial")
        print("=" * 65)
        print(
            comparison.round(4).to_string(
                index=False
            )
        )

        provisional_best_model = (
            comparison.iloc[0]["model"]
        )

        print(
            "\nMejor modelo provisional "
            "según F1 macro:"
        )
        print(provisional_best_model)

        print("\nArchivos generados:")
        print(f"- {LOGISTIC_MODEL_PATH}")
        print(f"- {RANDOM_FOREST_MODEL_PATH}")
        print(f"- {LABEL_ENCODER_PATH}")
        print(f"- {METRICS_PATH}")
        print(f"- {PREDICTIONS_PATH}")
        print(f"- {COMPARISON_PATH}")

        print(
            "\nEl conjunto de prueba no fue "
            "utilizado durante esta etapa."
        )

    except Exception as error:
        print(
            "\nOcurrió un error durante "
            "el entrenamiento:"
        )
        print(error)
        sys.exit(1)


if __name__ == "__main__":
    main()