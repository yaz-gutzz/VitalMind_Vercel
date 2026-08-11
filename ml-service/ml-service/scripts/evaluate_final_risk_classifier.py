"""
Evaluación final del clasificador de riesgo de VitalMind AI.

Este script:
- carga el modelo seguro seleccionado previamente;
- utiliza exclusivamente el conjunto de prueba;
- calcula las métricas finales;
- exporta predicciones y resultados;
- no modifica ni vuelve a ajustar el modelo.

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

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)


# ============================================================
# 1. CONFIGURACIÓN
# ============================================================

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

TEST_DATA_PATH = (
    ML_SERVICE_DIR
    / "data"
    / "modeling"
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

MODEL_PATH = (
    MODELS_DIR
    / "best_risk_classifier_safe.joblib"
)

LABEL_ENCODER_PATH = (
    MODELS_DIR
    / "risk_label_encoder.joblib"
)

FINAL_METRICS_PATH = (
    REPORTS_DIR
    / "final_test_metrics.json"
)

FINAL_PREDICTIONS_PATH = (
    REPORTS_DIR
    / "final_test_predictions.csv"
)

FINAL_CONFUSION_MATRIX_PATH = (
    REPORTS_DIR
    / "final_test_confusion_matrix.csv"
)


# ============================================================
# 3. CARGA Y VALIDACIÓN
# ============================================================

def load_test_dataset() -> pd.DataFrame:
    """Carga el conjunto de prueba final."""
    if not TEST_DATA_PATH.exists():
        raise FileNotFoundError(
            "No se encontró el conjunto de prueba:\n"
            f"{TEST_DATA_PATH}"
        )

    return pd.read_csv(
        TEST_DATA_PATH,
        parse_dates=["log_date"],
    )


def validate_test_dataset(
    dataset: pd.DataFrame,
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
            "Faltan columnas en el conjunto de prueba: "
            f"{missing_columns}"
        )

    if dataset.empty:
        raise ValueError(
            "El conjunto de prueba está vacío."
        )

    missing_values = dataset[
        required_columns
    ].isna().sum().sum()

    if missing_values > 0:
        raise ValueError(
            "El conjunto de prueba conserva "
            f"{missing_values} valores faltantes."
        )


def load_artifacts() -> tuple[Any, Any]:
    """Carga el pipeline final y el codificador."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            "No se encontró el modelo seleccionado:\n"
            f"{MODEL_PATH}"
        )

    if not LABEL_ENCODER_PATH.exists():
        raise FileNotFoundError(
            "No se encontró el LabelEncoder:\n"
            f"{LABEL_ENCODER_PATH}"
        )

    model = joblib.load(MODEL_PATH)
    label_encoder = joblib.load(
        LABEL_ENCODER_PATH
    )

    return model, label_encoder


# ============================================================
# 4. EVALUACIÓN
# ============================================================

def calculate_final_metrics(
    y_true: pd.Series,
    predictions: Any,
    probabilities: Any,
    label_encoder: Any,
) -> dict[str, Any]:
    """Calcula las métricas finales."""
    accuracy = accuracy_score(
        y_true,
        predictions,
    )

    precision_weighted = precision_score(
        y_true,
        predictions,
        average="weighted",
        zero_division=0,
    )

    recall_weighted = recall_score(
        y_true,
        predictions,
        average="weighted",
        zero_division=0,
    )

    f1_weighted = f1_score(
        y_true,
        predictions,
        average="weighted",
        zero_division=0,
    )

    precision_macro = precision_score(
        y_true,
        predictions,
        average="macro",
        zero_division=0,
    )

    recall_macro = recall_score(
        y_true,
        predictions,
        average="macro",
        zero_division=0,
    )

    f1_macro = f1_score(
        y_true,
        predictions,
        average="macro",
        zero_division=0,
    )

    report = classification_report(
        y_true,
        predictions,
        target_names=label_encoder.classes_,
        output_dict=True,
        zero_division=0,
    )

    matrix = confusion_matrix(
        y_true,
        predictions,
    )

    try:
        roc_auc_weighted = roc_auc_score(
            y_true,
            probabilities,
            average="weighted",
            multi_class="ovr",
        )

        roc_auc_macro = roc_auc_score(
            y_true,
            probabilities,
            average="macro",
            multi_class="ovr",
        )

    except ValueError:
        roc_auc_weighted = None
        roc_auc_macro = None

    return {
        "evaluation_stage": "final_test",
        "model": "logistic_regression",
        "dataset": "test_model.csv",
        "records": int(len(y_true)),
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
        "precision_macro": float(
            precision_macro
        ),
        "recall_macro": float(
            recall_macro
        ),
        "f1_macro": float(f1_macro),
        "roc_auc_weighted_ovr": (
            float(roc_auc_weighted)
            if roc_auc_weighted is not None
            else None
        ),
        "roc_auc_macro_ovr": (
            float(roc_auc_macro)
            if roc_auc_macro is not None
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
        "limitations": [
            "Synthetic dataset",
            "Not clinically validated",
            "Test set used once after model selection",
        ],
    }


# ============================================================
# 5. EXPORTACIÓN
# ============================================================

def create_predictions_dataframe(
    test_dataset: pd.DataFrame,
    y_true: pd.Series,
    predictions: Any,
    probabilities: Any,
    label_encoder: Any,
) -> pd.DataFrame:
    """Construye el archivo de predicciones finales."""
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
            "actual_encoded": y_true.values,
            "predicted_encoded": predictions,
            "actual_risk_level": (
                label_encoder.inverse_transform(
                    y_true
                )
            ),
            "predicted_risk_level": (
                label_encoder.inverse_transform(
                    predictions
                )
            ),
        }
    )

    result["is_correct"] = (
        result["actual_risk_level"]
        == result["predicted_risk_level"]
    )

    for class_index, class_name in enumerate(
        label_encoder.classes_
    ):
        result[
            f"probability_{class_name}"
        ] = probabilities[:, class_index]

    probability_columns = [
        column
        for column in result.columns
        if column.startswith("probability_")
    ]

    result["prediction_confidence"] = (
        result[probability_columns]
        .max(axis=1)
    )

    return result


