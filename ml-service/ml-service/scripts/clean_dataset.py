"""
Limpieza y transformación del dataset sintético de VitalMind AI.

Este script:
- carga el dataset raw;
- convierte fechas;
- corrige tipos de datos;
- aplica respaldo de peso;
- imputa valores faltantes;
- recalcula variables derivadas;
- valida categorías;
- elimina duplicados;
- exporta el dataset procesado.
"""

from pathlib import Path
import sys

import numpy as np
import pandas as pd


# ============================================================
# 1. RUTAS
# ============================================================

SCRIPT_PATH = Path(__file__).resolve()
ML_SERVICE_DIR = SCRIPT_PATH.parent.parent

RAW_DATA_PATH = (
    ML_SERVICE_DIR
    / "data"
    / "raw"
    / "vitalmind_dataset_raw.csv"
)

PROCESSED_DATA_DIR = (
    ML_SERVICE_DIR
    / "data"
    / "processed"
)

PROCESSED_DATA_PATH = (
    PROCESSED_DATA_DIR
    / "vitalmind_dataset_processed.csv"
)


# ============================================================
# 2. CONFIGURACIÓN
# ============================================================

VALID_MOODS = [
    "Muy mal",
    "Mal",
    "Regular",
    "Bien",
    "Muy bien",
]

VALID_RISK_LEVELS = [
    "low",
    "medium",
    "high",
]

NUMERIC_COLUMNS = [
    "age",
    "height_cm",
    "weight_profile_kg",
    "weight_kg",
    "bmi",
    "water_glasses",
    "water_liters",
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
    "sleep_score",
    "activity_score",
    "nutrition_score",
    "emotional_score",
    "physical_condition_score",
    "wellbeing_score",
    "risk_factors_count",
]

INTEGER_COLUMNS = [
    "age",
    "healthy_meals_count",
    "pain",
    "systolic_mmhg",
    "diastolic_mmhg",
    "glucose_mg_dl",
    "heart_rate_bpm",
    "stress_level",
    "energy_level",
    "sleep_quality",
    "risk_factors_count",
]


# ============================================================
# 3. FUNCIONES AUXILIARES
# ============================================================

def calculate_bmi(
    weight_kg: pd.Series,
    height_cm: pd.Series,
) -> pd.Series:
    """Calcula el IMC de forma vectorizada."""
    height_m = height_cm / 100

    bmi = weight_kg / (height_m ** 2)

    return bmi.round(2)


def normalize_mood(value: object) -> object:
    """Normaliza el estado de ánimo."""
    if pd.isna(value):
        return np.nan

    normalized = str(value).strip()

    if normalized in VALID_MOODS:
        return normalized

    return np.nan


def normalize_risk_level(value: object) -> object:
    """Normaliza la clase de riesgo."""
    if pd.isna(value):
        return np.nan

    normalized = str(value).strip().lower()

    if normalized in VALID_RISK_LEVELS:
        return normalized

    return np.nan


def mode_or_default(
    series: pd.Series,
    default: object,
) -> object:
    """Devuelve la moda o un valor predeterminado."""
    mode = series.mode(dropna=True)

    if mode.empty:
        return default

    return mode.iloc[0]


# ============================================================
# 4. CARGA DEL DATASET
# ============================================================

def load_dataset() -> pd.DataFrame:
    """Carga el dataset raw."""
    if not RAW_DATA_PATH.exists():
        raise FileNotFoundError(
            f"No se encontró el archivo:\n{RAW_DATA_PATH}"
        )

    return pd.read_csv(RAW_DATA_PATH)


# ============================================================
# 5. LIMPIEZA ESTRUCTURAL
# ============================================================

def clean_structure(dataset: pd.DataFrame) -> pd.DataFrame:
    """Limpia espacios, duplicados y estructura básica."""
    dataset = dataset.copy()

    dataset.columns = [
        column.strip()
        for column in dataset.columns
    ]

    dataset = dataset.drop_duplicates(
        subset=["record_id"],
        keep="first",
    )

    dataset = dataset.drop_duplicates(
        subset=["user_id", "log_date"],
        keep="first",
    )

    dataset["record_id"] = (
        dataset["record_id"]
        .astype("string")
        .str.strip()
    )

    dataset["user_id"] = (
        dataset["user_id"]
        .astype("string")
        .str.strip()
    )

    return dataset


# ============================================================
# 6. CONVERSIÓN DE TIPOS
# ============================================================

def convert_data_types(
    dataset: pd.DataFrame,
) -> pd.DataFrame:
    """Convierte columnas a tipos consistentes."""
    dataset = dataset.copy()

    dataset["log_date"] = pd.to_datetime(
        dataset["log_date"],
        errors="coerce",
    )

    for column in NUMERIC_COLUMNS:
        if column in dataset.columns:
            dataset[column] = pd.to_numeric(
                dataset[column],
                errors="coerce",
            )

    dataset["mood"] = dataset["mood"].apply(
        normalize_mood
    )

    dataset["risk_level"] = dataset["risk_level"].apply(
        normalize_risk_level
    )

    dataset["is_anomaly"] = (
        dataset["is_anomaly"]
        .map(
            {
                True: True,
                False: False,
                1: True,
                0: False,
                "True": True,
                "False": False,
                "true": True,
                "false": False,
                "1": True,
                "0": False,
            }
        )
        .astype("boolean")
    )

    return dataset


