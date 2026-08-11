"""
Generador de dataset sintético para VitalMind AI.

Este script crea registros diarios coherentes para usuarios anónimos,
siguiendo las reglas definidas en:

- docs/data-dictionary.md
- docs/ml-problem-definition.md
- docs/simulation-rules.md

El dataset generado es sintético y no representa información clínica real.
"""

from pathlib import Path
import random
import sys

import numpy as np
import pandas as pd


# ============================================================
# 1. CONFIGURACIÓN GENERAL
# ============================================================

RANDOM_SEED = 2026

NUM_USERS = 250
NUM_RECORDS = 5000
NUM_DAYS = 90

START_DATE = "2026-04-01"

MISSING_RATE = 0.03
ANOMALY_RATE = 0.03

RISK_LEVELS = ("low", "medium", "high")

MOOD_VALUES = (
    "Muy bien",
    "Bien",
    "Regular",
    "Mal",
    "Muy mal",
)

MOOD_SCORE_MAP = {
    "Muy mal": 10,
    "Mal": 30,
    "Regular": 50,
    "Bien": 75,
    "Muy bien": 95,
}

np.random.seed(RANDOM_SEED)
random.seed(RANDOM_SEED)


# ============================================================
# 2. RUTAS
# ============================================================

SCRIPT_PATH = Path(__file__).resolve()
ML_SERVICE_DIR = SCRIPT_PATH.parent.parent

RAW_DATA_DIR = ML_SERVICE_DIR / "data" / "raw"
RAW_DATA_PATH = RAW_DATA_DIR / "vitalmind_dataset_raw.csv"


# ============================================================
# 3. FUNCIONES AUXILIARES
# ============================================================

def clip(value: float, minimum: float, maximum: float) -> float:
    """Limita un valor a un rango determinado."""
    return float(np.clip(value, minimum, maximum))


def round_value(value: float, decimals: int = 2) -> float:
    """Redondea un valor numérico."""
    return round(float(value), decimals)


def calculate_bmi(weight_kg: float, height_cm: float) -> float:
    """Calcula el índice de masa corporal."""
    if height_cm <= 0:
        return np.nan

    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)

    return round_value(bmi, 2)


def normalize_scale_1_to_10(value: float) -> float:
    """Convierte una escala de 1 a 10 en una escala de 0 a 100."""
    value = clip(value, 1, 10)
    return ((value - 1) / 9) * 100


def inverse_scale_1_to_10(value: float) -> float:
    """Invierte una escala de 1 a 10 y la convierte en 0 a 100."""
    return 100 - normalize_scale_1_to_10(value)


def calculate_sleep_hours_score(sleep_hours: float) -> float:
    """
    Calcula un puntaje de sueño.

    El valor ideal se encuentra aproximadamente entre 7 y 9 horas.
    Dormir menos o demasiado reduce el puntaje.
    """
    distance_from_ideal = abs(sleep_hours - 8)
    score = 100 - (distance_from_ideal * 20)

    return clip(score, 0, 100)


def calculate_activity_score(exercise_minutes: float) -> float:
    """Calcula el puntaje de actividad física."""
    score = min(exercise_minutes / 60, 1) * 100

    if exercise_minutes > 150:
        score -= 10

    return clip(score, 0, 100)


def calculate_water_score(water_glasses: float) -> float:
    """Calcula un puntaje de hidratación usando 8 vasos como referencia."""
    if water_glasses <= 8:
        score = (water_glasses / 8) * 100
    else:
        excess = water_glasses - 8
        score = 100 - (excess * 5)

    return clip(score, 0, 100)


def calculate_meals_score(healthy_meals_count: int) -> float:
    """Calcula un puntaje de alimentación usando 3 comidas como referencia."""
    score = min(healthy_meals_count / 3, 1) * 100
    return clip(score, 0, 100)


def calculate_temperature_score(temperature_c: float) -> float:
    """Calcula un puntaje de temperatura respecto a un rango habitual."""
    if 36.0 <= temperature_c <= 37.5:
        return 100

    distance = min(
        abs(temperature_c - 36.0),
        abs(temperature_c - 37.5),
    )

    return clip(100 - distance * 35, 0, 100)


