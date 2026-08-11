from __future__ import annotations

from pathlib import Path

from mistralai.client import Mistral

from app.config import (
    MISTRAL_API_KEY,
    MISTRAL_MAX_TOKENS,
    MISTRAL_MODEL,
    MISTRAL_TEMPERATURE,
)


class ChatServiceError(Exception):
    """Error general controlado del chatbot."""


class ChatAuthenticationError(ChatServiceError):
    """Error relacionado con la API Key."""


class ChatQuotaError(ChatServiceError):
    """Error relacionado con cuota o límites."""


class ChatConnectionError(ChatServiceError):
    """Error relacionado con conectividad."""


class ChatService:
    """
    Servicio encargado de comunicarse con Mistral AI.
    """

    def __init__(self) -> None:
        if not MISTRAL_API_KEY:
            self.client = None
            self.system_prompt = ""
            return

        self.client = Mistral(
            api_key=MISTRAL_API_KEY
        )

        self.system_prompt = (
            self._load_system_prompt()
        )

    def _load_system_prompt(self) -> str:
        """
        Carga el prompt principal del asistente.
        """

        prompt_path = (
            Path(__file__).resolve()
            .parent.parent
            / "prompts"
            / "system_prompt.txt"
        )

        if not prompt_path.exists():
            raise FileNotFoundError(
                "No se encontró el prompt del sistema:\n"
                f"{prompt_path}"
            )

        prompt = prompt_path.read_text(
            encoding="utf-8"
        ).strip()

        if not prompt:
            raise ValueError(
                "El prompt del sistema está vacío."
            )

        return prompt

    def _build_user_prompt(
        self,
        user_message: str,
        medical_context: str,
    ) -> str:
        """
        Construye el mensaje del usuario con contexto ML.
        """

        return f"""
CONTEXTO PROPORCIONADO POR VITALMIND AI

{medical_context}

MENSAJE DEL USUARIO

{user_message}

INSTRUCCIONES ADICIONALES

Utiliza exclusivamente el contexto proporcionado por VitalMind
para hablar de los resultados personales del usuario.

No inventes información clínica.
No diagnostiques enfermedades.
No recetes medicamentos.
No agregues categorías clínicas que no estén explícitamente
incluidas en el contexto.

IMPORTANTE:
Si el contexto proporciona un BMI únicamente como número,
puedes mencionar ese valor, pero NO debes clasificarlo como
normal, saludable, bajo, sobrepeso, obesidad u otra categoría.

Tampoco debes afirmar que la ausencia de riesgo alto significa
que el usuario está sano o que no necesita atención médica.
""".strip()

    def generate_response(
        self,
        user_message: str,
        medical_context: str,
    ) -> str:
        """
        Genera una respuesta mediante Mistral AI.
        """

        user_message = user_message.strip()
        medical_context = medical_context.strip()

        if not user_message:
            raise ValueError(
                "El mensaje del usuario no puede estar vacío."
            )

        if self.client is None:
            return (
                "Puedo orientarte de forma general: "
                f"{user_message.strip()}\n\n"
                "Si quieres, comparte más contexto para darte "
                "una recomendación preventiva más concreta."
            )

        user_prompt = self._build_user_prompt(
            user_message=user_message,
            medical_context=medical_context,
        )

        try:
            response = self.client.chat.complete(
                model=MISTRAL_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": self.system_prompt,
                    },
                    {
                        "role": "user",
                        "content": user_prompt,
                    },
                ],
                temperature=MISTRAL_TEMPERATURE,
                max_tokens=MISTRAL_MAX_TOKENS,
            )

        except Exception as error:
            error_text = str(error).lower()

            if (
                "401" in error_text
                or "unauthorized" in error_text
                or "api key" in error_text
            ):
                raise ChatAuthenticationError(
                    "La API Key de Mistral no es válida."
                ) from error

            if (
                "429" in error_text
                or "quota" in error_text
                or "rate limit" in error_text
            ):
                raise ChatQuotaError(
                    "Mistral no pudo procesar la solicitud "
                    "por límite de cuota."
                ) from error

            if (
                "connection" in error_text
                or "network" in error_text
                or "timeout" in error_text
            ):
                raise ChatConnectionError(
                    "No fue posible conectar con Mistral."
                ) from error

            raise ChatServiceError(
                "Mistral devolvió un error "
                "al generar la respuesta."
            ) from error

        if (
            not response.choices
            or not response.choices[0].message.content
        ):
            raise ChatServiceError(
                "Mistral no devolvió contenido de texto."
            )

        content = response.choices[
            0
        ].message.content

        if not isinstance(content, str):
            raise ChatServiceError(
                "La respuesta de Mistral no tiene "
                "el formato de texto esperado."
            )

        response_text = content.strip()

        if not response_text:
            raise ChatServiceError(
                "Mistral devolvió una respuesta vacía."
            )

        return response_text