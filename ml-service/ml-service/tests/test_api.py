"""
Pruebas automatizadas del microservicio ML de VitalMind AI.
"""

from __future__ import annotations

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """
    Crea el cliente de pruebas y ejecuta el ciclo de vida
    completo de FastAPI para cargar y liberar los modelos.
    """
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def complete_payload() -> dict:
    """Solicitud válida con todos los campos."""
    return {
        "request_id": "REQ-TEST-001",
        "user_id": "USR_TEST_001",
        "analysis_date": "2026-08-03",
        "features": {
            "age": 20,
            "height_cm": 160,
            "weight_kg": 66,
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
            "mood": "bien",
            "stress_level": 4,
            "energy_level": 7,
            "sleep_quality": 6,
        },
    }


def test_health_endpoint(
    client: TestClient,
) -> None:
    """Verifica que el servicio esté saludable."""
    response = client.get("/health")

    assert response.status_code == 200

    body = response.json()

    assert body["status"] == "healthy"
    assert body["models_loaded"] is True
    assert body["service_version"] == "1.0.0"


def test_models_info_endpoint(
    client: TestClient,
) -> None:
    """Verifica la información de los modelos cargados."""
    response = client.get(
        "/api/v1/models/info"
    )

    assert response.status_code == 200

    body = response.json()

    assert (
        body["risk_classifier"]["version"]
        == "1.0.0"
    )

    assert (
        body["risk_classifier"]["algorithm"]
        == "logistic_regression"
    )

    assert (
        body["risk_classifier"]["loaded"]
        is True
    )

    assert (
        body["wellbeing_regressor"]["version"]
        == "1.0.0"
    )

    assert (
        body["wellbeing_regressor"]["algorithm"]
        == "ridge_regression"
    )

    assert (
        body["wellbeing_regressor"]["loaded"]
        is True
    )


def test_analyze_complete_request(
    client: TestClient,
    complete_payload: dict,
) -> None:
    """Prueba una solicitud completa y válida."""
    response = client.post(
        "/api/v1/analyze",
        json=complete_payload,
    )

    assert response.status_code == 200

    body = response.json()

    assert body["request_id"] == "REQ-TEST-001"
    assert body["user_id"] == "USR_TEST_001"
    assert body["analysis_date"] == "2026-08-03"

    risk = body["results"][
        "risk_classification"
    ]

    assert risk["risk_level"] in {
        "low",
        "medium",
        "high",
    }

    assert 0 <= risk["confidence"] <= 1

    probabilities = risk[
        "probabilities"
    ]

    assert set(probabilities) == {
        "low",
        "medium",
        "high",
    }

    assert all(
        0 <= value <= 1
        for value in probabilities.values()
    )

    assert (
        sum(probabilities.values())
        == pytest.approx(
            1.0,
            abs=0.00001,
        )
    )

    wellbeing = body["results"][
        "wellbeing"
    ]

    assert 0 <= wellbeing["score"] <= 100

    assert wellbeing["level"] in {
        "low",
        "medium",
        "high",
    }

    assert body["results"][
        "calculated_bmi"
    ] == pytest.approx(
        25.7812,
        abs=0.0001,
    )

    missing_report = body[
        "missing_data_report"
    ]

    assert (
        missing_report["required_missing"]
        == []
    )

    assert (
        missing_report["imputed_fields"]
        == []
    )

    assert (
        missing_report["warnings"]
        == []
    )

    assert "diagnóstico clínico" in body[
        "disclaimer"
    ]


def test_analyze_with_imputation(
    client: TestClient,
    complete_payload: dict,
) -> None:
    """Verifica la imputación de campos permitidos."""
    payload = complete_payload.copy()

    payload["request_id"] = (
        "REQ-TEST-002"
    )

    payload["features"] = (
        complete_payload["features"].copy()
    )

    payload["features"].pop(
        "exercise_minutes"
    )

    payload["features"].pop(
        "meditation_minutes"
    )

    payload["features"].pop(
        "glucose_mg_dl"
    )

    response = client.post(
        "/api/v1/analyze",
        json=payload,
    )

    assert response.status_code == 200

    body = response.json()

    missing_report = body[
        "missing_data_report"
    ]

    assert (
        missing_report["required_missing"]
        == []
    )

    assert missing_report[
        "imputed_fields"
    ] == [
        "exercise_minutes",
        "meditation_minutes",
        "glucose_mg_dl",
    ]

    assert len(
        missing_report["warnings"]
    ) == 3

    for field_name in (
        "exercise_minutes",
        "meditation_minutes",
        "glucose_mg_dl",
    ):
        assert any(
            field_name in warning
            for warning in missing_report[
                "warnings"
            ]
        )