def calculate_heart_rate_score(heart_rate_bpm: float) -> float:
    """Calcula un puntaje para la frecuencia cardiaca."""
    if 60 <= heart_rate_bpm <= 100:
        return 100

    if heart_rate_bpm < 60:
        distance = 60 - heart_rate_bpm
    else:
        distance = heart_rate_bpm - 100

    return clip(100 - distance * 2, 0, 100)


def calculate_blood_pressure_score(
    systolic_mmhg: float,
    diastolic_mmhg: float,
) -> float:
    """Calcula un puntaje aproximado de presión arterial."""
    systolic_distance = 0.0
    diastolic_distance = 0.0

    if systolic_mmhg < 100:
        systolic_distance = 100 - systolic_mmhg
    elif systolic_mmhg > 140:
        systolic_distance = systolic_mmhg - 140

    if diastolic_mmhg < 60:
        diastolic_distance = 60 - diastolic_mmhg
    elif diastolic_mmhg > 90:
        diastolic_distance = diastolic_mmhg - 90

    total_penalty = systolic_distance * 1.2 + diastolic_distance * 1.5

    return clip(100 - total_penalty, 0, 100)


def calculate_glucose_score(glucose_mg_dl: float) -> float:
    """Calcula un puntaje aproximado de glucosa."""
    if 70 <= glucose_mg_dl <= 140:
        return 100

    if glucose_mg_dl < 70:
        distance = 70 - glucose_mg_dl
    else:
        distance = glucose_mg_dl - 140

    return clip(100 - distance * 0.7, 0, 100)


def select_mood(
    stress_level: float,
    energy_level: float,
    sleep_quality: float,
    pain: float,
) -> str:
    """Selecciona el estado de ánimo a partir de variables relacionadas."""
    emotional_value = (
        energy_level * 0.35
        + sleep_quality * 0.25
        + (11 - stress_level) * 0.30
        + (10 - pain) * 0.10
        + np.random.normal(0, 0.8)
    )

    if emotional_value >= 8.2:
        return "Muy bien"
    if emotional_value >= 6.5:
        return "Bien"
    if emotional_value >= 4.8:
        return "Regular"
    if emotional_value >= 3.2:
        return "Mal"

    return "Muy mal"


def calculate_physical_condition_score(
    pain: float,
    temperature_c: float,
    heart_rate_bpm: float,
    systolic_mmhg: float,
    diastolic_mmhg: float,
    glucose_mg_dl: float,
) -> float:
    """Calcula el puntaje físico a partir de síntomas y signos."""
    inverse_pain_score = 100 - pain * 10

    temperature_score = calculate_temperature_score(temperature_c)
    heart_rate_score = calculate_heart_rate_score(heart_rate_bpm)

    blood_pressure_score = calculate_blood_pressure_score(
        systolic_mmhg,
        diastolic_mmhg,
    )

    glucose_score = calculate_glucose_score(glucose_mg_dl)

    score = (
        inverse_pain_score * 0.30
        + temperature_score * 0.20
        + heart_rate_score * 0.20
        + blood_pressure_score * 0.20
        + glucose_score * 0.10
    )

    return clip(score, 0, 100)


def count_risk_factors(row: dict) -> int:
    """Cuenta factores desfavorables presentes en un registro."""
    factors = [
        row["sleep_hours"] < 5,
        row["exercise_minutes"] < 10,
        row["water_glasses"] < 4,
        row["healthy_meals_count"] == 0,
        row["stress_level"] >= 8,
        row["energy_level"] <= 3,
        row["sleep_quality"] <= 3,
        row["pain"] >= 7,
        row["heart_rate_bpm"] < 45,
        row["heart_rate_bpm"] > 130,
        row["temperature_c"] >= 38,
        row["mood"] in ("Mal", "Muy mal"),
    ]

    return sum(bool(factor) for factor in factors)


