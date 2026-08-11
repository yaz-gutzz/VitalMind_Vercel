"""
Validador del dataset sintético de VitalMind AI.

Revisa:
- existencia del archivo;
- columnas requeridas;
- cantidad de registros;
- duplicados;
- valores faltantes;
- rangos;
- coherencia entre variables;
- distribución de clases;
- proporción de anomalías.
"""

from pathlib import Path
import sys

import pandas as pd


# ============================================================
# 1. RUTAS
# ============================================================

SCRIPT_PATH = Path(__file__).resolve()
ML_SERVICE_DIR = SCRIPT_PATH.parent.parent

DATASET_PATH = (
    ML_SERVICE_DIR
    / "data"
    / "raw"
    / "vitalmind_dataset_raw.csv"
)


# ============================================================
# 2. CONFIGURACIÓN
# ============================================================

EXPECTED_RECORDS = 5000

VALID_RISK_LEVELS = {
    "low",
    "medium",
    "high",
}

VALID_MOODS = {
    "Muy bien",
    "Bien",
    "Regular",
    "Mal",
    "Muy mal",
}

REQUIRED_COLUMNS = [
    "record_id",
    "user_id",
    "log_date",
    "profile_type",
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
    "mood",
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
    "risk_level",
    "is_anomaly",
]


# ============================================================
# 3. FUNCIONES AUXILIARES
# ============================================================

def add_error(errors: list[str], message: str) -> None:
    """Agrega un error al listado."""
    errors.append(message)


def add_warning(warnings: list[str], message: str) -> None:
    """Agrega una advertencia al listado."""
    warnings.append(message)


def validate_range(
    dataset: pd.DataFrame,
    column: str,
    minimum: float,
    maximum: float,
    errors: list[str],
) -> None:
    """Valida que una columna numérica se encuentre dentro de un rango."""
    if column not in dataset.columns:
        return

    invalid_values = dataset[
        dataset[column].notna()
        & ~dataset[column].between(minimum, maximum)
    ]

    if not invalid_values.empty:
        add_error(
            errors,
            (
                f"{column}: {len(invalid_values)} valores "
                f"fuera del rango {minimum} a {maximum}."
            ),
        )


# ============================================================
# 4. VALIDACIONES
# ============================================================

def validate_structure(
    dataset: pd.DataFrame,
    errors: list[str],
) -> None:
    """Valida estructura, columnas y cantidad de registros."""
    missing_columns = [
        column
        for column in REQUIRED_COLUMNS
        if column not in dataset.columns
    ]

    if missing_columns:
        add_error(
            errors,
            f"Faltan columnas requeridas: {missing_columns}",
        )

    if len(dataset) != EXPECTED_RECORDS:
        add_error(
            errors,
            (
                f"Se esperaban {EXPECTED_RECORDS} registros y "
                f"se encontraron {len(dataset)}."
            ),
        )


def validate_identifiers(
    dataset: pd.DataFrame,
    errors: list[str],
) -> None:
    """Valida identificadores y unicidad."""
    for column in ["record_id", "user_id", "log_date"]:
        if column in dataset.columns and dataset[column].isna().any():
            add_error(
                errors,
                f"{column}: contiene valores vacíos.",
            )

    if (
        "record_id" in dataset.columns
        and dataset["record_id"].duplicated().any()
    ):
        duplicates = int(dataset["record_id"].duplicated().sum())

        add_error(
            errors,
            f"record_id: existen {duplicates} identificadores duplicados.",
        )

    if all(
        column in dataset.columns
        for column in ["user_id", "log_date"]
    ):
        duplicated_daily_records = dataset.duplicated(
            subset=["user_id", "log_date"]
        )

        if duplicated_daily_records.any():
            add_error(
                errors,
                (
                    "Existen "
                    f"{int(duplicated_daily_records.sum())} "
                    "registros repetidos por usuario y fecha."
                ),
            )


def validate_dates(
    dataset: pd.DataFrame,
    errors: list[str],
) -> None:
    """Valida el formato y contenido de log_date."""
    if "log_date" not in dataset.columns:
        return

    parsed_dates = pd.to_datetime(
        dataset["log_date"],
        errors="coerce",
    )

    invalid_dates = parsed_dates.isna()

    if invalid_dates.any():
        add_error(
            errors,
            (
                f"log_date: existen "
                f"{int(invalid_dates.sum())} fechas inválidas."
            ),
        )


def validate_categories(
    dataset: pd.DataFrame,
    errors: list[str],
) -> None:
    """Valida las categorías permitidas."""
    if "risk_level" in dataset.columns:
        invalid_risk_levels = (
            set(dataset["risk_level"].dropna().unique())
            - VALID_RISK_LEVELS
        )

        if invalid_risk_levels:
            add_error(
                errors,
                (
                    "risk_level contiene categorías inválidas: "
                    f"{sorted(invalid_risk_levels)}"
                ),
            )

    if "mood" in dataset.columns:
        invalid_moods = (
            set(dataset["mood"].dropna().unique())
            - VALID_MOODS
        )

        if invalid_moods:
            add_error(
                errors,
                (
                    "mood contiene categorías inválidas: "
                    f"{sorted(invalid_moods)}"
                ),
            )


