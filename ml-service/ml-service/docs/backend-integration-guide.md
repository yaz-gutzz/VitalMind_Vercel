# Guía de integración del microservicio ML

## 1. Descripción

El microservicio ML de VitalMind AI expone una API REST para ejecutar:

- Clasificación de riesgo.
- Estimación del puntaje de bienestar.
- Cálculo de BMI.
- Imputación controlada de variables permitidas.
- Reporte de datos faltantes.

El servicio recibe un único JSON construido por Backend.

El microservicio no consulta directamente la base de datos.

---

## 2. Requisitos

- Python 3.12.
- Entorno virtual activo.
- Dependencias instaladas.
- Modelos serializados disponibles dentro de `ml-service/app/models`.

---

## 3. Instalación

Desde la raíz del repositorio:

```powershell
python -m venv .venv
```

Activar el entorno

```powershell
.\.venv\Scripts\Activate.ps1
```

Instalar dependencias

```powershell
pip install -r ml-service/requirements.txt
```

## 4. Ejecucion del microservicio

Desde la raiz del repositorio:

```powershell
uvicorn app.main:app --app-dir ml-service --reaload
```

El servicio quedara disponible en:

```text
http://127.0.0.1:8000
```

Documentacion interactiva:

```text
http://127.0.0.1:8000/docs
```

Especificacion OpenAPI:
```text
http://127.0.0.1:8000/openapi.json
```

````markdown
## 5. Endpoints disponibles

### 5.1 Verificar estado