def assign_risk_level(
    wellbeing_score: float,
    risk_factors_count: int,
    is_anomaly: bool,
) -> str:
    """
    Asigna un nivel preventivo de riesgo.

    La etiqueta no depende únicamente de wellbeing_score.
    """
    if wellbeing_score < 45:
        risk_level = "high"
    elif wellbeing_score < 70:
        risk_level = "medium"
    else:
        risk_level = "low"

    if risk_factors_count >= 5:
        risk_level = "high"
    elif risk_factors_count >= 3 and risk_level == "low":
        risk_level = "medium"

    if is_anomaly and risk_level == "low":
        risk_level = "medium"

    # Ruido limitado en casos cercanos a los umbrales.
    near_lower_threshold = 42 <= wellbeing_score <= 48
    near_upper_threshold = 67 <= wellbeing_score <= 73

    if (near_lower_threshold or near_upper_threshold) and random.random() < 0.08:
        if risk_level == "low":
            risk_level = "medium"
        elif risk_level == "medium":
            risk_level = random.choice(["low", "high"])
        else:
            risk_level = "medium"

    return risk_level


# ============================================================
# 4. PERFILES BASE
# ============================================================

PROFILE_CONFIG = {
    "healthy": {
        "probability": 0.35,
        "sleep_mean": 7.8,
        "exercise_mean": 45,
        "water_mean": 8,
        "healthy_meals_mean": 3,
        "meditation_mean": 15,
        "stress_mean": 3.5,
        "energy_mean": 7.5,
        "sleep_quality_mean": 8,
        "pain_mean": 1.5,
    },
    "irregular": {
        "probability": 0.30,
        "sleep_mean": 6.5,
        "exercise_mean": 25,
        "water_mean": 6,
        "healthy_meals_mean": 2,
        "meditation_mean": 7,
        "stress_mean": 5.5,
        "energy_mean": 5.5,
        "sleep_quality_mean": 6,
        "pain_mean": 3,
    },
    "poor_habits": {
        "probability": 0.23,
        "sleep_mean": 5.3,
        "exercise_mean": 8,
        "water_mean": 3.5,
        "healthy_meals_mean": 1,
        "meditation_mean": 2,
        "stress_mean": 7.5,
        "energy_mean": 3.5,
        "sleep_quality_mean": 4,
        "pain_mean": 4.5,
    },
    "physically_vulnerable": {
        "probability": 0.12,
        "sleep_mean": 6,
        "exercise_mean": 12,
        "water_mean": 5,
        "healthy_meals_mean": 2,
        "meditation_mean": 5,
        "stress_mean": 6.5,
        "energy_mean": 4.5,
        "sleep_quality_mean": 5,
        "pain_mean": 6,
    },
}


def choose_profile() -> str:
    """Selecciona un perfil base según las probabilidades definidas."""
    profile_names = list(PROFILE_CONFIG.keys())

    probabilities = [
        PROFILE_CONFIG[name]["probability"]
        for name in profile_names
    ]

    return str(
        np.random.choice(
            profile_names,
            p=probabilities,
        )
    )


def generate_user_profiles() -> pd.DataFrame:
    """Genera la información estable de los usuarios sintéticos."""
    users = []

    for index in range(1, NUM_USERS + 1):
        profile_type = choose_profile()

        age = int(
            np.clip(
                np.random.normal(36, 14),
                18,
                80,
            )
        )

        height_cm = round_value(
            np.clip(
                np.random.normal(165, 10),
                140,
                200,
            ),
            1,
        )

        base_bmi = clip(
            np.random.normal(25.5, 5.2),
            17,
            45,
        )

        height_m = height_cm / 100
        weight_profile_kg = base_bmi * (height_m ** 2)

        weight_profile_kg = round_value(
            clip(weight_profile_kg, 40, 180),
            1,
        )

        user = {
            "user_id": f"USR_{index:04d}",
            "profile_type": profile_type,
            "age": age,
            "height_cm": height_cm,
            "weight_profile_kg": weight_profile_kg,
        }

        users.append(user)

    return pd.DataFrame(users)


# ============================================================
# 5. SELECCIÓN DE USUARIOS Y FECHAS
# ============================================================

