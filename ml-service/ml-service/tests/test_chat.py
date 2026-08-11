from __future__ import annotations

from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app


VALID_CHAT_PAYLOAD = {
    "request_id": "REQ-CHAT-TEST-001",
    "user_id": "USR_TEST_001",
    "analysis_date": "2026-08-09",
    "message": (
        "¿Qué puedo hacer para mejorar mi bienestar?"
    ),
    "context": {
        "risk_level": "medium",
        "wellbeing_score": 68.4,
        "wellbeing_level": "medium",
        "bmi": 26.1,
        "recommendations": [
            "Dormir entre 7 y 9 horas",
            "Reducir el estrés",
            "Realizar actividad física de forma regular",
        ],
    },
}


def test_chat_success() -> None:
    """
    Verifica una respuesta exitosa sin llamar
    realmente a Mistral.
    """

    fake_answer = (
        "Puedes mejorar gradualmente tus hábitos "
        "de sueño, actividad física y manejo del estrés."
    )

    with TestClient(app) as client:
        with patch(
            "app.api.chat.ChatService.generate_response",
            return_value=fake_answer,
        ):
            response = client.post(
                "/api/v1/chat",
                json=VALID_CHAT_PAYLOAD,
            )

    assert response.status_code == 200

    body = response.json()

    assert (
        body["request_id"]
        == "REQ-CHAT-TEST-001"
    )

    assert (
        body["user_id"]
        == "USR_TEST_001"
    )

    assert body["answer"] == fake_answer

    assert (
        body["metadata"]["provider"]
        == "mistral"
    )

    assert (
        body["metadata"]["model"]
        == "mistral-small-latest"
    )

    assert (
        body["metadata"]["context_used"]
        is True
    )

    assert (
        "diagnóstico"
        in body["disclaimer"]
    )


def test_chat_rejects_empty_message() -> None:
    """
    Rechaza un mensaje vacío.
    """

    payload = {
        **VALID_CHAT_PAYLOAD,
        "request_id": "REQ-CHAT-TEST-002",
        "message": "",
    }

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/chat",
            json=payload,
        )

    assert response.status_code == 422


def test_chat_rejects_invalid_risk() -> None:
    """
    Rechaza niveles de riesgo fuera del contrato.
    """

    payload = {
        **VALID_CHAT_PAYLOAD,
        "request_id": "REQ-CHAT-TEST-003",
        "context": {
            **VALID_CHAT_PAYLOAD["context"],
            "risk_level": "critical",
        },
    }

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/chat",
            json=payload,
        )

    assert response.status_code == 422


def test_chat_rejects_invalid_wellbeing_score() -> None:
    """
    Rechaza puntajes de bienestar fuera de 0 a 100.
    """

    payload = {
        **VALID_CHAT_PAYLOAD,
        "request_id": "REQ-CHAT-TEST-004",
        "context": {
            **VALID_CHAT_PAYLOAD["context"],
            "wellbeing_score": 150,
        },
    }

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/chat",
            json=payload,
        )

    assert response.status_code == 422


def test_chat_rejects_unknown_field() -> None:
    """
    Rechaza campos desconocidos.
    """

    payload = {
        **VALID_CHAT_PAYLOAD,
        "request_id": "REQ-CHAT-TEST-005",
        "unexpected_field": "invalid",
    }

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/chat",
            json=payload,
        )

    assert response.status_code == 422

