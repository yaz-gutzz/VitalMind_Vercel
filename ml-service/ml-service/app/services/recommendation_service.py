"""
Motor de recomendaciones preventivas de VitalMind AI.

Las recomendaciones se generan mediante reglas transparentes
basadas en los objetivos de hábitos definidos por el proyecto.

No representan diagnósticos ni recomendaciones clínicas.
"""

from __future__ import annotations

from typing import Any


# ============================================================
# 1. OBJETIVOS DE HÁBITOS DEL PROYECTO
# ============================================================

WATER_GOAL = 8.0
EXERCISE_GOAL = 30.0
SLEEP_GOAL = 8.0
HEALTHY_MEALS_GOAL = 3.0
MEDITATION_GOAL = 10.0

MAX_RECOMMENDATIONS = 5


# ============================================================
# 2. FUNCIONES AUXILIARES
# ============================================================

def _get_numeric_value(
    features: dict[str, Any],
    field_name: str,
) -> float | None:
    """
    Recupera un valor numérico del diccionario.

    Si el valor no existe o no puede convertirse,
    devuelve None.
    """

    value = features.get(
        field_name
    )

    if value is None:
        return None

    try:
        return float(value)

    except (
        TypeError,
        ValueError,
    ):
        return None


def _add_recommendation(
    recommendations: list[str],
    recommendation: str,
) -> None:
    """
    Agrega una recomendación evitando duplicados
    y respetando el límite máximo.
    """

    if (
        recommendation
        not in recommendations
        and len(recommendations)
        < MAX_RECOMMENDATIONS
    ):
        recommendations.append(
            recommendation
        )


# ============================================================
# 3. RECOMENDACIONES DE HÁBITOS
# ============================================================

def _evaluate_sleep(
    features: dict[str, Any],
    recommendations: list[str],
) -> None:
    """
    Evalúa duración y calidad del sueño.
    """

    sleep_hours = _get_numeric_value(
        features,
        "sleep_hours",
    )

    sleep_quality = _get_numeric_value(
        features,
        "sleep_quality",
    )

    if (
        sleep_hours is not None
        and sleep_hours < SLEEP_GOAL
    ):
        _add_recommendation(
            recommendations,
            (
                "Procura mejorar gradualmente la "
                "regularidad y duración de tu descanso."
            ),
        )

    if (
        sleep_quality is not None
        and sleep_quality <= 5
    ):
        _add_recommendation(
            recommendations,
            (
                "Considera revisar tu rutina nocturna "
                "y reducir factores que puedan afectar "
                "la calidad de tu sueño."
            ),
        )


def _evaluate_activity(
    features: dict[str, Any],
    recommendations: list[str],
) -> None:
    """
    Evalúa actividad física registrada.
    """

    exercise_minutes = _get_numeric_value(
        features,
        "exercise_minutes",
    )

    if (
        exercise_minutes is not None
        and exercise_minutes < EXERCISE_GOAL
    ):
        _add_recommendation(
            recommendations,
            (
                "Intenta incorporar gradualmente más "
                "actividad física a tu rutina diaria, "
                "de acuerdo con tus posibilidades."
            ),
        )


def _evaluate_hydration(
    features: dict[str, Any],
    recommendations: list[str],
) -> None:
    """
    Evalúa la meta de hidratación definida por VitalMind.
    """

    water_glasses = _get_numeric_value(
        features,
        "water_glasses",
    )

    if (
        water_glasses is not None
        and water_glasses < WATER_GOAL
    ):
        _add_recommendation(
            recommendations,
            (
                "Procura mantener una hidratación "
                "regular durante el día y acercarte "
                "gradualmente a tu meta registrada."
            ),
        )


def _evaluate_nutrition(
    features: dict[str, Any],
    recommendations: list[str],
) -> None:
    """
    Evalúa el conteo de comidas saludables.
    """

    healthy_meals = _get_numeric_value(
        features,
        "healthy_meals_count",
    )

    if (
        healthy_meals is not None
        and healthy_meals
        < HEALTHY_MEALS_GOAL
    ):
        _add_recommendation(
            recommendations,
            (
                "Busca mantener mayor constancia en "
                "tus comidas saludables durante el día."
            ),
        )


