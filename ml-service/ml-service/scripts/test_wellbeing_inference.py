"""
Prueba local de inferencia del regresor de bienestar
de VitalMind AI.

Este script:
- carga el modelo Ridge final;
- valida un registro individual;
- estima wellbeing_score;
- limita el resultado al intervalo de 0 a 100;
- genera una interpretación preventiva;
- guarda ejemplos de inferencia en JSON.

No implementa una API ni representa una evaluación clínica.
"""

from __future__ import annotations

from pathlib import Path
import json
import sys
from typing import Any

import joblib
import numpy as np
import pandas as pd


# ============================================================
# 1. CONFIGURACIÓN
# ============================================================

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

VALID_MOODS = {
    "very_bad",
    "bad",
    "neutral",
    "good",
    "very_good",
}


# ============================================================
# 2. RUTAS
# ============================================================

SCRIPT_PATH = Path(__file__).resolve()
ML_SERVICE_DIR = SCRIPT_PATH.parent.parent

MODEL_PATH = (
    ML_SERVICE_DIR
    / "app"
    / "models"
    / "wellbeing-regression"
    / "best_wellbeing_regressor.joblib"
)

OUTPUT_DIR = (
    ML_SERVICE_DIR
    / "reports"
    / "inference"
)

SINGLE_OUTPUT_PATH = (
    OUTPUT_DIR
    / "wellbeing_inference_example.json"
)

CONTROLLED_OUTPUT_PATH = (
    OUTPUT_DIR
    / "controlled_wellbeing_inference_examples.json"
)


# ============================================================
# 3. REGISTROS DE PRUEBA
# ============================================================

EXAMPLE_RECORD = {
    "age": 20,
    "height_cm": 160.0,
    "weight_kg": 66.0,
    "bmi": 25.78,
    "water_glasses": 6,
    "exercise_minutes": 35,
    "sleep_hours": 6.5,
    "healthy_meals_count": 3,
    "meditation_minutes": 10,
    "pain": 2,
    "temperature_c": 36.7,
    "systolic_mmhg": 118,
    "diastolic_mmhg": 76,
    "glucose_mg_dl": 92,
    "heart_rate_bpm": 74,
    "mood": "good",
    "stress_level": 4,
    "energy_level": 7,
    "sleep_quality": 6,
}


CONTROLLED_RECORDS = {
    "high_wellbeing_profile": {
        "age": 24,
        "height_cm": 165.0,
        "weight_kg": 60.0,
        "bmi": 22.04,
        "water_glasses": 9,
        "exercise_minutes": 55,
        "sleep_hours": 8.0,
        "healthy_meals_count": 4,
        "meditation_minutes": 20,
        "pain": 0,
        "temperature_c": 36.5,
        "systolic_mmhg": 112,
        "diastolic_mmhg": 72,
        "glucose_mg_dl": 88,
        "heart_rate_bpm": 68,
        "mood": "very_good",
        "stress_level": 2,
        "energy_level": 9,
        "sleep_quality": 9,
    },
    "medium_wellbeing_profile": {
        "age": 35,
        "height_cm": 168.0,
        "weight_kg": 76.0,
        "bmi": 26.93,
        "water_glasses": 5,
        "exercise_minutes": 20,
        "sleep_hours": 6.0,
        "healthy_meals_count": 2,
        "meditation_minutes": 5,
        "pain": 3,
        "temperature_c": 36.9,
        "systolic_mmhg": 128,
        "diastolic_mmhg": 82,
        "glucose_mg_dl": 108,
        "heart_rate_bpm": 82,
        "mood": "neutral",
        "stress_level": 6,
        "energy_level": 5,
        "sleep_quality": 5,
    },
    "low_wellbeing_profile": {
        "age": 58,
        "height_cm": 162.0,
        "weight_kg": 92.0,
        "bmi": 35.06,
        "water_glasses": 2,
        "exercise_minutes": 0,
        "sleep_hours": 4.0,
        "healthy_meals_count": 0,
        "meditation_minutes": 0,
        "pain": 8,
        "temperature_c": 38.2,
        "systolic_mmhg": 168,
        "diastolic_mmhg": 104,
        "glucose_mg_dl": 178,
        "heart_rate_bpm": 112,
        "mood": "very_bad",
        "stress_level": 10,
        "energy_level": 2,
        "sleep_quality": 2,
    },
}


