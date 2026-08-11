# Guía de integración del chatbot de VitalMind AI

## 1. Propósito

El chatbot de VitalMind AI es un asistente conversacional orientado a salud preventiva y bienestar.

Su función es utilizar los resultados obtenidos por los modelos de Machine Learning y las recomendaciones preventivas generadas por VitalMind para brindar explicaciones claras y contextualizadas al usuario.

El chatbot utiliza actualmente:

```text
Proveedor: Mistral AI
Modelo: mistral-small-latest

```

## 2. Arquitectura

Flujo general:
Frontend
   ↓
Backend Node.js
   ↓
Microservicio ML FastAPI
   ↓
Modelos de Machine Learning
   ↓
Motor de recomendaciones
   ↓
Mistral AI
   ↓
Respuesta conversacional

## 3. responsabilidades

### Backend principal

Backend debe:

- Autenticar al usuario.
- Consultar la base de datos.
- Obtener los datos de salud necesarios.
- Construir el JSON de entrada
- Consumir el microservicio ML
- Manejar errores de red
- Entregar respuesta al Frontend.
- Guuardar el historial conversacional si el proyecto lo requiere

### microservicio ML

El microservicio debe:

- Validar los datos.
- Ejecutar clasificacion de riesgo.
- Estimar el puntaje de bienestar
- Calcular BMI
- Aplicar imputaciones permitidas
- Generar recomendaciones preventivas
- Construir el contexto para el chatbot
- Consumir Mistral AI
- Devolver una respuesta normalizada

## 4. Configuración

El chatbot utiliza variables de entorno.

Archivo local:

```text
ml-service/.env
```

Ejemplo:

```env
MISTRAL_API_KEY=API_KEY_REAL
MISTRAL_MODEL=mistral-small-latest
MISTRAL_TEMPERATURE=0.4
MISTRAL_MAX_TOKENS=500
```

La API Key nunca debe almacenarse directamente en el código.

El archivo `.env` no debe subirse al repositorio.

El archivo:

```text
ml-service/.env.example
```

sí debe conservarse como referencia:

```env
MISTRAL_API_KEY=
MISTRAL_MODEL=mistral-small-latest
MISTRAL_TEMPERATURE=0.4
MISTRAL_MAX_TOKENS=500
```

---

## 5. Endpoint de chat con contexto proporcionado

```http
POST /api/v1/chat
```

Este endpoint permite que Backend proporcione directamente el contexto analítico ya calculado.

### Entrada

```json
{
  "request_id": "REQ-CHAT-001",
  "user_id": "USR_001",
  "analysis_date": "2026-08-09",
  "message": "¿Qué puedo hacer para mejorar mi bienestar?",
  "context": {
    "risk_level": "medium",
    "wellbeing_score": 68.4,
    "wellbeing_level": "medium",
    "bmi": 26.1,
    "recommendations": [
      "Dormir entre 7 y 9 horas",
      "Reducir el estrés",
      "Realizar actividad física de forma regular"
    ]
  }
}
```

### Respuesta

```json
{
  "request_id": "REQ-CHAT-001",
  "user_id": "USR_001",
  "analysis_date": "2026-08-09",
  "answer": "Respuesta generada por VitalMind AI...",
  "metadata": {
    "provider": "mistral",
    "model": "mistral-small-latest",
    "context_used": true
  },
  "disclaimer": "La respuesta es informativa y preventiva. No representa un diagnóstico médico ni sustituye la atención de un profesional de la salud."
}
```

---

## 6. Endpoint combinado recomendado

```http
POST /api/v1/chat/analyze
```

Este endpoint ejecuta en una sola solicitud:

1. Validación de características.
2. Cálculo de BMI.
3. Imputación de campos permitidos.
4. Clasificación de riesgo.
5. Predicción de bienestar.
6. Generación de recomendaciones.
7. Construcción del contexto.
8. Generación de respuesta con Mistral.

Este es el endpoint recomendado cuando Backend dispone de los datos de salud pero todavía no ha ejecutado el análisis ML.

---

## 7. Entrada de `/api/v1/chat/analyze`

```json
{
  "request_id": "REQ-CHAT-ANALYZE-001",
  "user_id": "USR_001",
  "analysis_date": "2026-08-09",
  "message": "¿Qué puedo hacer para mejorar mi bienestar?",
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
    "sleep_quality": 5
  }
}
```

---

## 8. Flujo interno de `/chat/analyze`

```text
Features
   ↓
Validación Pydantic
   ↓
Preprocesamiento
   ↓
Cálculo de BMI
   ↓
Clasificador de riesgo
   ↓
Regresor de bienestar
   ↓
Motor de recomendaciones
   ↓
Contexto textual
   ↓
Mistral AI
   ↓
Respuesta del chatbot
```

