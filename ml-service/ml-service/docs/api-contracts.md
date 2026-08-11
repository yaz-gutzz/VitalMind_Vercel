# Contratos de API — VitalMind AI ML Service

## 1. Propósito

Este documento define los contratos REST expuestos por el microservicio de Machine Learning de VitalMind AI.

El servicio permite:

* verificar el estado del microservicio;
* consultar los modelos cargados;
* ejecutar análisis de riesgo y bienestar;
* generar recomendaciones preventivas;
* utilizar el chatbot con contexto analítico;
* ejecutar análisis ML y chatbot en una sola solicitud.

---

# 2. Base URL

Durante desarrollo local:

```text
http://127.0.0.1:8000
```

Prefijo principal:

```text
/api/v1
```

---

# 3. Endpoints disponibles

| Método | Endpoint               | Propósito                               |
| ------ | ---------------------- | --------------------------------------- |
| GET    | `/health`              | Estado general del servicio             |
| GET    | `/api/v1/models/info`  | Información de modelos                  |
| POST   | `/api/v1/analyze`      | Inferencia de riesgo y bienestar        |
| POST   | `/api/v1/chat`         | Chat con contexto previamente calculado |
| POST   | `/api/v1/chat/analyze` | Análisis ML + recomendaciones + chatbot |

---

# 4. GET `/health`

## Propósito

Verifica que el microservicio esté disponible y que los modelos requeridos se encuentren cargados.

## Solicitud

No requiere cuerpo.

```http
GET /health
```

## Respuesta exitosa

Código:

```text
200 OK
```

Ejemplo:

```json
{
  "status": "healthy",
  "models_loaded": true,
  "service_version": "1.0.0"
}
```

---

# 5. GET `/api/v1/models/info`

## Propósito

Devuelve información básica de los modelos supervisados cargados.

## Solicitud

```http
GET /api/v1/models/info
```

## Respuesta

```json
{
  "risk_classifier": {
    "version": "1.0.0",
    "algorithm": "logistic_regression",
    "loaded": true
  },
  "wellbeing_regressor": {
    "version": "1.0.0",
    "algorithm": "ridge_regression",
    "loaded": true
  }
}
```

---

# 6. POST `/api/v1/analyze`

## Propósito

Ejecuta el análisis principal de Machine Learning.

Incluye:

* validación;
* normalización;
* imputación autorizada;
* cálculo de BMI;
* clasificación de riesgo;
* regresión de bienestar;
* recomendaciones preventivas.

---

## 6.1 Solicitud