def test_chat_analyze_success() -> None:
    """
    Verifica el flujo combinado:
    análisis ML + recomendaciones + chatbot.
    """

    fake_answer = (
        "Tu bienestar está en un nivel medio. "
        "Puedes mejorar gradualmente sueño, "
        "actividad física e hidratación."
    )

    payload = {
        "request_id": "REQ-CHAT-ANALYZE-TEST-001",
        "user_id": "USR_TEST_001",
        "analysis_date": "2026-08-09",
        "message": (
            "¿Qué puedo hacer para mejorar "
            "mi bienestar?"
        ),
        "features": {
            "age": 25,
            "height_cm": 165,
            "weight_kg": 65,
            "water_glasses": 5,
            "exercise_minutes": 20,
            "sleep_hours": 6.5,
            "healthy_meals_count": 2,
            "meditation_minutes": 5,
            "pain": 2,
            "temperature_c": 36.7,
            "systolic_mmhg": 120,
            "diastolic_mmhg": 80,
            "glucose_mg_dl": 95,
            "heart_rate_bpm": 75,
            "mood": "regular",
            "stress_level": 6,
            "energy_level": 5,
            "sleep_quality": 5,
        },
    }

    with TestClient(app) as client:
        with patch(
            "app.api.chat.ChatService.generate_response",
            return_value=fake_answer,
        ) as mocked_generate:
            response = client.post(
                "/api/v1/chat/analyze",
                json=payload,
            )

    assert response.status_code == 200

    body = response.json()

    assert (
        body["request_id"]
        == "REQ-CHAT-ANALYZE-TEST-001"
    )

    assert body["answer"] == fake_answer

    assert (
        body["metadata"]["provider"]
        == "mistral"
    )

    assert (
        body["metadata"]["context_used"]
        is True
    )

    mocked_generate.assert_called_once()

    call_arguments = (
        mocked_generate.call_args.kwargs
    )

    assert (
        "user_message"
        in call_arguments
    )

    assert (
        "medical_context"
        in call_arguments
    )

    medical_context = call_arguments[
        "medical_context"
    ]

    assert (
        "Riesgo preventivo:"
        in medical_context
    )

    assert (
        "Puntaje de bienestar:"
        in medical_context
    )

    assert (
        "BMI:"
        in medical_context
    )

    assert (
        "Recomendaciones de VitalMind:"
        in medical_context
    )


def test_chat_analyze_rejects_missing_required_feature() -> None:
    """
    Rechaza una solicitud combinada cuando
    falta un campo indispensable del análisis.
    """

    payload = {
        "request_id": "REQ-CHAT-ANALYZE-TEST-002",
        "user_id": "USR_TEST_001",
        "analysis_date": "2026-08-09",
        "message": "¿Cómo estoy?",
        "features": {
            "age": 25,
            "height_cm": 165,
            # weight_kg faltante intencionalmente
            "mood": "regular",
            "stress_level": 6,
            "energy_level": 5,
            "sleep_quality": 5,
        },
    }

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/chat/analyze",
            json=payload,
        )

    assert response.status_code == 422

    body = response.json()

    assert (
        body["status"]
        == "validation_error"
    )

    assert (
        "weight_kg"
        in body["missing_data_report"][
            "required_missing"
        ]
    )


def test_chat_analyze_uses_imputation() -> None:
    """
    Comprueba que el flujo combinado puede ejecutar
    análisis aun cuando falten campos imputables.
    """

    fake_answer = (
        "VitalMind generó una orientación preventiva."
    )

    payload = {
        "request_id": "REQ-CHAT-ANALYZE-TEST-003",
        "user_id": "USR_TEST_001",
        "analysis_date": "2026-08-09",
        "message": "¿Qué puedo mejorar?",
        "features": {
            "age": 25,
            "height_cm": 165,
            "weight_kg": 65,

            # Campos imputables omitidos:
            # water_glasses
            # exercise_minutes
            # meditation_minutes
            # glucose_mg_dl

            "sleep_hours": 6.5,
            "healthy_meals_count": 2,
            "pain": 2,
            "temperature_c": 36.7,
            "systolic_mmhg": 120,
            "diastolic_mmhg": 80,
            "heart_rate_bpm": 75,
            "mood": "regular",
            "stress_level": 6,
            "energy_level": 5,
            "sleep_quality": 5,
        },
    }

    with TestClient(app) as client:
        with patch(
            "app.api.chat.ChatService.generate_response",
            return_value=fake_answer,
        ):
            response = client.post(
                "/api/v1/chat/analyze",
                json=payload,
            )

    assert response.status_code == 200

    body = response.json()

    assert body["answer"] == fake_answer


def test_chat_analyze_rejects_invalid_bmi_combination() -> None:
    """
    Rechaza una combinación de altura y peso que
    produzca un BMI fuera del dominio permitido.
    """

    payload = {
        "request_id": "REQ-CHAT-ANALYZE-TEST-004",
        "user_id": "USR_TEST_001",
        "analysis_date": "2026-08-09",
        "message": "¿Cómo está mi bienestar?",
        "features": {
            "age": 25,
            "height_cm": 120,
            "weight_kg": 250,
            "mood": "regular",
            "stress_level": 6,
            "energy_level": 5,
            "sleep_quality": 5,
        },
    }

    with TestClient(app) as client:
        response = client.post(
            "/api/v1/chat/analyze",
            json=payload,
        )

    assert response.status_code == 422