---

## 9. Motor de recomendaciones

Las recomendaciones no son creadas libremente por el modelo generativo.

VitalMind utiliza un motor basado en reglas explícitas.

Metas internas actuales del proyecto:

| Variable              | Meta                 |
| --------------------- | -------------------- |
| `water_glasses`       | 8 vasos              |
| `exercise_minutes`    | 30 minutos           |
| `sleep_hours`         | 8 horas              |
| `healthy_meals_count` | 3 comidas saludables |
| `meditation_minutes`  | 10 minutos           |

También se consideran:

```text
stress_level
energy_level
sleep_quality
risk_level
wellbeing_score
```

El motor devuelve máximo:

```text
5 recomendaciones
```

Estas recomendaciones son preventivas y generales.

---

## 10. Separación entre ML y LLM

El sistema separa dos responsabilidades.

### Machine Learning

Determina:

* nivel preventivo de riesgo;
* puntaje de bienestar;
* BMI calculado;
* recomendaciones basadas en reglas.

### Modelo generativo

Mistral se utiliza para:

* explicar resultados;
* responder preguntas;
* redactar recomendaciones;
* mantener una conversación comprensible.

Mistral no debe modificar los resultados del modelo ML.

---

## 11. Reglas de seguridad del chatbot

El prompt del sistema obliga al asistente a:

* responder en español;
* no diagnosticar;
* no sugerir diagnósticos;
* no recetar medicamentos;
* no modificar tratamientos;
* no inventar datos clínicos;
* no interpretar automáticamente BMI mediante categorías clínicas;
* no presentar riesgo preventivo como diagnóstico;
* recomendar valoración profesional cuando corresponda;
* indicar cuando no existe información suficiente.

---

## 12. Ejemplo de respuesta combinada

```json
{
  "request_id": "REQ-CHAT-ANALYZE-001",
  "user_id": "USR_001",
  "analysis_date": "2026-08-09",
  "answer": "Con base en tus resultados de VitalMind, existen algunas áreas de oportunidad relacionadas con descanso, actividad física, hidratación y alimentación. Puedes realizar cambios graduales y continuar registrando tu evolución.",
  "metadata": {
    "provider": "mistral",
    "model": "mistral-small-latest",
    "context_used": true
  },
  "disclaimer": "La respuesta es informativa y preventiva. No representa un diagnóstico médico ni sustituye la atención de un profesional de la salud."
}
```

---

## 13. Manejo de errores

### Error de validación

Código:

```text
422
```

Ejemplos:

* campo indispensable faltante;
* rango inválido;
* `mood` desconocido;
* mensaje vacío;
* variable desconocida.

### Proveedor no disponible

Código:

```text
503
```

Puede ocurrir por:

* API Key inválida;
* límite de cuota;
* problema de conectividad.

### Error interno

Código:

```text
500
```

Se devuelve cuando no es posible completar la generación de forma segura.

---

## 14. Pruebas

El chatbot cuenta con pruebas automatizadas que utilizan mocks para evitar llamadas reales a Mistral.

Casos cubiertos:

* respuesta exitosa;
* mensaje vacío;
* riesgo inválido;
* bienestar fuera de rango;
* campos desconocidos;
* flujo `/chat/analyze`;
* campos ML indispensables faltantes;
* imputación;
* BMI fuera del dominio permitido.

Las pruebas pueden ejecutarse mediante:

```bash
pytest -v
```

Las pruebas automatizadas no consumen cuota de Mistral cuando el proveedor está mockeado.

---

## 15. Limitaciones

* Los modelos ML fueron entrenados con datos sintéticos.
* El chatbot no está validado clínicamente.
* Las respuestas son preventivas e informativas.
* La calidad del contexto depende de los datos enviados por Backend.
* El modelo generativo puede cambiar en versiones futuras.
* El contrato deberá versionarse si cambian los campos o modelos utilizados.

---

Ahora actualiza también:

```text
ml-service/docs/backend-integration-guide.md
```

y agrega al final una sección:

## Chatbot inteligente

El microservicio dispone de:

```http
POST /api/v1/chat
```

para conversaciones con contexto previamente calculado, y:

```http
POST /api/v1/chat/analyze
```

para ejecutar análisis ML y conversación en una sola solicitud.

Para integración desde Backend se recomienda utilizar `/api/v1/chat/analyze` cuando Backend únicamente tenga disponibles los datos de salud del usuario.

El proveedor generativo actual es:

```text
Mistral AI
mistral-small-latest
```

La API Key se configura mediante:

```text
MISTRAL_API_KEY
```

y nunca debe enviarse desde Frontend.