# ============================================================
# 4. VALIDACIÓN
# ============================================================

def validate_record(
    record: dict[str, Any],
) -> dict[str, Any]:
    """Valida y normaliza un registro."""
    missing_features = [
        feature
        for feature in FEATURE_COLUMNS
        if feature not in record
    ]

    if missing_features:
        raise ValueError(
            "Faltan características requeridas: "
            f"{missing_features}"
        )

    normalized_record: dict[str, Any] = {}

    for feature in NUMERIC_FEATURES:
        value = record[feature]

        if value is None:
            raise ValueError(
                f"La variable {feature} no puede ser nula."
            )

        try:
            numeric_value = float(value)
        except (TypeError, ValueError) as error:
            raise ValueError(
                f"La variable {feature} debe ser numérica."
            ) from error

        if not np.isfinite(numeric_value):
            raise ValueError(
                f"La variable {feature} debe ser finita."
            )

        normalized_record[feature] = numeric_value

    mood = str(
        record["mood"]
    ).strip().lower()

    if mood not in VALID_MOODS:
        raise ValueError(
            "El valor de mood no es válido. "
            f"Valores permitidos: {sorted(VALID_MOODS)}"
        )

    normalized_record["mood"] = mood

    validate_ranges(
        normalized_record
    )

    return normalized_record


def validate_ranges(
    record: dict[str, Any],
) -> None:
    """
    Valida rangos técnicos de entrada.

    Estos límites no representan criterios diagnósticos.
    """
    ranges = {
        "age": (18, 100),
        "height_cm": (120, 220),
        "weight_kg": (30, 250),
        "bmi": (10, 70),
        "water_glasses": (0, 30),
        "exercise_minutes": (0, 600),
        "sleep_hours": (0, 24),
        "healthy_meals_count": (0, 5),
        "meditation_minutes": (0, 300),
        "pain": (0, 10),
        "temperature_c": (30, 45),
        "systolic_mmhg": (60, 250),
        "diastolic_mmhg": (30, 160),
        "glucose_mg_dl": (30, 600),
        "heart_rate_bpm": (30, 250),
        "stress_level": (1, 10),
        "energy_level": (1, 10),
        "sleep_quality": (1, 10),
    }

    invalid_values = []

    for feature, limits in ranges.items():
        minimum, maximum = limits
        value = record[feature]

        if not minimum <= value <= maximum:
            invalid_values.append(
                {
                    "feature": feature,
                    "value": value,
                    "minimum": minimum,
                    "maximum": maximum,
                }
            )

    if invalid_values:
        raise ValueError(
            "Se encontraron valores fuera de rango: "
            f"{invalid_values}"
        )


# ============================================================
# 5. MODELO E INTERPRETACIÓN
# ============================================================