# ============================================================
# 7. RESPALDO DE PESO
# ============================================================

def apply_weight_fallback(
    dataset: pd.DataFrame,
) -> pd.DataFrame:
    """
    Usa weight_profile_kg cuando weight_kg está ausente.
    """
    dataset = dataset.copy()

    dataset["weight_source"] = np.where(
        dataset["weight_kg"].notna(),
        "symptom_log",
        "profile_fallback",
    )

    dataset["weight_kg"] = dataset["weight_kg"].fillna(
        dataset["weight_profile_kg"]
    )

    return dataset


# ============================================================
# 8. IMPUTACIÓN
# ============================================================

def impute_missing_values(
    dataset: pd.DataFrame,
) -> pd.DataFrame:
    """
    Imputa variables opcionales.

    La imputación se realiza con la mediana por usuario y,
    si no está disponible, con la mediana global.
    """
    dataset = dataset.copy()

    numeric_optional_columns = [
        "temperature_c",
        "systolic_mmhg",
        "diastolic_mmhg",
        "glucose_mg_dl",
        "heart_rate_bpm",
        "stress_level",
        "energy_level",
        "sleep_quality",
    ]

    for column in numeric_optional_columns:
        user_median = dataset.groupby(
            "user_id"
        )[column].transform("median")

        global_median = dataset[column].median()

        dataset[column] = (
            dataset[column]
            .fillna(user_median)
            .fillna(global_median)
        )

    mood_mode_by_user = dataset.groupby(
        "user_id"
    )["mood"].transform(
        lambda series: mode_or_default(
            series,
            default=np.nan,
        )
    )

    global_mood = mode_or_default(
        dataset["mood"],
        default="Regular",
    )

    dataset["mood"] = (
        dataset["mood"]
        .fillna(mood_mode_by_user)
        .fillna(global_mood)
    )

    return dataset


# ============================================================
# 9. REGLAS DE RANGO
# ============================================================

def apply_range_rules(
    dataset: pd.DataFrame,
) -> pd.DataFrame:
    """Limita valores a rangos permitidos."""
    dataset = dataset.copy()

    range_rules = {
        "age": (18, 80),
        "height_cm": (140, 200),
        "weight_profile_kg": (40, 180),
        "weight_kg": (40, 180),
        "water_glasses": (0, 16),
        "water_liters": (0, 4),
        "exercise_minutes": (0, 180),
        "sleep_hours": (0, 14),
        "healthy_meals_count": (0, 5),
        "meditation_minutes": (0, 120),
        "pain": (0, 10),
        "temperature_c": (35, 42),
        "systolic_mmhg": (80, 220),
        "diastolic_mmhg": (50, 130),
        "glucose_mg_dl": (50, 350),
        "heart_rate_bpm": (40, 200),
        "stress_level": (1, 10),
        "energy_level": (1, 10),
        "sleep_quality": (1, 10),
        "sleep_score": (0, 100),
        "activity_score": (0, 100),
        "nutrition_score": (0, 100),
        "emotional_score": (0, 100),
        "physical_condition_score": (0, 100),
        "wellbeing_score": (0, 100),
        "risk_factors_count": (0, 20),
    }

    for column, limits in range_rules.items():
        if column in dataset.columns:
            dataset[column] = dataset[column].clip(
                lower=limits[0],
                upper=limits[1],
            )

    invalid_pressure = (
        dataset["systolic_mmhg"]
        <= dataset["diastolic_mmhg"]
    )

    dataset.loc[
        invalid_pressure,
        "diastolic_mmhg",
    ] = (
        dataset.loc[
            invalid_pressure,
            "systolic_mmhg",
        ]
        - 20
    )

    return dataset


# ============================================================
# 10. RECÁLCULO DE VARIABLES DERIVADAS
# ============================================================

def recalculate_derived_variables(
    dataset: pd.DataFrame,
) -> pd.DataFrame:
    """Recalcula variables derivadas después de la imputación."""
    dataset = dataset.copy()

    dataset["water_liters"] = (
        dataset["water_glasses"] * 0.25
    ).round(2)

    dataset["bmi"] = calculate_bmi(
        weight_kg=dataset["weight_kg"],
        height_cm=dataset["height_cm"],
    )

    return dataset


# ============================================================
# 11. TIPOS FINALES
# ============================================================