def validate_numeric_ranges(
    dataset: pd.DataFrame,
    errors: list[str],
) -> None:
    """Valida los rangos numéricos definidos."""
    range_rules = {
        "age": (18, 80),
        "height_cm": (140, 200),
        "weight_profile_kg": (40, 180),
        "weight_kg": (40, 180),
        "bmi": (12, 60),
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
        validate_range(
            dataset=dataset,
            column=column,
            minimum=limits[0],
            maximum=limits[1],
            errors=errors,
        )


def validate_consistency(
    dataset: pd.DataFrame,
    errors: list[str],
    warnings: list[str],
) -> None:
    """Valida relaciones coherentes entre variables."""
    if all(
        column in dataset.columns
        for column in ["systolic_mmhg", "diastolic_mmhg"]
    ):
        invalid_pressure = dataset[
            dataset["systolic_mmhg"].notna()
            & dataset["diastolic_mmhg"].notna()
            & (
                dataset["systolic_mmhg"]
                <= dataset["diastolic_mmhg"]
            )
        ]

        if not invalid_pressure.empty:
            add_error(
                errors,
                (
                    "Presión arterial: existen "
                    f"{len(invalid_pressure)} registros donde "
                    "la sistólica no es mayor que la diastólica."
                ),
            )

    if all(
        column in dataset.columns
        for column in ["water_glasses", "water_liters"]
    ):
        expected_liters = (
            dataset["water_glasses"] * 0.25
        ).round(2)

        water_difference = (
            dataset["water_liters"] - expected_liters
        ).abs()

        inconsistent_water = (
            dataset["water_liters"].notna()
            & dataset["water_glasses"].notna()
            & (water_difference > 0.011)
        )

        if inconsistent_water.any():
            add_error(
                errors,
                (
                    "Hidratación: existen "
                    f"{int(inconsistent_water.sum())} "
                    "registros donde water_liters no coincide "
                    "con water_glasses × 0.25."
                ),
            )

    if all(
        column in dataset.columns
        for column in ["weight_kg", "height_cm", "bmi"]
    ):
        calculated_bmi = (
            dataset["weight_kg"]
            / ((dataset["height_cm"] / 100) ** 2)
        ).round(2)

        inconsistent_bmi = (
            dataset["weight_kg"].notna()
            & dataset["height_cm"].notna()
            & dataset["bmi"].notna()
            & (
                (dataset["bmi"] - calculated_bmi).abs()
                > 0.05
            )
        )

        if inconsistent_bmi.any():
            add_error(
                errors,
                (
                    f"IMC: existen {int(inconsistent_bmi.sum())} "
                    "registros inconsistentes."
                ),
            )

    if "healthy_meals_count" in dataset.columns:
        non_integer_meals = dataset[
            dataset["healthy_meals_count"].notna()
            & (
                dataset["healthy_meals_count"]
                % 1
                != 0
            )
        ]

        if not non_integer_meals.empty:
            add_error(
                errors,
                (
                    "healthy_meals_count contiene "
                    f"{len(non_integer_meals)} valores no enteros."
                ),
            )

    if "is_anomaly" in dataset.columns:
        valid_anomaly_values = {True, False, 0, 1}

        invalid_anomaly_values = (
            set(dataset["is_anomaly"].dropna().unique())
            - valid_anomaly_values
        )

        if invalid_anomaly_values:
            add_error(
                errors,
                (
                    "is_anomaly contiene valores inválidos: "
                    f"{invalid_anomaly_values}"
                ),
            )

    if all(
        column in dataset.columns
        for column in ["risk_level", "wellbeing_score"]
    ):
        high_with_high_wellbeing = dataset[
            (dataset["risk_level"] == "high")
            & (dataset["wellbeing_score"] >= 75)
        ]

        if not high_with_high_wellbeing.empty:
            add_warning(
                warnings,
                (
                    "Existen "
                    f"{len(high_with_high_wellbeing)} "
                    "registros con riesgo alto y bienestar "
                    "igual o superior a 75. Deben revisarse "
                    "como posibles casos frontera."
                ),
            )


def validate_missing_values(
    dataset: pd.DataFrame,
    errors: list[str],
    warnings: list[str],
) -> None:
    """Valida valores faltantes y muestra su distribución."""
    non_nullable_columns = [
        "record_id",
        "user_id",
        "log_date",
        "age",
        "height_cm",
        "weight_profile_kg",
        "water_glasses",
        "water_liters",
        "exercise_minutes",
        "sleep_hours",
        "healthy_meals_count",
        "meditation_minutes",
        "pain",
        "sleep_score",
        "activity_score",
        "nutrition_score",
        "emotional_score",
        "physical_condition_score",
        "wellbeing_score",
        "risk_factors_count",
        "risk_level",
        "is_anomaly",
    ]

    for column in non_nullable_columns:
        if (
            column in dataset.columns
            and dataset[column].isna().any()
        ):
            add_error(
                errors,
                (
                    f"{column}: contiene "
                    f"{int(dataset[column].isna().sum())} "
                    "valores faltantes no permitidos."
                ),
            )

    optional_columns = [
        "weight_kg",
        "temperature_c",
        "systolic_mmhg",
        "diastolic_mmhg",
        "glucose_mg_dl",
        "heart_rate_bpm",
        "mood",
        "stress_level",
        "energy_level",
        "sleep_quality",
    ]

    for column in optional_columns:
        if column not in dataset.columns:
            continue

        percentage = dataset[column].isna().mean() * 100

        if percentage > 5:
            add_warning(
                warnings,
                (
                    f"{column}: presenta "
                    f"{percentage:.2f} % de valores faltantes, "
                    "superior al 5 % esperado."
                ),
            )


def validate_distributions(
    dataset: pd.DataFrame,
    warnings: list[str],
) -> None:
    """Revisa la distribución de riesgo y anomalías."""
    if "risk_level" in dataset.columns:
        risk_distribution = (
            dataset["risk_level"]
            .value_counts(normalize=True)
            .mul(100)
        )

        for risk_level in VALID_RISK_LEVELS:
            percentage = float(
                risk_distribution.get(risk_level, 0)
            )

            if percentage < 5:
                add_warning(
                    warnings,
                    (
                        f"La clase {risk_level} representa "
                        f"solo {percentage:.2f} % del dataset."
                    ),
                )

    if "is_anomaly" in dataset.columns:
        anomaly_percentage = (
            dataset["is_anomaly"].astype(bool).mean() * 100
        )

        if not 1 <= anomaly_percentage <= 5:
            add_warning(
                warnings,
                (
                    "La proporción de anomalías es "
                    f"{anomaly_percentage:.2f} %, fuera del "
                    "rango sugerido de 1 % a 5 %."
                ),
            )


# ============================================================
# 5. RESUMEN
# ============================================================

def print_summary(
    dataset: pd.DataFrame,
    errors: list[str],
    warnings: list[str],
) -> None:
    """Muestra el resumen de validación."""
    print("\nValidación del dataset de VitalMind AI")
    print("=" * 55)

    print(f"Archivo: {DATASET_PATH}")
    print(f"Registros: {len(dataset)}")
    print(f"Columnas: {len(dataset.columns)}")
    print(f"Usuarios: {dataset['user_id'].nunique()}")

    if "log_date" in dataset.columns:
        print(
            "Periodo: "
            f"{dataset['log_date'].min()} a "
            f"{dataset['log_date'].max()}"
        )

    print("\nDistribución de riesgo:")

    if "risk_level" in dataset.columns:
        distribution = (
            dataset["risk_level"]
            .value_counts(normalize=True)
            .mul(100)
            .round(2)
        )

        for level in ["low", "medium", "high"]:
            print(
                f"{level:<8}: "
                f"{distribution.get(level, 0):.2f} %"
            )

    missing_percentage = (
        dataset.isna().sum().sum()
        / (dataset.shape[0] * dataset.shape[1])
        * 100
    )

    print(
        f"\nValores faltantes globales: "
        f"{missing_percentage:.2f} %"
    )

    if "is_anomaly" in dataset.columns:
        anomaly_percentage = (
            dataset["is_anomaly"].astype(bool).mean() * 100
        )

        print(
            f"Anomalías sintéticas: "
            f"{anomaly_percentage:.2f} %"
        )

    print("\nErrores:")

    if errors:
        for error in errors:
            print(f"- {error}")
    else:
        print("- No se encontraron errores.")

    print("\nAdvertencias:")

    if warnings:
        for warning in warnings:
            print(f"- {warning}")
    else:
        print("- No se encontraron advertencias.")

    print("\nResultado final:")

    if errors:
        print("DATASET NO VÁLIDO")
    elif warnings:
        print("DATASET VÁLIDO CON ADVERTENCIAS")
    else:
        print("DATASET VÁLIDO")


# ============================================================
# 6. EJECUCIÓN PRINCIPAL
# ============================================================

def main() -> None:
    """Ejecuta la validación completa."""
    if not DATASET_PATH.exists():
        print(
            "\nNo se encontró el dataset esperado:\n"
            f"{DATASET_PATH}"
        )
        sys.exit(1)

    try:
        dataset = pd.read_csv(DATASET_PATH)

        errors: list[str] = []
        warnings: list[str] = []

        validate_structure(dataset, errors)
        validate_identifiers(dataset, errors)
        validate_dates(dataset, errors)
        validate_categories(dataset, errors)
        validate_numeric_ranges(dataset, errors)
        validate_consistency(dataset, errors, warnings)
        validate_missing_values(dataset, errors, warnings)
        validate_distributions(dataset, warnings)

        print_summary(
            dataset=dataset,
            errors=errors,
            warnings=warnings,
        )

        if errors:
            sys.exit(1)

    except Exception as error:
        print(
            "\nOcurrió un error durante la validación:"
        )
        print(error)
        sys.exit(1)


if __name__ == "__main__":
    main()