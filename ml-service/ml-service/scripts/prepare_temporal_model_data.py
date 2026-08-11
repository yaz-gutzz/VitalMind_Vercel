"""
Preparación temporal segura de datos para Machine Learning.

Proceso:
1. Carga el dataset sintético sin limpieza global.
2. Divide temporalmente en entrenamiento, validación y prueba.
3. Aprende valores de imputación únicamente con entrenamiento.
4. Aplica esos valores a validación y prueba.
5. Exporta conjuntos listos para los pipelines de modelado.

Esto evita que información futura influya en el preprocesamiento.
"""

from __future__ import annotations

from pathlib import Path
import json
import sys
from typing import Any

import numpy as np
import pandas as pd


# ============================================================
# 1. CONFIGURACIÓN
# ============================================================

TARGET_COLUMN = "risk_level"

TRAIN_END_DATE = pd.Timestamp("2026-06-01")
VALIDATION_END_DATE = pd.Timestamp("2026-06-14")

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

MODEL_COLUMNS = (
    ["record_id", "user_id", "log_date"]
    + NUMERIC_FEATURES
    + CATEGORICAL_FEATURES
    + [TARGET_COLUMN]
)

VALID_RISK_LEVELS = {
    "low",
    "medium",
    "high",
}


# ============================================================
# 2. RUTAS
# ============================================================

SCRIPT_PATH = Path(__file__).resolve()
ML_SERVICE_DIR = SCRIPT_PATH.parent.parent

RAW_DATA_PATH = (
    ML_SERVICE_DIR
    / "data"
    / "raw"
    / "vitalmind_dataset_raw.csv"
)

OUTPUT_DIR = (
    ML_SERVICE_DIR
    / "data"
    / "modeling"
)

TRAIN_OUTPUT_PATH = (
    OUTPUT_DIR
    / "train_model.csv"
)

VALIDATION_OUTPUT_PATH = (
    OUTPUT_DIR
    / "validation_model.csv"
)

TEST_OUTPUT_PATH = (
    OUTPUT_DIR
    / "test_model.csv"
)

PREPROCESSING_METADATA_PATH = (
    OUTPUT_DIR
    / "preprocessing_metadata.json"
)

QUALITY_REPORT_PATH = (
    OUTPUT_DIR
    / "model_data_quality_report.json"
)


# ============================================================
# 3. CARGA Y VALIDACIÓN
# ============================================================

def load_raw_dataset() -> pd.DataFrame:
    """Carga el dataset crudo."""
    if not RAW_DATA_PATH.exists():
        raise FileNotFoundError(
            "No se encontró el dataset crudo:\n"
            f"{RAW_DATA_PATH}"
        )

    return pd.read_csv(
        RAW_DATA_PATH,
        parse_dates=["log_date"],
    )


def validate_required_columns(
    dataset: pd.DataFrame,
) -> None:
    """Valida que existan las columnas requeridas."""
    required_source_columns = [
        "record_id",
        "user_id",
        "log_date",
        "age",
        "height_cm",
        "weight_kg",
        "weight_profile_kg",
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
        "mood",
        "stress_level",
        "energy_level",
        "sleep_quality",
        TARGET_COLUMN,
    ]

    missing_columns = [
        column
        for column in required_source_columns
        if column not in dataset.columns
    ]

    if missing_columns:
        raise ValueError(
            "Faltan columnas requeridas en el dataset crudo: "
            f"{missing_columns}"
        )


# ============================================================
# 4. LIMPIEZA ESTRUCTURAL
# ============================================================

def clean_structural_values(
    dataset: pd.DataFrame,
) -> pd.DataFrame:
    """
    Realiza transformaciones deterministas.

    No calcula medianas ni estadísticas globales.
    """
    cleaned = dataset.copy()

    cleaned = cleaned.sort_values(
        ["log_date", "user_id", "record_id"]
    ).reset_index(drop=True)

    cleaned["weight_kg"] = cleaned[
        "weight_kg"
    ].fillna(
        cleaned["weight_profile_kg"]
    )

    cleaned["water_glasses"] = (
        pd.to_numeric(
            cleaned["water_glasses"],
            errors="coerce",
        )
        .round()
    )

    for column in NUMERIC_FEATURES:
        if column == "bmi":
            continue

        if column in cleaned.columns:
            cleaned[column] = pd.to_numeric(
                cleaned[column],
                errors="coerce",
            )

    height_meters = (
        cleaned["height_cm"] / 100
    )

    calculated_bmi = (
        cleaned["weight_kg"]
        / height_meters.pow(2)
    )

    if "bmi" not in cleaned.columns:
        cleaned["bmi"] = calculated_bmi
    else:
        cleaned["bmi"] = (
            pd.to_numeric(
                cleaned["bmi"],
                errors="coerce",
            )
            .fillna(calculated_bmi)
        )

    cleaned["mood"] = (
        cleaned["mood"]
        .astype("string")
        .str.strip()
        .str.lower()
    )

    cleaned[TARGET_COLUMN] = (
        cleaned[TARGET_COLUMN]
        .astype("string")
        .str.strip()
        .str.lower()
    )

    invalid_targets = (
        set(
            cleaned[
                TARGET_COLUMN
            ].dropna().unique()
        )
        - VALID_RISK_LEVELS
    )

    if invalid_targets:
        raise ValueError(
            "Se encontraron niveles de riesgo inválidos: "
            f"{sorted(invalid_targets)}"
        )

    return cleaned[MODEL_COLUMNS].copy()