def _evaluate_stress(
    features: dict[str, Any],
    recommendations: list[str],
) -> None:
    """
    Evalúa estrés y meditación.
    """

    stress_level = _get_numeric_value(
        features,
        "stress_level",
    )

    meditation_minutes = (
        _get_numeric_value(
            features,
            "meditation_minutes",
        )
    )

    if (
        stress_level is not None
        and stress_level >= 7
    ):
        _add_recommendation(
            recommendations,
            (
                "Tu registro muestra un nivel de estrés "
                "elevado dentro de la escala de VitalMind. "
                "Considera incorporar pausas, respiración "
                "o actividades de relajación."
            ),
        )

    elif (
        meditation_minutes is not None
        and meditation_minutes
        < MEDITATION_GOAL
    ):
        _add_recommendation(
            recommendations,
            (
                "Puedes incorporar algunos minutos de "
                "relajación, respiración consciente o "
                "meditación en tu rutina."
            ),
        )


def _evaluate_energy(
    features: dict[str, Any],
    recommendations: list[str],
) -> None:
    """
    Evalúa el nivel de energía reportado.
    """

    energy_level = _get_numeric_value(
        features,
        "energy_level",
    )

    if (
        energy_level is not None
        and energy_level <= 4
    ):
        _add_recommendation(
            recommendations,
            (
                "Tu nivel de energía registrado es bajo "
                "dentro de la escala de VitalMind. "
                "Revisa especialmente descanso, "
                "alimentación y actividad diaria."
            ),
        )


# ============================================================
# 4. RESULTADOS GENERALES DEL MODELO
# ============================================================

def _evaluate_model_results(
    risk_level: str,
    wellbeing_score: float,
    recommendations: list[str],
) -> None:
    """
    Agrega orientación general según los resultados
    preventivos de los modelos.

    No interpreta estos resultados como diagnósticos.
    """

    normalized_risk = (
        str(risk_level)
        .strip()
        .lower()
    )

    if normalized_risk == "high":
        _add_recommendation(
            recommendations,
            (
                "El análisis preventivo de VitalMind "
                "identificó un nivel de riesgo alto. "
                "Considera revisar estos resultados "
                "con un profesional de la salud."
            ),
        )

    if wellbeing_score < 50:
        _add_recommendation(
            recommendations,
            (
                "Tu puntaje de bienestar sugiere que "
                "conviene prestar mayor atención a tus "
                "hábitos y continuar registrando tu "
                "evolución."
            ),
        )


# ============================================================
# 5. FUNCIÓN PRINCIPAL
# ============================================================

def generate_recommendations(
    features: dict[str, Any],
    risk_level: str,
    wellbeing_score: float,
) -> list[str]:
    """
    Genera recomendaciones preventivas para un registro.

    Parámetros:
    - features:
        Variables utilizadas durante el análisis.
    - risk_level:
        Resultado del clasificador preventivo.
    - wellbeing_score:
        Puntaje estimado de bienestar.

    Retorna:
    - Lista de recomendaciones.
    """

    recommendations: list[str] = []

    _evaluate_model_results(
        risk_level=risk_level,
        wellbeing_score=wellbeing_score,
        recommendations=recommendations,
    )

    _evaluate_sleep(
        features,
        recommendations,
    )

    _evaluate_activity(
        features,
        recommendations,
    )

    _evaluate_hydration(
        features,
        recommendations,
    )

    _evaluate_nutrition(
        features,
        recommendations,
    )

    _evaluate_stress(
        features,
        recommendations,
    )

    _evaluate_energy(
        features,
        recommendations,
    )

    if not recommendations:
        recommendations.append(
            (
                "Mantén la constancia en tus hábitos "
                "actuales y continúa registrando tu "
                "información en VitalMind."
            )
        )

    return recommendations[
        :MAX_RECOMMENDATIONS
    ]