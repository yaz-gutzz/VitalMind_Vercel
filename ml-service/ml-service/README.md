#  VitalMind AI — Machine Learning Service

Microservicio de Machine Learning de **VitalMind AI**, encargado del análisis preventivo de datos de salud y bienestar.

El módulo integra modelos supervisados y no supervisados, un motor de recomendaciones preventivas y un chatbot inteligente que utiliza los resultados generados por Machine Learning como contexto.

> **Importante:** los modelos actuales fueron desarrollados y evaluados principalmente con datos sintéticos. Los resultados son informativos y preventivos; no representan diagnósticos médicos.

---

##  Funcionalidades principales

El microservicio implementa:

- Clasificación preventiva de riesgo.
- Predicción del puntaje de bienestar.
- Cálculo automático de BMI.
- Imputación controlada de datos faltantes.
- Agrupación exploratoria de perfiles.
- Detección de anomalías.
- Generación de recomendaciones preventivas.
- Chatbot inteligente mediante Mistral AI.
- Integración automática ML → recomendaciones → chatbot.
- API REST mediante FastAPI.
- Validación mediante Pydantic.
- Pruebas automatizadas mediante pytest.

---

#  Arquitectura

```text
┌───────────────────────┐
│       Frontend        │
│        Vue 3          │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│        Backend        │
│       Node.js         │
└───────────┬───────────┘
            │
            │ JSON
            ▼
┌───────────────────────────────┐
│      ML Service - FastAPI     │
│                               │
│  Validación                   │
│       ↓                       │
│  Preprocesamiento             │
│       ↓                       │
│  Modelos ML                   │
│       ↓                       │
│  Recomendaciones              │
│       ↓                       │
│  Contexto conversacional      │
└──────────────┬────────────────┘
               │
               ▼
        ┌──────────────┐
        │  Mistral AI  │
        └──────┬───────┘
               │
               ▼
      Respuesta al usuario
```

---

#  Modelos implementados

## Clasificación de riesgo

Problema:

```text
Clasificación multiclase
```

Clases:

```text
low
medium
high
```

Modelo seleccionado:

```text
Logistic Regression
```

Configuración final:

```text
C = 10.0
class_weight = balanced
solver = lbfgs
```

Resultados finales:

| Métrica | Resultado |
|---|---:|
| Accuracy | 0.9048 |
| F1 weighted | 0.9049 |
| F1 macro | 0.9037 |
| ROC-AUC weighted | 0.9804 |
| ROC-AUC macro | 0.9808 |

Artefacto:

```text
app/models/risk-classification/
best_risk_classifier_safe.joblib
```

---

## Predicción de bienestar

Problema:

```text
Regresión supervisada
```

Variable objetivo:

```text
wellbeing_score
```

Rango:

```text
0 - 100
```

Modelo seleccionado:

```text
Ridge Regression
```

Configuración:

```text
alpha = 10.0
```

Resultados finales:

| Métrica | Resultado |
|---|---:|
| MAE | 3.1230 |
| RMSE | 3.8266 |
| R² | 0.9584 |

Artefacto:

```text
app/models/wellbeing-regression/
best_wellbeing_regressor.joblib
```

---

## Agrupación de perfiles

Algoritmo:

```text
K-Means
```

Número de clusters seleccionado:

```text
2
```

Resultados:

| Métrica | Resultado |
|---|---:|
| Silhouette Score | 0.3615 |
| Davies-Bouldin | 1.0408 |
| Calinski-Harabasz | 184.4039 |

Artefacto:

```text
app/models/wellbeing-clustering/
wellbeing_kmeans_pipeline.joblib
```

La agrupación tiene un propósito exploratorio y no representa categorías clínicas.

---

## Detección de anomalías

Algoritmo:

```text
Isolation Forest
```

Contaminación configurada:

```text
3 %
```

Artefacto:

```text
app/models/anomaly-detection/
isolation_forest_pipeline.joblib
```

Este componente se conserva como herramienta exploratoria y no como mecanismo diagnóstico.

---

#  Motor de recomendaciones

VitalMind incluye un motor basado en reglas transparentes.

Considera variables como:

```text
water_glasses
exercise_minutes
sleep_hours
healthy_meals_count
meditation_minutes
stress_level
energy_level
sleep_quality
risk_level
wellbeing_score
```

Metas internas:

| Variable | Meta |
|---|---:|
| Hidratación | 8 vasos |
| Ejercicio | 30 minutos |
| Sueño | 8 horas |
| Comidas saludables | 3 |
| Meditación | 10 minutos |

El sistema devuelve como máximo:

```text
5 recomendaciones
```