def apply_final_types(
    dataset: pd.DataFrame,
) -> pd.DataFrame:
    """Aplica tipos finales al dataset procesado."""
    dataset = dataset.copy()

    for column in INTEGER_COLUMNS:
        if column in dataset.columns:
            dataset[column] = (
                dataset[column]
                .round()
                .astype("Int64")
            )

    dataset["mood"] = pd.Categorical(
        dataset["mood"],
        categories=VALID_MOODS,
        ordered=True,
    )

    dataset["risk_level"] = pd.Categorical(
        dataset["risk_level"],
        categories=VALID_RISK_LEVELS,
        ordered=True,
    )

    dataset["profile_type"] = (
        dataset["profile_type"]
        .astype("category")
    )

    dataset["weight_source"] = (
        dataset["weight_source"]
        .astype("category")
    )

    return dataset


# ============================================================
# 12. VALIDACIÓN FINAL
# ============================================================

def validate_processed_dataset(
    dataset: pd.DataFrame,
) -> list[str]:
    """Valida que el dataset procesado esté listo."""
    errors = []

    essential_columns = [
        "record_id",
        "user_id",
        "log_date",
        "age",
        "height_cm",
        "weight_kg",
        "bmi",
        "water_glasses",
        "exercise_minutes",
        "sleep_hours",
        "mood",
        "heart_rate_bpm",
        "pain",
        "wellbeing_score",
        "risk_level",
        "is_anomaly",
    ]

    for column in essential_columns:
        if dataset[column].isna().any():
            errors.append(
                f"{column} contiene valores faltantes."
            )

    if dataset["record_id"].duplicated().any():
        errors.append(
            "Existen record_id duplicados."
        )

    if dataset.duplicated(
        subset=["user_id", "log_date"]
    ).any():
        errors.append(
            "Existen registros duplicados por usuario y fecha."
        )

    if not dataset["bmi"].between(12, 60).all():
        errors.append(
            "Existen valores de bmi fuera del rango esperado."
        )

    if not dataset["wellbeing_score"].between(
        0,
        100,
    ).all():
        errors.append(
            "Existen valores de wellbeing_score fuera de rango."
        )

    invalid_risk = (
        set(
            dataset["risk_level"]
            .dropna()
            .astype(str)
            .unique()
        )
        - set(VALID_RISK_LEVELS)
    )

    if invalid_risk:
        errors.append(
            f"Existen clases de riesgo inválidas: {invalid_risk}"
        )

    return errors


# ============================================================
# 13. RESUMEN
# ============================================================

def print_summary(
    raw_dataset: pd.DataFrame,
    processed_dataset: pd.DataFrame,
) -> None:
    """Muestra un resumen del proceso."""
    raw_missing = int(
        raw_dataset.isna().sum().sum()
    )

    processed_missing = int(
        processed_dataset.isna().sum().sum()
    )

    fallback_count = int(
        (
            processed_dataset["weight_source"]
            == "profile_fallback"
        ).sum()
    )

    print("\nDataset procesado correctamente.")
    print("=" * 55)
    print(f"Registros raw: {len(raw_dataset)}")
    print(
        f"Registros procesados: "
        f"{len(processed_dataset)}"
    )
    print(
        f"Columnas procesadas: "
        f"{len(processed_dataset.columns)}"
    )
    print(
        f"Valores faltantes raw: "
        f"{raw_missing}"
    )
    print(
        f"Valores faltantes procesados: "
        f"{processed_missing}"
    )
    print(
        f"Pesos recuperados desde el perfil: "
        f"{fallback_count}"
    )
    print(
        "\nArchivo generado:\n"
        f"{PROCESSED_DATA_PATH}"
    )


# ============================================================
# 14. EJECUCIÓN PRINCIPAL
# ============================================================

def main() -> None:
    """Ejecuta el proceso completo de limpieza."""
    try:
        raw_dataset = load_dataset()

        processed_dataset = clean_structure(
            raw_dataset
        )

        processed_dataset = convert_data_types(
            processed_dataset
        )

        processed_dataset = apply_weight_fallback(
            processed_dataset
        )

        processed_dataset = impute_missing_values(
            processed_dataset
        )

        processed_dataset = apply_range_rules(
            processed_dataset
        )

        processed_dataset = recalculate_derived_variables(
            processed_dataset
        )

        processed_dataset = apply_final_types(
            processed_dataset
        )

        validation_errors = validate_processed_dataset(
            processed_dataset
        )

        if validation_errors:
            print(
                "\nNo fue posible exportar el dataset "
                "procesado:\n"
            )

            for error in validation_errors:
                print(f"- {error}")

            sys.exit(1)

        PROCESSED_DATA_DIR.mkdir(
            parents=True,
            exist_ok=True,
        )

        processed_dataset.to_csv(
            PROCESSED_DATA_PATH,
            index=False,
            encoding="utf-8-sig",
            date_format="%Y-%m-%d",
        )

        print_summary(
            raw_dataset=raw_dataset,
            processed_dataset=processed_dataset,
        )

    except Exception as error:
        print(
            "\nOcurrió un error durante la limpieza "
            "del dataset:"
        )
        print(error)
        sys.exit(1)


if __name__ == "__main__":
    main()