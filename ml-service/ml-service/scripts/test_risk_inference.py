"""
Prueba local de inferencia del clasificador de riesgo de VitalMind AI.

Este script:
- carga el modelo final serializado;
- valida un registro individual;
- aplica el pipeline de preprocesamiento;
- genera una predicción;
- devuelve probabilidades y confianza;
- guarda un ejemplo de resultado en formato JSON.

No implementa una API ni realiza diagnósticos clínicos.
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
    / "risk-classification"
    / "best_risk_classifier_safe.joblib"
)

LABEL_ENCODER_PATH = (
    ML_SERVICE_DIR
    / "app"
    / "models"
    / "risk-classification"
    / "risk_label_encoder.joblib"
)

OUTPUT_DIR = (
    ML_SERVICE_DIR
    / "reports"
    / "inference"
)

OUTPUT_PATH = (
    OUTPUT_DIR
    / "risk_inference_example.json"
)

CONTROLLED_OUTPUT_PATH = (
    OUTPUT_DIR
    / "controlled_risk_inference_examples.json"
)

# ============================================================
# 3. REGISTRO DE EJEMPLO
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
    "low_profile": {
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
    "medium_profile": {
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
    "high_profile": {
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
    """Valida y normaliza un registro individual."""
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

    unexpected_features = [
        feature
        for feature in record
        if feature not in FEATURE_COLUMNS
    ]

    if unexpected_features:
        print(
            "Advertencia: se ignorarán variables "
            f"no utilizadas: {unexpected_features}"
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

    validate_ranges(normalized_record)

    return normalized_record


def validate_ranges(
    record: dict[str, Any],
) -> None:
    """
    Valida rangos técnicos razonables.

    Los rangos son controles de entrada y no representan
    criterios diagnósticos.
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

    for feature, (
        minimum,
        maximum,
    ) in ranges.items():
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
            "Se encontraron valores fuera de los "
            f"rangos técnicos permitidos: {invalid_values}"
        )


# ============================================================
# 5. CARGA DE ARTEFACTOS
# ============================================================

