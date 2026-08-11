"""
División temporal del dataset procesado de VitalMind AI.

Este script:
- carga el dataset procesado;
- ordena por fecha;
- separa entrenamiento, validación y prueba;
- evita mezclar registros futuros con registros pasados;
- exporta los tres conjuntos;
- muestra un resumen de distribución.
"""

from pathlib import Path
import sys

import pandas as pd


# ============================================================
# 1. RUTAS
# ============================================================

SCRIPT_PATH = Path(__file__).resolve()
ML_SERVICE_DIR = SCRIPT_PATH.parent.parent

PROCESSED_DATA_PATH = (
    ML_SERVICE_DIR
    / "data"
    / "processed"
    / "vitalmind_dataset_processed.csv"
)

TRAINING_DATA_DIR = ML_SERVICE_DIR / "data" / "training"
VALIDATION_DATA_DIR = ML_SERVICE_DIR / "data" / "validation"
TEST_DATA_DIR = ML_SERVICE_DIR / "data" / "test"

TRAINING_DATA_PATH = TRAINING_DATA_DIR / "train.csv"
VALIDATION_DATA_PATH = VALIDATION_DATA_DIR / "validation.csv"
TEST_DATA_PATH = TEST_DATA_DIR / "test.csv"


# ============================================================
# 2. CONFIGURACIÓN
# ============================================================

TRAIN_RATIO = 0.70
VALIDATION_RATIO = 0.15
TEST_RATIO = 0.15

EXPECTED_RISK_LEVELS = {
    "low",
    "medium",
    "high",
}


# ============================================================
# 3. CARGA
# ============================================================

def load_processed_dataset() -> pd.DataFrame:
    """Carga el dataset procesado."""
    if not PROCESSED_DATA_PATH.exists():
        raise FileNotFoundError(
            "No se encontró el dataset procesado:\n"
            f"{PROCESSED_DATA_PATH}"
        )

    dataset = pd.read_csv(
        PROCESSED_DATA_PATH,
        parse_dates=["log_date"],
    )

    return dataset


# ============================================================
# 4. VALIDACIÓN PREVIA
# ============================================================

def validate_input_dataset(
    dataset: pd.DataFrame,
) -> list[str]:
    """Valida que el dataset pueda dividirse."""
    errors = []

    required_columns = [
        "record_id",
        "user_id",
        "log_date",
        "risk_level",
        "wellbeing_score",
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in dataset.columns
    ]

    if missing_columns:
        errors.append(
            f"Faltan columnas requeridas: {missing_columns}"
        )

        return errors

    if dataset.empty:
        errors.append("El dataset está vacío.")

    if dataset["log_date"].isna().any():
        errors.append(
            "Existen valores faltantes o inválidos en log_date."
        )

    if dataset["record_id"].duplicated().any():
        errors.append("Existen record_id duplicados.")

    if dataset.duplicated(
        subset=["user_id", "log_date"]
    ).any():
        errors.append(
            "Existen registros duplicados por usuario y fecha."
        )

    invalid_risk_levels = (
        set(dataset["risk_level"].dropna().unique())
        - EXPECTED_RISK_LEVELS
    )

    if invalid_risk_levels:
        errors.append(
            "Existen niveles de riesgo inválidos: "
            f"{sorted(invalid_risk_levels)}"
        )

    return errors


# ============================================================
# 5. DIVISIÓN TEMPORAL
# ============================================================