def save_outputs(
    metrics: dict[str, Any],
    predictions: pd.DataFrame,
) -> None:
    """Guarda métricas, predicciones y matriz."""
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

    confusion_dataframe = pd.DataFrame(
        metrics["confusion_matrix"],
        index=metrics["classes"],
        columns=metrics["classes"],
    )

    confusion_dataframe.to_csv(
        FINAL_CONFUSION_MATRIX_PATH,
        encoding="utf-8-sig",
    )


# ============================================================
# 6. PRESENTACIÓN
# ============================================================

def print_final_results(
    metrics: dict[str, Any],
) -> None:
    """Muestra los resultados finales."""
    print("\n" + "=" * 65)
    print("EVALUACIÓN FINAL DEL CLASIFICADOR")
    print("=" * 65)

    print(
        f"Modelo: {metrics['model']}"
    )

    print(
        f"Registros de prueba: "
        f"{metrics['records']}"
    )

    print(
        f"Accuracy: "
        f"{metrics['accuracy']:.4f}"
    )

    print(
        f"Precision weighted: "
        f"{metrics['precision_weighted']:.4f}"
    )

    print(
        f"Recall weighted: "
        f"{metrics['recall_weighted']:.4f}"
    )

    print(
        f"F1 weighted: "
        f"{metrics['f1_weighted']:.4f}"
    )

    print(
        f"Precision macro: "
        f"{metrics['precision_macro']:.4f}"
    )

    print(
        f"Recall macro: "
        f"{metrics['recall_macro']:.4f}"
    )

    print(
        f"F1 macro: "
        f"{metrics['f1_macro']:.4f}"
    )

    if (
        metrics["roc_auc_weighted_ovr"]
        is not None
    ):
        print(
            f"ROC-AUC weighted: "
            f"{metrics['roc_auc_weighted_ovr']:.4f}"
        )

    if metrics["roc_auc_macro_ovr"] is not None:
        print(
            f"ROC-AUC macro: "
            f"{metrics['roc_auc_macro_ovr']:.4f}"
        )

    print("\nClase high:")

    print(
        f"Precision: "
        f"{metrics['high_precision']:.4f}"
    )

    print(
        f"Recall: "
        f"{metrics['high_recall']:.4f}"
    )

    print(
        f"F1: "
        f"{metrics['high_f1']:.4f}"
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


# ============================================================
# 7. EJECUCIÓN
# ============================================================

def main() -> None:
    """Ejecuta la evaluación final."""
    try:
        test_dataset = load_test_dataset()

        validate_test_dataset(
            test_dataset
        )

        model, label_encoder = (
            load_artifacts()
        )

        x_test = test_dataset[
            FEATURE_COLUMNS
        ].copy()

        y_test = pd.Series(
            label_encoder.transform(
                test_dataset[TARGET_COLUMN]
            ),
            index=test_dataset.index,
            name=TARGET_COLUMN,
        )

        predictions = model.predict(
            x_test
        )

        probabilities = model.predict_proba(
            x_test
        )

        metrics = calculate_final_metrics(
            y_true=y_test,
            predictions=predictions,
            probabilities=probabilities,
            label_encoder=label_encoder,
        )

        prediction_results = (
            create_predictions_dataframe(
                test_dataset=test_dataset,
                y_true=y_test,
                predictions=predictions,
                probabilities=probabilities,
                label_encoder=label_encoder,
            )
        )

        save_outputs(
            metrics=metrics,
            predictions=prediction_results,
        )

        print_final_results(metrics)

        print("\nArchivos generados:")
        print(f"- {FINAL_METRICS_PATH}")
        print(
            f"- {FINAL_PREDICTIONS_PATH}"
        )
        print(
            f"- {FINAL_CONFUSION_MATRIX_PATH}"
        )

        print(
            "\nLa evaluación final fue realizada "
            "sin modificar el modelo."
        )

        print(
            "El conjunto de prueba no deberá "
            "utilizarse para nuevos ajustes."
        )

    except Exception as error:
        print(
            "\nError durante la evaluación final:"
        )
        print(error)
        sys.exit(1)


if __name__ == "__main__":
    main()