```json
{
  "request_id": "REQ-ANALYSIS-001",
  "user_id": "USR_001",
  "analysis_date": "2026-08-09",
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

## 6.2 Metadatos

### `request_id`

Tipo:

```text
string
```

Uso:

* trazabilidad;
* correlación entre servicios;
* referencia de errores.

Backend debe generar este identificador.

### `user_id`

Tipo:

```text
string
```

Uso:

* identificación interna del usuario;
* trazabilidad.

No se utiliza como característica de los modelos.

### `analysis_date`

Formato:

```text
YYYY-MM-DD
```

Representa la fecha a la que corresponden los datos analizados.

---

# 7. Variables de entrada

| Variable              | Tipo       | Rango / Unidad     |
| --------------------- | ---------- | ------------------ |
| `age`                 | entero     | años               |
| `height_cm`           | decimal    | 120–220 cm         |
| `weight_kg`           | decimal    | 30–250 kg          |
| `water_glasses`       | decimal    | vasos              |
| `exercise_minutes`    | decimal    | minutos            |
| `sleep_hours`         | decimal    | horas              |
| `healthy_meals_count` | decimal    | comidas            |
| `meditation_minutes`  | decimal    | minutos            |
| `pain`                | decimal    | 0–10               |
| `temperature_c`       | decimal    | °C                 |
| `systolic_mmhg`       | decimal    | mmHg               |
| `diastolic_mmhg`      | decimal    | mmHg               |
| `glucose_mg_dl`       | decimal    | mg/dL              |
| `heart_rate_bpm`      | decimal    | bpm                |
| `mood`                | categórica | catálogo VitalMind |
| `stress_level`        | decimal    | 1–10               |
| `energy_level`        | decimal    | 1–10               |
| `sleep_quality`       | decimal    | 1–10               |

---

# 8. Campos indispensables

Los siguientes campos no pueden faltar:

```text
age
height_cm
weight_kg
mood
stress_level
energy_level
sleep_quality
```

Si falta alguno:

```text
422 Unprocessable Content
```

---

# 9. Campos imputables

Pueden recibirse como `null` o no enviarse:

```text
water_glasses
exercise_minutes
sleep_hours
healthy_meals_count
meditation_minutes
pain
temperature_c
systolic_mmhg
diastolic_mmhg
glucose_mg_dl
heart_rate_bpm
```

La imputación utiliza estadísticas aprendidas exclusivamente desde entrenamiento.

Nunca se sustituyen faltantes automáticamente por cero.

---

# 10. Normalización de `mood`

Valores permitidos:

```text
muy mal
mal
regular
bien
muy bien
```

Ejemplos aceptados:

```text
"bien"
" Bien "
"MUY BIEN"
"  MUY   BIEN "
```

El servicio normaliza espacios y mayúsculas antes de validar.

---

# 11. Cálculo de BMI

Backend no debe enviar `bmi`.

El microservicio utiliza:

```text
weight_kg
height_cm
```

El BMI se calcula internamente.

Además de validar peso y altura, se rechazan combinaciones que produzcan un BMI fuera del dominio permitido por el servicio.

---

# 12. Respuesta de `/analyze`

Ejemplo:

```json
{
  "request_id": "REQ-ANALYSIS-001",
  "user_id": "USR_001",
  "analysis_date": "2026-08-09",
  "results": {
    "risk_classification": {
      "risk_level": "medium",
      "confidence": 0.72,
      "probabilities": {
        "low": 0.18,
        "medium": 0.72,
        "high": 0.10
      }
    },
    "wellbeing": {
      "score": 56.69,
      "level": "medium"
    },
    "calculated_bmi": 23.88,
    "recommendations": [
      "Procura mejorar gradualmente la regularidad y duración de tu descanso.",
      "Intenta incorporar gradualmente más actividad física a tu rutina diaria, de acuerdo con tus posibilidades.",
      "Procura mantener una hidratación regular durante el día y acercarte gradualmente a tu meta registrada."
    ]
  },
  "model_versions": {
    "risk_classifier": "1.0.0",
    "wellbeing_regressor": "1.0.0"
  },
  "missing_data_report": {
    "required_missing": [],
    "imputed_fields": [],
    "warnings": []
  },
  "disclaimer": "Resultados preventivos generados con modelos entrenados sobre datos sintéticos. No representan un diagnóstico clínico."
}
```

---

# 13. Clasificación de riesgo

Clases posibles:

```text
low
medium
high
```

Campos devueltos:

```text
risk_level
confidence
probabilities
```

La confianza corresponde a la probabilidad máxima producida por el clasificador.

No representa certeza clínica.

---

# 14. Bienestar

Campos:

```text
score
level
```

Rango del score:

```text
0 a 100
```

Niveles:

```text
low
medium
high
```

---

# 15. Recomendaciones

El endpoint `/analyze` incluye:

```text
recommendations
```

Las recomendaciones son generadas mediante reglas internas de VitalMind, no directamente por Mistral.

Máximo:

```text
5
```

---

# 16. Reporte de faltantes

Ejemplo:

```json
{
  "missing_data_report": {
    "required_missing": [],
    "imputed_fields": [
      "exercise_minutes"
    ],
    "warnings": [
      "exercise_minutes fue imputado con la mediana aprendida desde entrenamiento."
    ]
  }
}
```

---

# 17. Error 422 — campo indispensable

Ejemplo:

```json
{
  "request_id": "REQ-001",
  "status": "validation_error",
  "message": "Faltan campos indispensables para ejecutar la inferencia.",
  "missing_data_report": {
    "required_missing": [
      "weight_kg"
    ],
    "imputed_fields": [],
    "warnings": []
  }
}
```

---

# 18. POST `/api/v1/chat`

## Propósito

Genera una respuesta conversacional cuando Backend ya cuenta con los resultados analíticos.

El endpoint no vuelve a ejecutar los modelos ML.

---

## 18.1 Solicitud

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
      "Reducir el estrés"
    ]
  }
}
```

---

# 19. Respuesta de `/chat`

```json
{
  "request_id": "REQ-CHAT-001",
  "user_id": "USR_001",
  "analysis_date": "2026-08-09",
  "answer": "Respuesta generada por VitalMind AI.",
  "metadata": {
    "provider": "mistral",
    "model": "mistral-small-latest",
    "context_used": true
  },
  "disclaimer": "La respuesta es informativa y preventiva. No representa un diagnóstico médico ni sustituye la atención de un profesional de la salud."
}
```