Implementación:

```text
app/services/recommendation_service.py
```

---

#  Chatbot inteligente

El chatbot utiliza actualmente:

```text
Proveedor: Mistral AI
Modelo: mistral-small-latest
```

Su función principal es convertir los resultados estructurados de VitalMind en una respuesta conversacional comprensible.

El flujo combinado es:

```text
Datos del usuario
       ↓
Modelos ML
       ↓
Riesgo + bienestar + BMI
       ↓
Motor de recomendaciones
       ↓
Contexto VitalMind
       ↓
Mistral AI
       ↓
Respuesta conversacional
```

Mistral no sustituye los modelos ML.

El chatbot está diseñado para:

- explicar resultados preventivos;
- responder preguntas generales de bienestar;
- contextualizar recomendaciones;
- utilizar resultados proporcionados por VitalMind.

No debe:

- diagnosticar enfermedades;
- recetar medicamentos;
- modificar tratamientos;
- inventar información clínica;
- modificar resultados producidos por los modelos ML.

---

#  Dataset

El desarrollo inicial utiliza un dataset sintético.

Características:

```text
Usuarios: 250
Registros: 5000
Periodo:
2026-04-01 a 2026-06-29
```

Dataset original:

```text
data/raw/vitalmind_dataset_raw.csv
```

Dataset procesado:

```text
data/processed/vitalmind_dataset_processed.csv
```

División temporal:

| Conjunto | Registros |
|---|---:|
| Train | 3418 |
| Validation | 731 |
| Test | 851 |

El conjunto de prueba fue reservado hasta la evaluación final.

---

#  Fuentes productivas

La integración productiva utilizará información proveniente de MySQL.

Fuentes principales:

```text
users
habit_logs
symptom_logs
emotional_logs
```

Backend será responsable de consultar estas tablas y construir el JSON requerido por el microservicio.

El ML Service no necesita consultar directamente MySQL.

---

#  Variables de entrada

## Indispensables

```text
age
height_cm
weight_kg
mood
stress_level
energy_level
sleep_quality
```

Estos campos no pueden ser imputados.

## Imputables

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

Las estadísticas utilizadas para imputación fueron aprendidas únicamente desde entrenamiento.

---

#  BMI

El BMI no necesita ser calculado por Backend.

El microservicio utiliza:

```text
height_cm
weight_kg
```

y calcula automáticamente:

```text
BMI = peso / altura²
```

La combinación resultante también se valida antes de ejecutar los modelos.

---

#  API REST

El servicio utiliza:

```text
FastAPI
```

Endpoints principales:

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/health` | Estado del servicio |
| GET | `/api/v1/models/info` | Información de modelos |
| POST | `/api/v1/analyze` | Análisis ML |
| POST | `/api/v1/chat` | Chat con contexto |
| POST | `/api/v1/chat/analyze` | ML + recomendaciones + chatbot |

---

#  Endpoint `/analyze`

Ejecuta:

```text
Validación
   ↓
Imputación
   ↓
BMI
   ↓
Clasificación de riesgo
   ↓
Predicción de bienestar
   ↓
Recomendaciones
```

Ejemplo:

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

#  Endpoint `/chat`

Ruta:

```text
POST /api/v1/chat
```

Se utiliza cuando ya existe un análisis previo y se desea generar una respuesta conversacional utilizando ese contexto.

---

#  Endpoint `/chat/analyze`

Ruta:

```text
POST /api/v1/chat/analyze
```

Ejecuta en una sola solicitud:

```text
Análisis ML
     +
Recomendaciones
     +
