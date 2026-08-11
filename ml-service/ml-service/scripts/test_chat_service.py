from app.services.chat_service import (
    ChatAuthenticationError,
    ChatConnectionError,
    ChatQuotaError,
    ChatService,
    ChatServiceError,
)


def main() -> None:
    try:
        print()
        print("=" * 60)
        print("PRUEBA DEL CHATBOT VITALMIND AI")
        print("=" * 60)

        chat = ChatService()

        respuesta = chat.generate_response(
            user_message=(
                "¿Cómo puedo mejorar mi salud?"
            ),
            medical_context="""
Riesgo: medium
Bienestar: 68.4
BMI: 26.1

Recomendaciones:
- Dormir más horas
- Reducir estrés
- Hacer ejercicio
""",
        )

        print()
        print("Respuesta de Mistral:")
        print()
        print(respuesta)

        print()
        print("=" * 60)
        print("PRUEBA FINALIZADA CORRECTAMENTE")
        print("=" * 60)

    except ChatQuotaError as error:
        print()
        print("Error de cuota:")
        print(error)

    except ChatAuthenticationError as error:
        print()
        print("Error de autenticación:")
        print(error)

    except ChatConnectionError as error:
        print()
        print("Error de conexión:")
        print(error)

    except ChatServiceError as error:
        print()
        print("Error del servicio:")
        print(error)

    except ValueError as error:
        print()
        print("Error de validación:")
        print(error)


if __name__ == "__main__":
    main()