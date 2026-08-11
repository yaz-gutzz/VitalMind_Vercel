"""
Manejadores globales de errores del microservicio.
"""

from __future__ import annotations

from typing import Any

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette import status


REQUIRED_FEATURE_FIELDS = {
    "age",
    "height_cm",
    "weight_kg",
    "mood",
    "stress_level",
    "energy_level",
    "sleep_quality",
}


def extract_request_id(
    error: RequestValidationError,
) -> str | None:
    """Intenta recuperar request_id desde el cuerpo recibido."""
    body = error.body

    if not isinstance(body, dict):
        return None

    request_id = body.get("request_id")

    if request_id is None:
        return None

    return str(request_id)


def extract_required_missing(
    error: RequestValidationError,
) -> list[str]:
    """Obtiene campos indispensables ausentes."""
    missing_fields: list[str] = []

    for validation_error in error.errors():
        if validation_error.get("type") != "missing":
            continue

        location = validation_error.get(
            "loc",
            (),
        )

        if not location:
            continue

        field_name = str(
            location[-1]
        )

        if field_name in REQUIRED_FEATURE_FIELDS:
            missing_fields.append(
                field_name
            )

    return sorted(
        set(missing_fields)
    )


def build_validation_message(
    missing_fields: list[str],
) -> str:
    """Construye un mensaje según el tipo de error."""
    if missing_fields:
        return (
            "Faltan campos indispensables para "
            "ejecutar la inferencia."
        )

    return (
        "La solicitud contiene datos faltantes, "
        "inválidos o fuera de los rangos permitidos."
    )


async def request_validation_exception_handler(
    request: Request,
    error: RequestValidationError,
) -> JSONResponse:
    """
    Convierte los errores automáticos de Pydantic
    al contrato de respuesta de VitalMind AI.
    """
    del request

    required_missing = (
        extract_required_missing(
            error
        )
    )

    response_content: dict[str, Any] = {
        "request_id": extract_request_id(
            error
        ),
        "status": "validation_error",
        "message": build_validation_message(
            required_missing
        ),
        "missing_data_report": {
            "required_missing": (
                required_missing
            ),
            "imputed_fields": [],
            "warnings": [],
        },
    }

    return JSONResponse(
        status_code=(
            status.HTTP_422_UNPROCESSABLE_CONTENT   
        ),
        content=response_content,
    )