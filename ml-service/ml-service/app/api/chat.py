from __future__ import annotations

from fastapi import (
    APIRouter,
    HTTPException,
    status,
)

from app.config import (
    MISTRAL_MODEL,
)

from app.schemas.chat import (
    ChatMetadata,
    ChatRequest,
    ChatResponse,
    ChatAnalyzeRequest,
)

from app.services.chat_service import (
    ChatAuthenticationError,
    ChatConnectionError,
    ChatQuotaError,
    ChatService,
    ChatServiceError,
)

from app.schemas.inference import (
    AnalysisRequest,
)

from app.services.inference_service import (
    analyze_request,
)


router = APIRouter(
    prefix="/api/v1",
    tags=["chat"],
)


CHAT_DISCLAIMER = (
    "La respuesta es informativa y preventiva. "
    "No representa un diagnóstico médico ni sustituye "
    "la atención de un profesional de la salud."
)


def build_medical_context(
    request: ChatRequest,
) -> str:
    """
    Convierte el contexto estructurado
    en texto para el modelo generativo.
    """

    if request.context.recommendations:
        recommendations = "\n".join(
            f"- {item}"
            for item
            in request.context.recommendations
        )
    else:
        recommendations = (
            "- Sin recomendaciones adicionales."
        )

    return f"""
Riesgo preventivo:
{request.context.risk_level}

Puntaje de bienestar:
{request.context.wellbeing_score}

Nivel de bienestar:
{request.context.wellbeing_level}

BMI:
{request.context.bmi}

Recomendaciones del sistema:
{recommendations}
""".strip()


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
)
def chat(
    request: ChatRequest,
) -> ChatResponse:
    """
    Genera una respuesta conversacional
    utilizando Mistral y el contexto de VitalMind AI.
    """

    try:
        service = ChatService()

        medical_context = (
            build_medical_context(
                request
            )
        )

        answer = service.generate_response(
            user_message=request.message,
            medical_context=medical_context,
        )

        return ChatResponse(
            request_id=request.request_id,
            user_id=request.user_id,
            analysis_date=request.analysis_date,
            answer=answer,
            metadata=ChatMetadata(
                provider="mistral",
                model=MISTRAL_MODEL,
                context_used=True,
            ),
            disclaimer=CHAT_DISCLAIMER,
        )

    except ChatQuotaError as error:
        raise HTTPException(
            status_code=503,
            detail={
                "request_id": request.request_id,
                "status": "chat_error",
                "message": (
                    "El servicio de chatbot no está "
                    "disponible temporalmente por "
                    "límite de cuota."
                ),
            },
        ) from error

    except ChatAuthenticationError as error:
        raise HTTPException(
            status_code=503,
            detail={
                "request_id": request.request_id,
                "status": "chat_error",
                "message": (
                    "El servicio de chatbot no está "
                    "configurado correctamente."
                ),
            },
        ) from error

    except ChatConnectionError as error:
        raise HTTPException(
            status_code=503,
            detail={
                "request_id": request.request_id,
                "status": "chat_error",
                "message": (
                    "No fue posible conectar con "
                    "el proveedor del chatbot."
                ),
            },
        ) from error

    except ChatServiceError as error:
        raise HTTPException(
            status_code=500,
            detail={
                "request_id": request.request_id,
                "status": "chat_error",
                "message": (
                    "No fue posible generar "
                    "la respuesta del chatbot."
                ),
            },
        ) from error


@router.post(
    "/chat/analyze",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
)
def chat_with_analysis(
    request: ChatAnalyzeRequest,
) -> ChatResponse:
    """
    Ejecuta primero el análisis ML y utiliza
    automáticamente sus resultados como contexto
    para generar la respuesta del chatbot.
    """

    try:
        analysis_request = AnalysisRequest(
            request_id=request.request_id,
            user_id=request.user_id,
            analysis_date=request.analysis_date,
            features=request.features,
        )

        analysis_response = analyze_request(
            analysis_request
        )

        analysis_results = (
            analysis_response.results
        )

        recommendations = "\n".join(
            f"- {item}"
            for item
            in analysis_results.recommendations
        )
        risk_labels = {
            "low": "bajo",
            "medium": "medio",
            "high": "alto",
        }

        wellbeing_labels = {
            "low": "bajo",
            "medium": "medio",
            "high": "alto",
        }

        risk_label = risk_labels[
            analysis_results
            .risk_classification
            .risk_level
        ]

        wellbeing_label = wellbeing_labels[
            analysis_results
            .wellbeing
            .level
        ]

        medical_context = f"""
Riesgo preventivo:
{risk_label}

Puntaje de bienestar:
{analysis_results.wellbeing.score}

Nivel de bienestar:
{wellbeing_label}

BMI:
{analysis_results.calculated_bmi}

Recomendaciones de VitalMind:
{recommendations}
""".strip()

        service = ChatService()

        answer = service.generate_response(
            user_message=request.message,
            medical_context=medical_context,
        )

        return ChatResponse(
            request_id=request.request_id,
            user_id=request.user_id,
            analysis_date=request.analysis_date,
            answer=answer,
            metadata=ChatMetadata(
                provider="mistral",
                model=MISTRAL_MODEL,
                context_used=True,
            ),
            disclaimer=CHAT_DISCLAIMER,
        )

    except ChatQuotaError as error:
        raise HTTPException(
            status_code=503,
            detail={
                "request_id": request.request_id,
                "status": "chat_error",
                "message": (
                    "El servicio de chatbot no está "
                    "disponible temporalmente por "
                    "límite de cuota."
                ),
            },
        ) from error

    except ChatAuthenticationError as error:
        raise HTTPException(
            status_code=503,
            detail={
                "request_id": request.request_id,
                "status": "chat_error",
                "message": (
                    "El servicio de chatbot no está "
                    "configurado correctamente."
                ),
            },
        ) from error

    except ChatConnectionError as error:
        raise HTTPException(
            status_code=503,
            detail={
                "request_id": request.request_id,
                "status": "chat_error",
                "message": (
                    "No fue posible conectar con "
                    "el proveedor del chatbot."
                ),
            },
        ) from error

    except ChatServiceError as error:
        raise HTTPException(
            status_code=500,
            detail={
                "request_id": request.request_id,
                "status": "chat_error",
                "message": (
                    "No fue posible generar "
                    "la respuesta del chatbot."
                ),
            },
        ) from error