def generate_user_date_pairs() -> pd.DataFrame:
    """Genera combinaciones únicas de usuario y fecha."""
    dates = pd.date_range(
        start=START_DATE,
        periods=NUM_DAYS,
        freq="D",
    )

    pairs = [
        {
            "user_id": f"USR_{user_index:04d}",
            "log_date": date,
        }
        for user_index in range(1, NUM_USERS + 1)
        for date in dates
    ]

    pairs_df = pd.DataFrame(pairs)

    selected_pairs = pairs_df.sample(
        n=NUM_RECORDS,
        random_state=RANDOM_SEED,
        replace=False,
    )

    selected_pairs = selected_pairs.sort_values(
        by=["user_id", "log_date"]
    ).reset_index(drop=True)

    selected_pairs["record_id"] = [
        f"REC_{index:06d}"
        for index in range(1, len(selected_pairs) + 1)
    ]

    return selected_pairs


# ============================================================
# 6. GENERACIÓN DE REGISTROS DIARIOS
# ============================================================

def generate_daily_record(
    user: pd.Series,
    log_date: pd.Timestamp,
    previous_record: dict | None,
    force_anomaly: bool,
) -> dict:
    """Genera un registro diario para un usuario."""
    profile = PROFILE_CONFIG[user["profile_type"]]

    temporal_noise = np.random.normal(0, 1)

    if previous_record is None:
        previous_sleep = profile["sleep_mean"]
        previous_stress = profile["stress_mean"]
        previous_energy = profile["energy_mean"]
        previous_weight = user["weight_profile_kg"]
    else:
        previous_sleep = previous_record["sleep_hours"]
        previous_stress = previous_record["stress_level"]
        previous_energy = previous_record["energy_level"]
        previous_weight = previous_record["weight_kg"]

    sleep_hours = (
        previous_sleep * 0.55
        + profile["sleep_mean"] * 0.45
        + np.random.normal(0, 0.8)
    )

    sleep_hours = clip(sleep_hours, 3, 10)

    exercise_minutes = np.random.normal(
        profile["exercise_mean"],
        18,
    )

    exercise_minutes += temporal_noise * 3
    exercise_minutes = clip(exercise_minutes, 0, 180)

    water_glasses = np.random.normal(
        profile["water_mean"],
        2,
    )

    water_glasses += exercise_minutes / 90
    water_glasses = clip(water_glasses, 0, 16)

    healthy_meals_count = int(
        np.clip(
            round(
                np.random.normal(
                    profile["healthy_meals_mean"],
                    1,
                )
            ),
            0,
            5,
        )
    )

    meditation_minutes = np.random.normal(
        profile["meditation_mean"],
        10,
    )

    meditation_minutes = clip(
        meditation_minutes,
        0,
        120,
    )

    sleep_quality = (
        profile["sleep_quality_mean"] * 0.45
        + sleep_hours * 0.55
        + np.random.normal(0, 1)
    )

    sleep_quality = clip(sleep_quality, 1, 10)

    stress_level = (
        previous_stress * 0.35
        + profile["stress_mean"] * 0.45
        + (8 - sleep_hours) * 0.35
        - exercise_minutes / 90
        - meditation_minutes / 100
        + np.random.normal(0, 0.9)
    )

    stress_level = clip(stress_level, 1, 10)

    energy_level = (
        previous_energy * 0.30
        + profile["energy_mean"] * 0.35
        + sleep_quality * 0.25
        + exercise_minutes / 80
        - stress_level * 0.25
        + np.random.normal(0, 0.8)
    )

    energy_level = clip(energy_level, 1, 10)

    pain = (
        profile["pain_mean"]
        + stress_level * 0.15
        - sleep_hours * 0.12
        - water_glasses * 0.05
        + np.random.normal(0, 1.2)
    )

    pain = clip(round(pain), 0, 10)

    temperature_c = np.random.normal(36.7, 0.35)

    if user["profile_type"] == "physically_vulnerable":
        temperature_c += np.random.normal(0.15, 0.30)

    temperature_c = clip(temperature_c, 35.0, 42.0)

    age_effect = max(user["age"] - 40, 0)

    systolic_mmhg = (
        112
        + age_effect * 0.35
        + stress_level * 1.4
        + np.random.normal(0, 10)
    )

    systolic_mmhg = clip(
        round(systolic_mmhg),
        80,
        220,
    )

    diastolic_mmhg = (
        70
        + age_effect * 0.15
        + stress_level * 0.8
        + np.random.normal(0, 7)
    )

    diastolic_mmhg = clip(
        round(diastolic_mmhg),
        50,
        130,
    )

    if diastolic_mmhg >= systolic_mmhg:
        diastolic_mmhg = systolic_mmhg - random.randint(20, 45)

    glucose_mg_dl = (
        90
        + max(user["age"] - 45, 0) * 0.6
        + max(user["weight_profile_kg"] - 80, 0) * 0.4
        - exercise_minutes * 0.08
        + np.random.normal(0, 15)
    )

    glucose_mg_dl = clip(
        round(glucose_mg_dl),
        50,
        350,
    )

    heart_rate_bpm = (
        72
        + stress_level * 1.8
        - exercise_minutes * 0.06
        + pain * 1.2
        + np.random.normal(0, 8)
    )

    heart_rate_bpm = clip(
        round(heart_rate_bpm),
        40,
        200,
    )

    daily_weight_change = np.random.normal(0, 0.18)

    weight_kg = clip(
        previous_weight + daily_weight_change,
        40,
        180,
    )

    is_anomaly = bool(force_anomaly)

    if is_anomaly:
        anomaly_type = random.choice(
            [
                "sleep_drop",
                "stress_increase",
                "exercise_drop",
                "pain_increase",
                "heart_rate_change",
                "combined_deterioration",
            ]
        )

        if anomaly_type == "sleep_drop":
            sleep_hours = clip(sleep_hours - random.uniform(2, 4), 1, 10)
            sleep_quality = clip(sleep_quality - random.uniform(2, 4), 1, 10)
            energy_level = clip(energy_level - random.uniform(1, 3), 1, 10)

        elif anomaly_type == "stress_increase":
            stress_level = clip(stress_level + random.uniform(2, 5), 1, 10)
            sleep_quality = clip(sleep_quality - random.uniform(1, 3), 1, 10)

        elif anomaly_type == "exercise_drop":
            exercise_minutes = clip(
                exercise_minutes - random.uniform(20, 60),
                0,
                180,
            )

        elif anomaly_type == "pain_increase":
            pain = clip(pain + random.randint(3, 6), 0, 10)

        elif anomaly_type == "heart_rate_change":
            heart_rate_bpm = clip(
                heart_rate_bpm + random.randint(30, 70),
                40,
                200,
            )

        elif anomaly_type == "combined_deterioration":
            sleep_hours = clip(sleep_hours - random.uniform(1.5, 3), 1, 10)
            stress_level = clip(stress_level + random.uniform(2, 4), 1, 10)
            energy_level = clip(energy_level - random.uniform(1, 3), 1, 10)
            pain = clip(pain + random.randint(2, 5), 0, 10)
            exercise_minutes = clip(exercise_minutes * 0.25, 0, 180)

    mood = select_mood(
        stress_level=stress_level,
        energy_level=energy_level,
        sleep_quality=sleep_quality,
        pain=pain,
    )

    water_glasses = round_value(water_glasses * 1)
    water_liters = round_value(water_glasses * 0.25, 2)

    bmi = calculate_bmi(
        weight_kg=weight_kg,
        height_cm=user["height_cm"],
    )

    sleep_hours_score = calculate_sleep_hours_score(sleep_hours)

    sleep_score = (
        sleep_hours_score * 0.60
        + normalize_scale_1_to_10(sleep_quality) * 0.40
    )

    activity_score = calculate_activity_score(exercise_minutes)

    nutrition_score = (
        calculate_water_score(water_glasses) * 0.55
        + calculate_meals_score(healthy_meals_count) * 0.45
    )

    mood_score = MOOD_SCORE_MAP[mood]

    emotional_score = (
        mood_score * 0.30
        + normalize_scale_1_to_10(energy_level) * 0.25
        + inverse_scale_1_to_10(stress_level) * 0.25
        + normalize_scale_1_to_10(sleep_quality) * 0.20
    )

    physical_condition_score = calculate_physical_condition_score(
        pain=pain,
        temperature_c=temperature_c,
        heart_rate_bpm=heart_rate_bpm,
        systolic_mmhg=systolic_mmhg,
        diastolic_mmhg=diastolic_mmhg,
        glucose_mg_dl=glucose_mg_dl,
    )

    wellbeing_score = (
        sleep_score * 0.25
        + activity_score * 0.20
        + nutrition_score * 0.15
        + emotional_score * 0.25
        + physical_condition_score * 0.15
        + np.random.uniform(-5, 5)
    )

    wellbeing_score = clip(wellbeing_score, 0, 100)

    record = {
        "user_id": user["user_id"],
        "log_date": log_date.strftime("%Y-%m-%d"),
        "profile_type": user["profile_type"],
        "age": int(user["age"]),
        "height_cm": round_value(user["height_cm"], 1),
        "weight_profile_kg": round_value(user["weight_profile_kg"], 1),
        "weight_kg": round_value(weight_kg, 1),
        "bmi": round_value(bmi, 2),
        "water_glasses": water_glasses,
        "water_liters":water_liters,
        "exercise_minutes": round_value(exercise_minutes, 1),
        "sleep_hours": round_value(sleep_hours, 1),
        "healthy_meals_count": int(healthy_meals_count),
        "meditation_minutes": round_value(meditation_minutes, 1),
        "pain": int(pain),
        "temperature_c": round_value(temperature_c, 1),
        "systolic_mmhg": int(round(systolic_mmhg)),
        "diastolic_mmhg": int(round(diastolic_mmhg)),
        "glucose_mg_dl": int(round(glucose_mg_dl)),
        "heart_rate_bpm": int(round(heart_rate_bpm)),
        "mood": mood,
        "stress_level": int(round(stress_level)),
        "energy_level": int(round(energy_level)),
        "sleep_quality": int(round(sleep_quality)),
        "sleep_score": round_value(sleep_score, 2),
        "activity_score": round_value(activity_score, 2),
        "nutrition_score": round_value(nutrition_score, 2),
        "emotional_score": round_value(emotional_score, 2),
        "physical_condition_score": round_value(
            physical_condition_score,
            2,
        ),
        "wellbeing_score": round_value(wellbeing_score, 2),
        "is_anomaly": is_anomaly,
    }

    record["risk_factors_count"] = count_risk_factors(record)

    record["risk_level"] = assign_risk_level(
        wellbeing_score=record["wellbeing_score"],
        risk_factors_count=record["risk_factors_count"],
        is_anomaly=record["is_anomaly"],
    )

    return record