# ============================================================
# 5. DIVISIÓN TEMPORAL
# ============================================================

def temporal_split(
    dataset: pd.DataFrame,
) -> tuple[
    pd.DataFrame,
    pd.DataFrame,
    pd.DataFrame,
]:
    """Divide respetando las fechas definidas."""
    train = dataset[
        dataset["log_date"]
        <= TRAIN_END_DATE
    ].copy()

    validation = dataset[
        (
            dataset["log_date"]
            > TRAIN_END_DATE
        )
        & (
            dataset["log_date"]
            <= VALIDATION_END_DATE
        )
    ].copy()

    test = dataset[
        dataset["log_date"]
        > VALIDATION_END_DATE
    ].copy()

    if train.empty:
        raise ValueError(
            "El conjunto de entrenamiento quedó vacío."
        )

    if validation.empty:
        raise ValueError(
            "El conjunto de validación quedó vacío."
        )

    if test.empty:
        raise ValueError(
            "El conjunto de prueba quedó vacío."
        )

    return train, validation, test


# ============================================================
# 6. IMPUTACIÓN APRENDIDA CON TRAIN
# ============================================================

def learn_imputation_values(
    train: pd.DataFrame,
) -> dict[str, Any]:
    """Obtiene medianas y moda usando solo entrenamiento."""
    numeric_values: dict[str, float] = {}

    for column in NUMERIC_FEATURES:
        median_value = train[column].median()

        if pd.isna(median_value):
            raise ValueError(
                "No fue posible calcular una mediana para "
                f"{column} usando entrenamiento."
            )

        numeric_values[column] = float(
            median_value
        )

    mood_mode = (
        train["mood"]
        .dropna()
        .mode()
    )

    if mood_mode.empty:
        raise ValueError(
            "No fue posible obtener la moda de mood "
            "en entrenamiento."
        )

    return {
        "numeric_medians": numeric_values,
        "categorical_modes": {
            "mood": str(mood_mode.iloc[0]),
        },
        "learned_from": "training_only",
        "train_end_date": (
            TRAIN_END_DATE.date().isoformat()
        ),
        "validation_end_date": (
            VALIDATION_END_DATE.date().isoformat()
        ),
    }


def apply_imputation(
    dataset: pd.DataFrame,
    metadata: dict[str, Any],
) -> pd.DataFrame:
    """Aplica valores aprendidos previamente."""
    imputed = dataset.copy()

    numeric_medians = metadata[
        "numeric_medians"
    ]

    for column, value in numeric_medians.items():
        imputed[column] = (
            imputed[column]
            .fillna(value)
        )

    mood_fallback = metadata[
        "categorical_modes"
    ]["mood"]

    imputed["mood"] = (
        imputed["mood"]
        .fillna(mood_fallback)
    )

    return imputed


# ============================================================
# 7. REPORTE DE CALIDAD
# ============================================================

def dataset_summary(
    dataset: pd.DataFrame,
) -> dict[str, Any]:
    """Construye un resumen de un conjunto."""
    risk_distribution = (
        dataset[TARGET_COLUMN]
        .value_counts(normalize=True)
        .mul(100)
        .round(2)
        .to_dict()
    )

    return {
        "rows": int(len(dataset)),
        "columns": int(dataset.shape[1]),
        "users": int(
            dataset["user_id"].nunique()
        ),
        "start_date": (
            dataset["log_date"]
            .min()
            .date()
            .isoformat()
        ),
        "end_date": (
            dataset["log_date"]
            .max()
            .date()
            .isoformat()
        ),
        "missing_values": int(
            dataset.isna().sum().sum()
        ),
        "duplicated_rows": int(
            dataset.duplicated().sum()
        ),
        "risk_distribution_percent": (
            risk_distribution
        ),
    }