```http
GET /health
````

Respuesta:

```json
{
  "status": "healthy",
  "models_loaded": true,
  "service_version": "1.0.0"
}
```

### 5.2 Consultar modelos

```http
GET /api/v1/models/info
```

Respuesta:

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

### 5.3 Ejecutar análisis

```http
POST /api/v1/analyze
```

---

## 6. JSON de entrada

```json
{
  "request_id": "REQ-20260803-001",
  "user_id": "USR_0001",
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
    "sleep_quality": 6
  }
}
```

---

## 7. Campos indispensables

La solicitud será rechazada si falta alguno de los siguientes campos:

* `age`
* `height_cm`
* `weight_kg`
* `mood`
* `stress_level`
* `energy_level`
* `sleep_quality`

> Estos campos nunca se imputan.

---

## 8. Campos imputables

Los siguientes campos pueden omitirse o enviarse como `null`:

* `water_glasses`
* `exercise_minutes`
* `sleep_hours`
* `healthy_meals_count`
* `meditation_minutes`
* `pain`
* `temperature_c`
* `systolic_mmhg`
* `diastolic_mmhg`
* `glucose_mg_dl`
* `heart_rate_bpm`

La imputación utiliza medianas aprendidas únicamente desde el conjunto de entrenamiento.

> Nunca se reemplazan valores faltantes automáticamente por cero.

---

## 9. Valores permitidos para `mood`

Los valores permitidos son:

* `muy mal`
* `mal`
* `regular`
* `bien`
* `muy bien`

El servicio normaliza:

* Mayúsculas.
* Minúsculas.
* Espacios al inicio y al final.
* Espacios repetidos.

Ejemplo aceptado:

```text
"  MUY   BIEN  "
```

Se transforma internamente en:

```text
"muy bien"
```

---

## 10. Cálculo de BMI

Backend no debe enviar `bmi`.

El microservicio lo calcula mediante:

```text
bmi = weight_kg / (height_cm / 100)²
```

Se requiere:

```text
height_cm > 0
weight_kg > 0
```

---

## 11. Respuesta exitosa

```json
{
  "request_id": "REQ-20260803-001",
  "user_id": "USR_0001",
  "analysis_date": "2026-08-03",
  "results": {
    "risk_classification": {
      "risk_level": "low",
      "confidence": 0.552016,
      "probabilities": {
        "low": 0.552016,
        "medium": 0.447909,
        "high": 0.000075
      }
    },
    "wellbeing": {
      "score": 69.5901,
      "level": "medium"
    },
    "calculated_bmi": 25.7812
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

## 12. Respuesta con imputación

```json
{
  "missing_data_report": {
    "required_missing": [],
    "imputed_fields": [
      "exercise_minutes",
      "meditation_minutes",
      "glucose_mg_dl"
    ],
    "warnings": [
      "exercise_minutes fue imputado con la mediana aprendida desde entrenamiento.",
      "meditation_minutes fue imputado con la mediana aprendida desde entrenamiento.",
      "glucose_mg_dl fue imputado con la mediana aprendida desde entrenamiento."
    ]
  }
}
```

La predicción se ejecuta normalmente después de la imputación.

---

## 13. Error por campo indispensable faltante

Código HTTP:

```http
422 Unprocessable Entity
```

Respuesta:

```json
{
  "request_id": "REQ-20260803-003",
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

## 14. Error por valor inválido

Ejemplos de valores inválidos:

* `stress_level` mayor que 10.
* `mood` fuera de las categorías permitidas.
* Peso o altura menores o iguales a cero.
* Campo desconocido dentro de `features`.

Código HTTP:

```http
422 Unprocessable Entity
```

Respuesta general:

```json
{
  "request_id": "REQ-20260803-004",
  "status": "validation_error",
  "message": "La solicitud contiene datos faltantes, inválidos o fuera de los rangos permitidos.",
  "missing_data_report": {
    "required_missing": [],
    "imputed_fields": [],
    "warnings": []
  }
}
```

---

## 15. Responsabilidades de Backend

Backend debe:

* Consultar las tablas correspondientes.
* Obtener la información más cercana a `analysis_date`.
* Mapear los nombres físicos de la base a los nombres del contrato ML.
* Construir un único JSON.
* Generar `request_id`.
* Consumir el endpoint REST.
* Manejar errores de red y tiempos de espera.
* Guardar o mostrar los resultados.

### 15.1 Ejemplo de mapeo de hábitos

```text
habit_logs.water      -> water_glasses
habit_logs.exercise   -> exercise_minutes
habit_logs.sleep      -> sleep_hours
habit_logs.nutrition  -> healthy_meals_count
habit_logs.meditation -> meditation_minutes
```

### 15.2 Ejemplo de mapeo de síntomas

```text
symptom_logs.temperature -> temperature_c
symptom_logs.systolic    -> systolic_mmhg
symptom_logs.diastolic   -> diastolic_mmhg
symptom_logs.glucose     -> glucose_mg_dl
symptom_logs.heart_rate  -> heart_rate_bpm
symptom_logs.weight      -> weight_kg
```

Los campos emocionales deberán obtenerse desde:

```text
emotional_logs.mood -> mood
emotional_logs.stress_level -> stress_level
emotional_logs.energy_level -> energy_level
emotional_logs.sleep_quality -> sleep_quality

symptom_logs.log_date -> fecha real del síntoma
emotional_logs.log_date -> fecha real del estado emocional
habit_logs.log_date -> fecha real de los hábitos
```

Para el análisis se deberá seleccionar preferentemente el regsitro con 'log date' más cercano a 'analysis_date'



---

## 16. Ejemplo desde PowerShell

```powershell
$body = @{
    request_id = "REQ-BACKEND-001"
    user_id = "USR_0001"
    analysis_date = "2026-08-03"

    features = @{
        age = 20
        height_cm = 160
        weight_kg = 66
        water_glasses = 6
        exercise_minutes = 35
        sleep_hours = 6.5
        healthy_meals_count = 3
        meditation_minutes = 10
        pain = 2
        temperature_c = 36.7
        systolic_mmhg = 118
        diastolic_mmhg = 76
        glucose_mg_dl = 92
        heart_rate_bpm = 74
        mood = "bien"
        stress_level = 4
        energy_level = 7
        sleep_quality = 6
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/api/v1/analyze" `
  -Method Post `
  -ContentType "application/json; charset=utf-8" `
  -Body $body
```

---

## 17. Pruebas

Desde la raíz del proyecto:

```bash
pytest -v
```

Resultado validado:

```text
9 passed
```

Los casos cubiertos incluyen:

* Estado del servicio.
* Carga de modelos.
* Análisis completo.
* Imputación.
* Campo indispensable faltante.
* Normalización de `mood`.
* `mood` inválido.
* Rango inválido.
* Campo desconocido.

---

## 18. Limitaciones

* Los modelos fueron entrenados con datos sintéticos.
* No representan un diagnóstico clínico.
* Las probabilidades son resultados analíticos del modelo.
* La integración con datos reales depende de la disponibilidad de todos los campos en Backend.
* El contrato debe versionarse si cambian las variables, los modelos o el preprocesamiento.

```
```