Chatbot
```

Este flujo permite que Backend envíe los datos de salud junto con la pregunta del usuario y reciba directamente una respuesta conversacional contextualizada.

---

#  Instalación

Desde la raíz del repositorio:

## 1. Crear entorno virtual

Windows:

```powershell
python -m venv .venv
```

## 2. Activarlo

PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

## 3. Instalar dependencias

```powershell
pip install -r ml-service/requirements.txt
```

---

#  Variables de entorno

Crea:

```text
ml-service/.env
```

Tomando como referencia:

```text
ml-service/.env.example
```

Configuración del chatbot:

```env
MISTRAL_API_KEY=TU_API_KEY
MISTRAL_MODEL=mistral-small-latest
MISTRAL_TEMPERATURE=0.4
MISTRAL_MAX_TOKENS=500
```

---

#  Ejecutar el microservicio

Desde la raíz:

```powershell
uvicorn app.main:app --app-dir ml-service --reload
```

Servidor local:

```text
http://127.0.0.1:8000
```

---

#  Swagger

Con el servidor activo:

```text
http://127.0.0.1:8000/docs
```

OpenAPI:

```text
http://127.0.0.1:8000/openapi.json
```

Swagger permite probar los endpoints directamente desde el navegador.

---

# Pruebas automatizadas

Desde la raíz:

```powershell
$env:PYTHONPATH = "ml-service"
pytest -v
```

También pueden ejecutarse únicamente las pruebas de API:

```powershell
pytest ml-service/tests/test_api.py -v
```

O las del chatbot:

```powershell
pytest ml-service/tests/test_chat.py -v
```

Las pruebas del chatbot utilizan mocks para evitar consumir solicitudes reales de Mistral.

---

#  Pruebas manuales

Servicio conversacional:

```powershell
python ml-service/scripts/test_chat_service.py
```

Motor de recomendaciones:

```powershell
python ml-service/scripts/test_recommendation_service.py
```

Estas pruebas manuales pueden utilizar servicios reales y, en el caso del chatbot, consumir cuota del proveedor.

---

#  Estructura principal

```text
ml-service/
│
├── app/
│   ├── api/
│   ├── core/
│   ├── models/
│   ├── prompts/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   └── main.py
│
├── data/
│   ├── raw/
│   ├── processed/
│   ├── training/
│   ├── validation/
│   ├── test/
│   └── modeling/
│
├── docs/
│   ├── api-contracts.md
│   ├── backend-integration-guide.md
│   ├── backend-schema-analysis.md
│   ├── chatbot-integration-guide.md
│   ├── data-dictionary.md
│   ├── data-sources.md
│   ├── etl-process.md
│   ├── ml-integration-contract.md
│   ├── ml-problem-definition.md
│   ├── model-evaluation.md
│   └── simulation-rules.md
│
├── reports/
├── scripts/
├── tests/
├── .env.example
├── requirements.txt
└── README.md
```

---

#  Documentación

| Documento | Contenido |
|---|---|
| `docs/ml-problem-definition.md` | Definición del problema ML |
| `docs/data-sources.md` | Fuentes y procedencia de datos |
| `docs/data-dictionary.md` | Variables, tipos y unidades |
| `docs/simulation-rules.md` | Generación del dataset sintético |
| `docs/etl-process.md` | Extracción y transformación |
| `docs/model-evaluation.md` | Entrenamiento y métricas |
| `docs/api-contracts.md` | Contratos REST |
| `docs/ml-integration-contract.md` | Contrato ML ↔ Backend |
| `docs/backend-schema-analysis.md` | Análisis del esquema MySQL |
| `docs/backend-integration-guide.md` | Guía para Backend |
| `docs/chatbot-integration-guide.md` | Integración del chatbot |

---

#  Limitaciones

El estado actual del proyecto presenta las siguientes limitaciones:

- entrenamiento principalmente sobre datos sintéticos;
- ausencia de validación clínica;
- distribución real de usuarios todavía desconocida;
- clustering exclusivamente exploratorio;
- detector de anomalías con utilidad exploratoria;
- dependencia externa de Mistral para respuestas conversacionales;
- integración productiva con Backend todavía dependiente del esquema definitivo de base de datos.

Los modelos deberán reevaluarse cuando VitalMind disponga de suficiente información real.

---

#  Consideraciones de seguridad

El microservicio no necesita utilizar como características:

```text
nombre
correo
teléfono
dirección
contraseña
token de autenticación
```

Las credenciales de proveedores externos deben permanecer exclusivamente en variables de entorno.

El chatbot incluye restricciones para evitar presentar sus respuestas como diagnósticos médicos.

---

#  Estado actual

Actualmente se encuentran implementados:

```text
[✓] Dataset sintético
[✓] Validación y limpieza
[✓] División temporal
[✓] Clasificación de riesgo
[✓] Regresión de bienestar
[✓] Clustering
[✓] Detección de anomalías
[✓] Serialización de modelos
[✓] Microservicio FastAPI
[✓] Validación de entrada
[✓] Imputación
[✓] Cálculo de BMI
[✓] Motor de recomendaciones
[✓] Chatbot con Mistral
[✓] Flujo ML → recomendaciones → chatbot
[✓] Pruebas automatizadas
[✓] Contratos de integración
[✓] Documentación técnica
```

---

#  Próxima etapa

La siguiente fase consiste en integrar el microservicio con el Backend productivo para que los datos sean obtenidos desde:

```text
users
habit_logs
symptom_logs
emotional_logs
```

y sean transformados automáticamente al contrato requerido por VitalMind ML.

Posteriormente, los modelos deberán ser monitoreados y reevaluados conforme se disponga de datos reales suficientes.