def test_analyze_missing_required_field(
    client: TestClient,
    complete_payload: dict,
) -> None:
    """Rechaza una solicitud sin weight_kg."""
    payload = complete_payload.copy()

    payload["request_id"] = (
        "REQ-TEST-003"
    )

    payload["features"] = (
        complete_payload["features"].copy()
    )

    payload["features"].pop(
        "weight_kg"
    )

    response = client.post(
        "/api/v1/analyze",
        json=payload,
    )

    assert response.status_code == 422

    body = response.json()

    assert (
        body["status"]
        == "validation_error"
    )

    assert body["request_id"] == (
        "REQ-TEST-003"
    )

    assert body[
        "missing_data_report"
    ]["required_missing"] == [
        "weight_kg"
    ]

    assert body[
        "missing_data_report"
    ]["imputed_fields"] == []


def test_analyze_normalizes_mood(
    client: TestClient,
    complete_payload: dict,
) -> None:
    """Acepta mood con mayúsculas y espacios."""
    payload = complete_payload.copy()

    payload["request_id"] = (
        "REQ-TEST-004"
    )

    payload["features"] = (
        complete_payload["features"].copy()
    )

    payload["features"]["mood"] = (
        "  MUY   BIEN  "
    )

    response = client.post(
        "/api/v1/analyze",
        json=payload,
    )

    assert response.status_code == 200

    body = response.json()

    assert body["results"][
        "risk_classification"
    ]["risk_level"] in {
        "low",
        "medium",
        "high",
    }


def test_analyze_rejects_invalid_mood(
    client: TestClient,
    complete_payload: dict,
) -> None:
    """Rechaza una categoría mood desconocida."""
    payload = complete_payload.copy()

    payload["request_id"] = (
        "REQ-TEST-005"
    )

    payload["features"] = (
        complete_payload["features"].copy()
    )

    payload["features"]["mood"] = (
        "excelente"
    )

    response = client.post(
        "/api/v1/analyze",
        json=payload,
    )

    assert response.status_code == 422

    body = response.json()

    assert (
        body["status"]
        == "validation_error"
    )

    assert body[
        "missing_data_report"
    ]["required_missing"] == []

    assert (
        "inválidos"
        in body["message"]
    )


def test_analyze_rejects_value_out_of_range(
    client: TestClient,
    complete_payload: dict,
) -> None:
    """Rechaza niveles fuera del rango definido."""
    payload = complete_payload.copy()

    payload["request_id"] = (
        "REQ-TEST-006"
    )

    payload["features"] = (
        complete_payload["features"].copy()
    )

    payload["features"][
        "stress_level"
    ] = 15

    response = client.post(
        "/api/v1/analyze",
        json=payload,
    )

    assert response.status_code == 422

    body = response.json()

    assert (
        body["status"]
        == "validation_error"
    )

    assert body[
        "missing_data_report"
    ]["required_missing"] == []

    assert (
        "fuera de los rangos"
        in body["message"]
    )


def test_analyze_rejects_unknown_field(
    client: TestClient,
    complete_payload: dict,
) -> None:
    """Rechaza variables no contempladas en el contrato."""
    payload = complete_payload.copy()

    payload["request_id"] = (
        "REQ-TEST-007"
    )

    payload["features"] = (
        complete_payload["features"].copy()
    )

    payload["features"][
        "unexpected_field"
    ] = 123

    response = client.post(
        "/api/v1/analyze",
        json=payload,
    )

    assert response.status_code == 422

    body = response.json()

    assert (
        body["status"]
        == "validation_error"
    )