def validate_final_sets(
    train: pd.DataFrame,
    validation: pd.DataFrame,
    test: pd.DataFrame,
) -> None:
    """Valida la calidad de los conjuntos finales."""
    for name, dataset in [
        ("train", train),
        ("validation", validation),
        ("test", test),
    ]:
        missing = dataset[
            NUMERIC_FEATURES
            + CATEGORICAL_FEATURES
            + [TARGET_COLUMN]
        ].isna().sum().sum()

        if missing > 0:
            raise ValueError(
                f"{name} conserva {missing} "
                "valores faltantes."
            )

    if (
        train["log_date"].max()
        >= validation["log_date"].min()
    ):
        raise ValueError(
            "Existe solapamiento entre train "
            "y validation."
        )

    if (
        validation["log_date"].max()
        >= test["log_date"].min()
    ):
        raise ValueError(
            "Existe solapamiento entre validation "
            "y test."
        )


# ============================================================
# 8. EXPORTACIÓN
# ============================================================

def save_outputs(
    train: pd.DataFrame,
    validation: pd.DataFrame,
    test: pd.DataFrame,
    metadata: dict[str, Any],
) -> None:
    """Guarda conjuntos y metadatos."""
    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    train.to_csv(
        TRAIN_OUTPUT_PATH,
        index=False,
        encoding="utf-8-sig",
    )

    validation.to_csv(
        VALIDATION_OUTPUT_PATH,
        index=False,
        encoding="utf-8-sig",
    )

    test.to_csv(
        TEST_OUTPUT_PATH,
        index=False,
        encoding="utf-8-sig",
    )

    with PREPROCESSING_METADATA_PATH.open(
        "w",
        encoding="utf-8",
    ) as metadata_file:
        json.dump(
            metadata,
            metadata_file,
            ensure_ascii=False,
            indent=2,
        )

    report = {
        "methodology": (
            "Temporal split before statistical imputation"
        ),
        "imputation_source": "training_only",
        "train": dataset_summary(train),
        "validation": dataset_summary(
            validation
        ),
        "test": dataset_summary(test),
    }

    with QUALITY_REPORT_PATH.open(
        "w",
        encoding="utf-8",
    ) as report_file:
        json.dump(
            report,
            report_file,
            ensure_ascii=False,
            indent=2,
        )


# ============================================================
# 9. EJECUCIÓN PRINCIPAL
# ============================================================

def main() -> None:
    """Ejecuta la preparación temporal segura."""
    try:
        raw_dataset = load_raw_dataset()

        validate_required_columns(
            raw_dataset
        )

        structured_dataset = (
            clean_structural_values(
                raw_dataset
            )
        )

        train, validation, test = (
            temporal_split(
                structured_dataset
            )
        )

        metadata = learn_imputation_values(
            train
        )

        train = apply_imputation(
            train,
            metadata,
        )

        validation = apply_imputation(
            validation,
            metadata,
        )

        test = apply_imputation(
            test,
            metadata,
        )

        validate_final_sets(
            train,
            validation,
            test,
        )

        save_outputs(
            train=train,
            validation=validation,
            test=test,
            metadata=metadata,
        )

        print("\n" + "=" * 65)
        print("PREPARACIÓN TEMPORAL COMPLETADA")
        print("=" * 65)

        print(
            "Imputación aprendida exclusivamente "
            "con entrenamiento."
        )

        for name, dataset in [
            ("Entrenamiento", train),
            ("Validación", validation),
            ("Prueba", test),
        ]:
            summary = dataset_summary(
                dataset
            )

            print(f"\n{name}")
            print(
                f"Registros: "
                f"{summary['rows']}"
            )
            print(
                f"Usuarios: "
                f"{summary['users']}"
            )
            print(
                "Periodo: "
                f"{summary['start_date']} "
                f"a {summary['end_date']}"
            )
            print(
                "Valores faltantes: "
                f"{summary['missing_values']}"
            )
            print(
                "Distribución de riesgo: "
                f"{summary['risk_distribution_percent']}"
            )

        print("\nArchivos generados:")
        print(f"- {TRAIN_OUTPUT_PATH}")
        print(f"- {VALIDATION_OUTPUT_PATH}")
        print(f"- {TEST_OUTPUT_PATH}")
        print(
            f"- {PREPROCESSING_METADATA_PATH}"
        )
        print(f"- {QUALITY_REPORT_PATH}")

        print(
            "\nEl conjunto de prueba fue preparado, "
            "pero no evaluado."
        )

    except Exception as error:
        print(
            "\nError durante la preparación "
            "temporal:"
        )
        print(error)
        sys.exit(1)


if __name__ == "__main__":
    main()