def split_dataset_temporally(
    dataset: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Divide el dataset respetando el orden cronológico.

    La división se realiza por fechas únicas para evitar que una misma fecha
    quede repartida entre diferentes conjuntos.
    """
    dataset = dataset.copy()

    dataset = dataset.sort_values(
        by=["log_date", "user_id", "record_id"]
    ).reset_index(drop=True)

    unique_dates = (
        dataset["log_date"]
        .drop_duplicates()
        .sort_values()
        .reset_index(drop=True)
    )

    total_dates = len(unique_dates)

    if total_dates < 3:
        raise ValueError(
            "Se necesitan al menos tres fechas diferentes "
            "para dividir el dataset."
        )

    train_date_count = int(
        total_dates * TRAIN_RATIO
    )

    validation_date_count = int(
        total_dates * VALIDATION_RATIO
    )

    train_date_count = max(train_date_count, 1)
    validation_date_count = max(
        validation_date_count,
        1,
    )

    test_date_start = (
        train_date_count
        + validation_date_count
    )

    if test_date_start >= total_dates:
        test_date_start = total_dates - 1

    train_dates = set(
        unique_dates.iloc[:train_date_count]
    )

    validation_dates = set(
        unique_dates.iloc[
            train_date_count:test_date_start
        ]
    )

    test_dates = set(
        unique_dates.iloc[test_date_start:]
    )

    train_dataset = dataset[
        dataset["log_date"].isin(train_dates)
    ].copy()

    validation_dataset = dataset[
        dataset["log_date"].isin(validation_dates)
    ].copy()

    test_dataset = dataset[
        dataset["log_date"].isin(test_dates)
    ].copy()

    return (
        train_dataset,
        validation_dataset,
        test_dataset,
    )


# ============================================================
# 6. VALIDACIÓN DE LA DIVISIÓN
# ============================================================

def validate_split(
    original_dataset: pd.DataFrame,
    train_dataset: pd.DataFrame,
    validation_dataset: pd.DataFrame,
    test_dataset: pd.DataFrame,
) -> list[str]:
    """Valida que la división temporal sea correcta."""
    errors = []

    total_split_records = (
        len(train_dataset)
        + len(validation_dataset)
        + len(test_dataset)
    )

    if total_split_records != len(original_dataset):
        errors.append(
            "La suma de los conjuntos no coincide con "
            "el total del dataset original."
        )

    split_record_ids = pd.concat(
        [
            train_dataset["record_id"],
            validation_dataset["record_id"],
            test_dataset["record_id"],
        ],
        ignore_index=True,
    )

    if split_record_ids.duplicated().any():
        errors.append(
            "Existen record_id repetidos entre conjuntos."
        )

    train_dates = set(train_dataset["log_date"])
    validation_dates = set(
        validation_dataset["log_date"]
    )
    test_dates = set(test_dataset["log_date"])

    if train_dates & validation_dates:
        errors.append(
            "Entrenamiento y validación comparten fechas."
        )

    if train_dates & test_dates:
        errors.append(
            "Entrenamiento y prueba comparten fechas."
        )

    if validation_dates & test_dates:
        errors.append(
            "Validación y prueba comparten fechas."
        )

    if not train_dataset.empty and not validation_dataset.empty:
        if (
            train_dataset["log_date"].max()
            >= validation_dataset["log_date"].min()
        ):
            errors.append(
                "El periodo de entrenamiento no termina antes "
                "del periodo de validación."
            )

    if not validation_dataset.empty and not test_dataset.empty:
        if (
            validation_dataset["log_date"].max()
            >= test_dataset["log_date"].min()
        ):
            errors.append(
                "El periodo de validación no termina antes "
                "del periodo de prueba."
            )

    for name, split in [
        ("train", train_dataset),
        ("validation", validation_dataset),
        ("test", test_dataset),
    ]:
        if split.empty:
            errors.append(
                f"El conjunto {name} quedó vacío."
            )

        missing_classes = (
            EXPECTED_RISK_LEVELS
            - set(split["risk_level"].unique())
        )

        if missing_classes:
            errors.append(
                f"El conjunto {name} no contiene las clases: "
                f"{sorted(missing_classes)}"
            )

    return errors


# ============================================================
# 7. EXPORTACIÓN
# ============================================================

def export_datasets(
    train_dataset: pd.DataFrame,
    validation_dataset: pd.DataFrame,
    test_dataset: pd.DataFrame,
) -> None:
    """Exporta los tres conjuntos."""
    TRAINING_DATA_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    VALIDATION_DATA_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    TEST_DATA_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    train_dataset.to_csv(
        TRAINING_DATA_PATH,
        index=False,
        encoding="utf-8-sig",
        date_format="%Y-%m-%d",
    )

    validation_dataset.to_csv(
        VALIDATION_DATA_PATH,
        index=False,
        encoding="utf-8-sig",
        date_format="%Y-%m-%d",
    )

    test_dataset.to_csv(
        TEST_DATA_PATH,
        index=False,
        encoding="utf-8-sig",
        date_format="%Y-%m-%d",
    )


# ============================================================
# 8. RESUMEN
# ============================================================

def print_split_summary(
    original_dataset: pd.DataFrame,
    train_dataset: pd.DataFrame,
    validation_dataset: pd.DataFrame,
    test_dataset: pd.DataFrame,
) -> None:
    """Muestra el resumen de la división."""
    print("\nDataset dividido correctamente.")
    print("=" * 60)
    print(f"Registros totales: {len(original_dataset)}")

    split_information = [
        ("Entrenamiento", train_dataset),
        ("Validación", validation_dataset),
        ("Prueba", test_dataset),
    ]

    for name, split in split_information:
        percentage = (
            len(split)
            / len(original_dataset)
            * 100
        )

        print(f"\n{name}:")
        print(f"  Registros: {len(split)}")
        print(f"  Porcentaje: {percentage:.2f} %")
        print(
            "  Periodo: "
            f"{split['log_date'].min().date()} a "
            f"{split['log_date'].max().date()}"
        )
        print(
            f"  Usuarios: "
            f"{split['user_id'].nunique()}"
        )

        risk_distribution = (
            split["risk_level"]
            .value_counts(normalize=True)
            .mul(100)
            .round(2)
        )

        print("  Distribución de riesgo:")

        for level in ["low", "medium", "high"]:
            print(
                f"    {level:<8}: "
                f"{risk_distribution.get(level, 0):.2f} %"
            )

    print("\nArchivos generados:")
    print(f"- {TRAINING_DATA_PATH}")
    print(f"- {VALIDATION_DATA_PATH}")
    print(f"- {TEST_DATA_PATH}")


# ============================================================
# 9. EJECUCIÓN PRINCIPAL
# ============================================================

def main() -> None:
    """Ejecuta la división completa."""
    try:
        dataset = load_processed_dataset()

        input_errors = validate_input_dataset(
            dataset
        )

        if input_errors:
            print(
                "\nNo fue posible dividir el dataset:\n"
            )

            for error in input_errors:
                print(f"- {error}")

            sys.exit(1)

        (
            train_dataset,
            validation_dataset,
            test_dataset,
        ) = split_dataset_temporally(dataset)

        split_errors = validate_split(
            original_dataset=dataset,
            train_dataset=train_dataset,
            validation_dataset=validation_dataset,
            test_dataset=test_dataset,
        )

        if split_errors:
            print(
                "\nLa división generó errores:\n"
            )

            for error in split_errors:
                print(f"- {error}")

            sys.exit(1)

        export_datasets(
            train_dataset=train_dataset,
            validation_dataset=validation_dataset,
            test_dataset=test_dataset,
        )

        print_split_summary(
            original_dataset=dataset,
            train_dataset=train_dataset,
            validation_dataset=validation_dataset,
            test_dataset=test_dataset,
        )

    except Exception as error:
        print(
            "\nOcurrió un error durante la división "
            "del dataset:"
        )
        print(error)
        sys.exit(1)


if __name__ == "__main__":
    main()