def generate_dataset() -> pd.DataFrame:
    """Genera el dataset sintético completo."""
    users_df = generate_user_profiles()
    pairs_df = generate_user_date_pairs()

    users_by_id = users_df.set_index("user_id",drop=False)

    anomaly_count = max(1, int(NUM_RECORDS * ANOMALY_RATE))

    anomaly_indices = set(
        np.random.choice(
            pairs_df.index,
            size=anomaly_count,
            replace=False,
        )
    )

    records = []
    previous_records: dict[str, dict] = {}

    for row_index, pair in pairs_df.iterrows():
        user_id = pair["user_id"]
        user = users_by_id.loc[user_id]

        previous_record = previous_records.get(user_id)

        record = generate_daily_record(
            user=user,
            log_date=pair["log_date"],
            previous_record=previous_record,
            force_anomaly=row_index in anomaly_indices,
        )

        record["record_id"] = pair["record_id"]

        records.append(record)
        previous_records[user_id] = record

    dataset = pd.DataFrame(records)

    column_order = [
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

    return dataset[column_order]


# ============================================================
# 7. VALORES FALTANTES
# ============================================================

def introduce_missing_values(dataset: pd.DataFrame) -> pd.DataFrame:
    """Introduce valores faltantes controlados en variables opcionales."""
    dataset = dataset.copy()

    nullable_columns = [
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

    for column in nullable_columns:
        missing_count = int(len(dataset) * MISSING_RATE)

        missing_indices = np.random.choice(
            dataset.index,
            size=missing_count,
            replace=False,
        )

        dataset.loc[missing_indices, column] = np.nan

    return dataset


# ============================================================
# 8. VALIDACIONES BÁSICAS
# ============================================================

def validate_generated_dataset(dataset: pd.DataFrame) -> list[str]:
    """Realiza validaciones esenciales antes de exportar."""
    errors = []

    if len(dataset) != NUM_RECORDS:
        errors.append(
            f"Se esperaban {NUM_RECORDS} registros y se generaron "
            f"{len(dataset)}."
        )

    if dataset["record_id"].duplicated().any():
        errors.append("Existen record_id duplicados.")

    if dataset[["user_id", "log_date"]].duplicated().any():
        errors.append("Existen registros repetidos por usuario y fecha.")

    if dataset["record_id"].isna().any():
        errors.append("Existen record_id vacíos.")

    if dataset["user_id"].isna().any():
        errors.append("Existen user_id vacíos.")

    if dataset["log_date"].isna().any():
        errors.append("Existen fechas vacías.")

    if dataset["risk_level"].isna().any():
        errors.append("Existen valores vacíos en risk_level.")

    if dataset["wellbeing_score"].isna().any():
        errors.append("Existen valores vacíos en wellbeing_score.")

    invalid_risk_levels = set(
        dataset["risk_level"].dropna().unique()
    ) - set(RISK_LEVELS)

    if invalid_risk_levels:
        errors.append(
            "Se encontraron niveles de riesgo inválidos: "
            f"{invalid_risk_levels}"
        )

    if not dataset["wellbeing_score"].between(0, 100).all():
        errors.append("Existen wellbeing_score fuera de 0 a 100.")

    if not dataset["sleep_score"].between(0, 100).all():
        errors.append("Existen sleep_score fuera de 0 a 100.")

    if not dataset["activity_score"].between(0, 100).all():
        errors.append("Existen activity_score fuera de 0 a 100.")

    invalid_pressure = (
        dataset["systolic_mmhg"].notna()
        & dataset["diastolic_mmhg"].notna()
        & (
            dataset["systolic_mmhg"]
            <= dataset["diastolic_mmhg"]
        )
    )

    if invalid_pressure.any():
        errors.append(
            "Existen registros donde la presión sistólica "
            "no es mayor que la diastólica."
        )

    return errors


# ============================================================
# 9. RESUMEN
# ============================================================

def print_dataset_summary(dataset: pd.DataFrame) -> None:
    """Muestra un resumen del dataset generado."""
    risk_distribution = (
        dataset["risk_level"]
        .value_counts(normalize=True)
        .mul(100)
        .round(2)
    )

    total_cells = dataset.shape[0] * dataset.shape[1]
    total_missing = int(dataset.isna().sum().sum())

    missing_percentage = (
        total_missing / total_cells * 100
        if total_cells > 0
        else 0
    )

    anomaly_percentage = (
        dataset["is_anomaly"].mean() * 100
    )

    print("\nDataset generado correctamente.")
    print("=" * 50)
    print(f"Usuarios: {dataset['user_id'].nunique()}")
    print(f"Registros: {len(dataset)}")
    print(
        "Periodo: "
        f"{dataset['log_date'].min()} a "
        f"{dataset['log_date'].max()}"
    )

    print("\nDistribución de riesgo:")

    for risk_level in RISK_LEVELS:
        percentage = risk_distribution.get(risk_level, 0)
        print(f"{risk_level:<8}: {percentage:.2f} %")

    print(
        f"\nValores faltantes globales: "
        f"{missing_percentage:.2f} %"
    )

    print(
        f"Anomalías sintéticas: "
        f"{anomaly_percentage:.2f} %"
    )

    print(f"\nArchivo generado:\n{RAW_DATA_PATH}")


# ============================================================
# 10. EJECUCIÓN PRINCIPAL
# ============================================================

def main() -> None:
    """Ejecuta el proceso completo de generación."""
    try:
        RAW_DATA_DIR.mkdir(
            parents=True,
            exist_ok=True,
        )

        dataset = generate_dataset()
        dataset = introduce_missing_values(dataset)

        validation_errors = validate_generated_dataset(dataset)

        if validation_errors:
            print(
                "\nNo fue posible exportar el dataset "
                "debido a errores de validación:\n"
            )

            for error in validation_errors:
                print(f"- {error}")

            sys.exit(1)

        dataset.to_csv(
            RAW_DATA_PATH,
            index=False,
            encoding="utf-8-sig",
        )

        print_dataset_summary(dataset)

    except Exception as error:
        print(
            "\nOcurrió un error durante la generación "
            "del dataset:"
        )
        print(error)
        sys.exit(1)


if __name__ == "__main__":
    main()