def load_artifacts() -> tuple[Any, Any]:
    """Carga el pipeline y el codificador de etiquetas."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            "No se encontró el modelo final:\n"
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
# 6. MENSAJES PREVENTIVOS
# ============================================================

def create_preventive_message(
    risk_level: str,
) -> str:
    """Genera un mensaje general según la clase."""
    messages = {
        "low": (
            "Los indicadores analizados muestran un nivel "
            "preventivo bajo. Mantén hábitos saludables y "
            "continúa registrando tu información."
        ),
        "medium": (
            "Se identificaron indicadores que conviene "
            "vigilar. Revisa tus hábitos recientes y busca "
            "orientación profesional si tienes molestias."
        ),
        "high": (
            "Se identificó un nivel preventivo elevado. "
            "Este resultado no es un diagnóstico. Considera "
            "consultar a un profesional de la salud, "
            "especialmente si presentas síntomas."
        ),
    }

    return messages.get(
        risk_level,
        (
            "No fue posible generar un mensaje "
            "para el resultado obtenido."
        ),
    )


# ============================================================
# 7. INFERENCIA
# ============================================================

def predict_risk(
    record: dict[str, Any],
    model: Any,
    label_encoder: Any,
) -> dict[str, Any]:
    """Realiza una inferencia individual."""
    normalized_record = validate_record(
        record
    )

    input_dataframe = pd.DataFrame(
        [normalized_record],
        columns=FEATURE_COLUMNS,
    )

    encoded_prediction = model.predict(
        input_dataframe
    )

    probabilities = model.predict_proba(
        input_dataframe
    )[0]

    predicted_class_index = int(
        encoded_prediction[0]
    )

    predicted_risk_level = str(
        label_encoder.inverse_transform(
            [predicted_class_index]
        )[0]
    )

    probability_by_class = {
        str(class_name): round(
            float(probabilities[class_index]),
            6,
        )
        for class_index, class_name
        in enumerate(label_encoder.classes_)
    }

    confidence = float(
        probabilities.max()
    )

    return {
        "prediction": {
            "risk_level": predicted_risk_level,
            "confidence": round(
                confidence,
                6,
            ),
            "probabilities": (
                probability_by_class
            ),
        },
        "message": create_preventive_message(
            predicted_risk_level
        ),
        "input": normalized_record,
        "model_information": {
            "algorithm": (
                "logistic_regression"
            ),
            "artifact": MODEL_PATH.name,
            "feature_count": len(
                FEATURE_COLUMNS
            ),
            "classes": (
                label_encoder
                .classes_
                .tolist()
            ),
            "data_type": "synthetic",
            "clinical_validation": False,
        },
        "disclaimer": (
            "Resultado preventivo generado con datos "
            "sintéticos. No sustituye una evaluación "
            "médica ni representa un diagnóstico."
        ),
    }


# ============================================================
# 8. EXPORTACIÓN
# ============================================================

def save_result(
    result: dict[str, Any],
) -> None:
    """Guarda el resultado del ejemplo."""
    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    with OUTPUT_PATH.open(
        "w",
        encoding="utf-8",
    ) as output_file:
        json.dump(
            result,
            output_file,
            ensure_ascii=False,
            indent=2,
        )


# ============================================================
# 9. PRESENTACIÓN
# ============================================================

def print_result(
    result: dict[str, Any],
) -> None:
    """Muestra el resultado de forma legible."""
    prediction = result[
        "prediction"
    ]

    print("\n" + "=" * 65)
    print("PRUEBA LOCAL DE INFERENCIA")
    print("=" * 65)

    print(
        "Nivel de riesgo predicho: "
        f"{prediction['risk_level']}"
    )

    print(
        "Confianza: "
        f"{prediction['confidence']:.4f}"
    )

    print("\nProbabilidades:")

    for risk_level, probability in (
        prediction["probabilities"].items()
    ):
        print(
            f"- {risk_level}: "
            f"{probability:.4f}"
        )

    print("\nMensaje preventivo:")
    print(result["message"])

    print("\nAviso:")
    print(result["disclaimer"])


# ============================================================
# 10. EJECUCIÓN
# ============================================================
def run_controlled_tests(
    model: Any,
    label_encoder: Any,
) -> dict[str, Any]:
    """Ejecuta inferencias sobre perfiles controlados."""
    results = {}

    print("\n" + "=" * 65)
    print("PRUEBAS CON PERFILES CONTROLADOS")
    print("=" * 65)

    for profile_name, record in CONTROLLED_RECORDS.items():
        result = predict_risk(
            record=record,
            model=model,
            label_encoder=label_encoder,
        )

        results[profile_name] = result

        prediction = result["prediction"]

        print(f"\nPerfil: {profile_name}")
        print(
            "Riesgo predicho: "
            f"{prediction['risk_level']}"
        )
        print(
            "Confianza: "
            f"{prediction['confidence']:.4f}"
        )
        print(
            "Probabilidades: "
            f"{prediction['probabilities']}"
        )

    return results

def main() -> None:
    """Ejecuta las pruebas locales."""
    try:
        model, label_encoder = (
            load_artifacts()
        )

        result = predict_risk(
            record=EXAMPLE_RECORD,
            model=model,
            label_encoder=label_encoder,
        )

        save_result(result)
        print_result(result)

        controlled_results = (
            run_controlled_tests(
                model=model,
                label_encoder=label_encoder,
            )
        )

        with CONTROLLED_OUTPUT_PATH.open(
            "w",
            encoding="utf-8",
        ) as controlled_file:
            json.dump(
                controlled_results,
                controlled_file,
                ensure_ascii=False,
                indent=2,
            )

        print("\nArchivos generados:")
        print(f"- {OUTPUT_PATH}")
        print(f"- {CONTROLLED_OUTPUT_PATH}")

        print(
            "\nLas pruebas locales de inferencia "
            "finalizaron correctamente."
        )

    except Exception as error:
        print(
            "\nError durante las pruebas "
            "de inferencia:"
        )
        print(error)
        sys.exit(1)

if __name__ == "__main__":
    
    main()