def load_model() -> Any:
    """Carga el modelo Ridge seleccionado."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            "No se encontró el regresor final:\n"
            f"{MODEL_PATH}"
        )

    return joblib.load(
        MODEL_PATH
    )


def interpret_wellbeing_score(
    score: float,
) -> dict[str, str]:
    """Interpreta el puntaje estimado."""
    if score >= 75:
        return {
            "level": "high",
            "message": (
                "Los indicadores analizados reflejan un "
                "nivel general de bienestar favorable. "
                "Mantén tus hábitos y continúa registrando "
                "tu información."
            ),
        }

    if score >= 50:
        return {
            "level": "medium",
            "message": (
                "Los indicadores reflejan un nivel de "
                "bienestar intermedio. Conviene revisar "
                "hábitos como sueño, actividad, estrés "
                "y alimentación."
            ),
        }

    return {
        "level": "low",
        "message": (
            "Los indicadores reflejan un nivel de "
            "bienestar reducido. Este resultado no es un "
            "diagnóstico; considera revisar tus hábitos "
            "y buscar orientación profesional si presentas "
            "molestias."
        ),
    }


# ============================================================
# 6. INFERENCIA
# ============================================================

def predict_wellbeing(
    record: dict[str, Any],
    model: Any,
) -> dict[str, Any]:
    """Estima el puntaje de bienestar."""
    normalized_record = validate_record(
        record
    )

    input_dataframe = pd.DataFrame(
        [normalized_record],
        columns=FEATURE_COLUMNS,
    )

    raw_prediction = float(
        model.predict(
            input_dataframe
        )[0]
    )

    bounded_prediction = float(
        np.clip(
            raw_prediction,
            0,
            100,
        )
    )

    interpretation = (
        interpret_wellbeing_score(
            bounded_prediction
        )
    )

    return {
        "prediction": {
            "wellbeing_score": round(
                bounded_prediction,
                4,
            ),
            "raw_wellbeing_score": round(
                raw_prediction,
                4,
            ),
            "level": interpretation[
                "level"
            ],
        },
        "message": interpretation[
            "message"
        ],
        "input": normalized_record,
        "model_information": {
            "algorithm": "ridge_regression",
            "alpha": 10.0,
            "artifact": MODEL_PATH.name,
            "feature_count": len(
                FEATURE_COLUMNS
            ),
            "score_range": {
                "minimum": 0,
                "maximum": 100,
            },
            "data_type": "synthetic",
            "clinical_validation": False,
        },
        "disclaimer": (
            "Estimación generada con datos sintéticos. "
            "No sustituye una evaluación médica ni "
            "representa una medición clínica validada."
        ),
    }


# ============================================================
# 7. PRUEBAS CONTROLADAS
# ============================================================

def run_controlled_tests(
    model: Any,
) -> dict[str, Any]:
    """Ejecuta perfiles controlados."""
    results: dict[str, Any] = {}

    print("\n" + "=" * 65)
    print("PRUEBAS CONTROLADAS DE BIENESTAR")
    print("=" * 65)

    for profile_name, record in (
        CONTROLLED_RECORDS.items()
    ):
        result = predict_wellbeing(
            record=record,
            model=model,
        )

        results[profile_name] = result

        prediction = result[
            "prediction"
        ]

        print(f"\nPerfil: {profile_name}")
        print(
            "Puntaje estimado: "
            f"{prediction['wellbeing_score']:.4f}"
        )
        print(
            "Nivel interpretativo: "
            f"{prediction['level']}"
        )

    return results


# ============================================================
# 8. EXPORTACIÓN
# ============================================================

def save_json(
    data: dict[str, Any],
    path: Path,
) -> None:
    """Guarda un diccionario en JSON."""
    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    with path.open(
        "w",
        encoding="utf-8",
    ) as output_file:
        json.dump(
            data,
            output_file,
            ensure_ascii=False,
            indent=2,
        )


# ============================================================
# 9. PRESENTACIÓN
# ============================================================

def print_single_result(
    result: dict[str, Any],
) -> None:
    """Muestra la inferencia individual."""
    prediction = result[
        "prediction"
    ]

    print("\n" + "=" * 65)
    print("PRUEBA LOCAL DE INFERENCIA DE BIENESTAR")
    print("=" * 65)

    print(
        "Puntaje estimado: "
        f"{prediction['wellbeing_score']:.4f}"
    )

    print(
        "Predicción original: "
        f"{prediction['raw_wellbeing_score']:.4f}"
    )

    print(
        "Nivel interpretativo: "
        f"{prediction['level']}"
    )

    print("\nMensaje:")
    print(result["message"])

    print("\nAviso:")
    print(result["disclaimer"])


# ============================================================
# 10. EJECUCIÓN
# ============================================================

def main() -> None:
    """Ejecuta las pruebas de inferencia."""
    try:
        model = load_model()

        single_result = predict_wellbeing(
            record=EXAMPLE_RECORD,
            model=model,
        )

        print_single_result(
            single_result
        )

        controlled_results = (
            run_controlled_tests(
                model=model
            )
        )

        save_json(
            single_result,
            SINGLE_OUTPUT_PATH,
        )

        save_json(
            controlled_results,
            CONTROLLED_OUTPUT_PATH,
        )

        print("\nArchivos generados:")
        print(
            f"- {SINGLE_OUTPUT_PATH}"
        )
        print(
            f"- {CONTROLLED_OUTPUT_PATH}"
        )

        print(
            "\nLas pruebas locales del regresor "
            "finalizaron correctamente."
        )

    except Exception as error:
        print(
            "\nError durante la inferencia "
            "de bienestar:"
        )

        print(error)
        sys.exit(1)


if __name__ == "__main__":
    main()