---

# 20. POST `/api/v1/chat/analyze`

## Propósito

Ejecuta el flujo completo en una única solicitud.

Es útil cuando Backend dispone de los datos del usuario pero todavía no ha ejecutado `/analyze`.

Flujo:

```text
features
    ↓
validación
    ↓
preprocesamiento
    ↓
modelos ML
    ↓
recomendaciones
    ↓
contexto
    ↓
Mistral AI
    ↓
respuesta
```

---

# 21. Solicitud de `/chat/analyze`

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

# 22. Respuesta de `/chat/analyze`

```json
{
  "request_id": "REQ-CHAT-ANALYZE-001",
  "user_id": "USR_001",
  "analysis_date": "2026-08-09",
  "answer": "Con base en los resultados preventivos de VitalMind, existen algunas áreas que pueden mejorarse gradualmente...",
  "metadata": {
    "provider": "mistral",
    "model": "mistral-small-latest",
    "context_used": true
  },
  "disclaimer": "La respuesta es informativa y preventiva. No representa un diagnóstico médico ni sustituye la atención de un profesional de la salud."
}
```

---

# 23. Errores del chatbot

## Error de proveedor

Código:

```text
503 Service Unavailable
```

Ejemplo:

```json
{
  "detail": {
    "request_id": "REQ-CHAT-001",
    "status": "chat_error",
    "message": "El servicio de chatbot no está disponible temporalmente por límite de cuota."
  }
}
```

También puede producirse cuando:

* la API Key no es válida;
* Mistral no está disponible;
* existe un problema de conectividad.

---

# 24. Error interno

Código:

```text
500 Internal Server Error
```

El microservicio no debe exponer:

* trazas internas;
* API Keys;
* rutas locales sensibles;
* detalles del proveedor innecesarios.

---

# 25. Proveedor del chatbot

Proveedor actual:

```text
Mistral AI
```

Modelo:

```text
mistral-small-latest
```

Variable:

```text
MISTRAL_API_KEY
```

La API Key se almacena únicamente en el entorno del microservicio.

Frontend nunca debe recibirla.

---

# 26. Responsabilidades de Backend

Backend debe:

* autenticar al usuario;
* consultar MySQL;
* seleccionar registros por fecha;
* construir el JSON;
* generar `request_id`;
* enviar la solicitud;
* manejar códigos HTTP;
* guardar resultados cuando corresponda;
* enviar la respuesta al Frontend.

---

# 27. Responsabilidades del microservicio

El microservicio debe:

* validar;
* normalizar;
* imputar;
* calcular BMI;
* ejecutar modelos;
* generar recomendaciones;
* construir contexto;
* consumir Mistral;
* devolver respuestas normalizadas.

---

# 28. Seguridad

Nunca deben enviarse al modelo como características predictivas:

```text
nombre
correo
teléfono
dirección
contraseña
token
CURP
```

El `user_id` se utiliza únicamente como referencia.

---

# 29. Versionado

Versión inicial:

```text
API: 1.0.0
risk_classifier: 1.0.0
wellbeing_regressor: 1.0.0
```

El contrato deberá versionarse si cambian:

* nombres de variables;
* unidades;
* rangos;
* modelos;
* política de imputación;
* estructura JSON;
* rutas.

---

# 30. Pruebas

La API cuenta con pruebas automatizadas sobre:

* `/health`;
* `/models/info`;
* `/analyze`;
* `/chat`;
* `/chat/analyze`;
* imputación;
* errores 422;
* rangos;
* normalización;
* contexto del chatbot.

Las llamadas a Mistral se simulan mediante mocks durante las pruebas automatizadas.

Comando:

```bash
pytest -v
```

---

# 31. Swagger

FastAPI genera documentación interactiva en:

```text
http://127.0.0.1:8000/docs
```

OpenAPI:

```text
http://127.0.0.1:8000/openapi.json
```

---

# 32. Documentación relacionada

```text
ml-service/docs/ml-integration-contract.md
ml-service/docs/backend-integration-guide.md
ml-service/docs/chatbot-integration-guide.md
ml-service/docs/data-sources.md
ml-service/docs/etl-process.md
ml-service/docs/model-evaluation.md
```

---

# 33. Limitaciones

* Los modelos fueron entrenados con datos sintéticos.
* El chatbot no tiene validación clínica.
* Los resultados son preventivos.
* La integración definitiva depende del Backend productivo.
* El modelo generativo puede cambiar en versiones posteriores.
