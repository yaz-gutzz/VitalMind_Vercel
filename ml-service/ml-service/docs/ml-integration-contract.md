# Contrato de integración del microservicio ML

## 1. Propósito

Este documento define el contrato de comunicación entre el Backend principal de VitalMind AI y el microservicio independiente de Machine Learning.

El microservicio será responsable de:

- Validar la solicitud recibida.
- Normalizar las variables de entrada.
- Calcular el índice de masa corporal.
- Aplicar imputaciones únicamente en campos autorizados.
- Ejecutar el clasificador de riesgo.
- Ejecutar el regresor de bienestar.
- Devolver resultados, probabilidades y metadatos de los modelos.

El microservicio no será responsable de:

- Consultar directamente la base de datos.
- Autenticar usuarios.
- Reunir información desde múltiples tablas.
- Guardar resultados en la base de datos.
- Implementar lógica de negocio del Backend principal.
- Mostrar resultados en el Frontend.

---

## 2. Arquitectura de integración

La integración se realizará mediante un microservicio Python independiente expuesto por REST.

Flujo general:

```text
Frontend
   ↓
Backend principal
   ↓
Microservicio ML
   ↓
Modelos serializados
```

````markdown
## 2. Responsabilidad del Backend principal

El Backend principal deberá:

- Obtener los datos desde las tablas correspondientes.
- Construir un único objeto JSON.
- Enviar la solicitud al microservicio ML.
- Recibir la respuesta.
- Guardar o mostrar el resultado según la lógica del sistema.

---

## 3. Endpoint principal propuesto

```http
POST /api/v1/analyze
````

El endpoint realizará en una sola solicitud:

* Clasificación de riesgo.
* Estimación del puntaje de bienestar.
* Cálculo de BMI.
* Reporte de datos faltantes o imputados.

---

## 4. Estructura de entrada

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

## 5. Metadatos de la solicitud

### 5.1 `request_id`

Identificador único de la solicitud.

**Características:**

* Tipo: `string`.
* Obligatorio.
* Debe ser generado por Backend.
* Permite rastrear una solicitud entre servicios.

### 5.2 `user_id`

Identificador anónimo o interno del usuario.

**Características:**

* Tipo: `string`.
* Obligatorio.
* El microservicio no utilizará este valor como característica del modelo.
* Solo se devolverá como referencia en la respuesta.

### 5.3 `analysis_date`

Fecha asociada con los datos analizados.

**Características:**

* Tipo: fecha en formato ISO `YYYY-MM-DD`.
* Obligatoria.
* No se utilizará directamente como característica del modelo.
* Permitirá mantener trazabilidad temporal.

---

## 6. Variables requeridas por los modelos

| Variable              | Tipo    | Unidad o escala                 |
| --------------------- | ------- | ------------------------------- |
| `age`                 | Entero  | Años                            |
| `height_cm`           | Decimal | Centímetros                     |
| `weight_kg`           | Decimal | Kilogramos                      |
| `water_glasses`       | Decimal | Vasos de aproximadamente 250 ml |
| `exercise_minutes`    | Decimal | Minutos                         |
| `sleep_hours`         | Decimal | Horas                           |
| `healthy_meals_count` | Decimal | Cantidad de comidas saludables  |
| `meditation_minutes`  | Decimal | Minutos                         |
| `pain`                | Decimal | Escala de 0 a 10                |
| `temperature_c`       | Decimal | Grados Celsius                  |
| `systolic_mmhg`       | Decimal | mmHg                            |
| `diastolic_mmhg`      | Decimal | mmHg                            |
| `glucose_mg_dl`       | Decimal | mg/dL                           |
| `heart_rate_bpm`      | Decimal | Latidos por minuto              |
| `mood`                | String  | Categoría normalizada           |
| `stress_level`        | Decimal | Escala de 1 a 10                |
| `energy_level`        | Decimal | Escala de 1 a 10                |
| `sleep_quality`       | Decimal | Escala de 1 a 10                |

---

## 7. Normalización de `mood`

Backend enviará `mood` en español, en minúsculas y sin espacios adicionales.

Valores permitidos:

* `muy mal`
* `mal`
* `regular`
* `bien`
* `muy bien`

El microservicio validará y normalizará el valor mediante:

* Conversión a `string`.
* Eliminación de espacios al inicio y al final.
* Conversión a minúsculas.

> No se aceptarán automáticamente categorías desconocidas.

---

## 8. Cálculo de BMI

Backend no enviará `bmi`.

El microservicio lo calculará utilizando:

```text
height_m = height_cm / 100

bmi = weight_kg / height_m²
```

Validaciones previas:

* `height_cm` debe ser mayor que cero.
* `weight_kg` debe ser mayor que cero.
* Ambos valores deben ser numéricos y finitos.

El BMI calculado se incorporará internamente a las variables de los modelos y también se devolverá en la respuesta.

---

## 9. Política de datos faltantes

Los datos faltantes se manejarán mediante dos grupos.

### 9.1 Campos indispensables

Si falta alguno de estos campos, la solicitud será rechazada:

* `age`
* `height_cm`
* `weight_kg`
* `mood`
* `stress_level`
* `energy_level`
* `sleep_quality`

No se realizará una predicción parcial.

### 9.2 Campos potencialmente imputables

Los siguientes campos podrán imputarse únicamente utilizando valores aprendidos desde el conjunto de entrenamiento:

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

La lista podrá modificarse si Backend y ML acuerdan una política distinta.

### 9.3 Reglas obligatorias

* Nunca sustituir valores faltantes automáticamente por cero.
* No utilizar estadísticas calculadas con datos de validación o prueba.
* Toda imputación deberá aparecer en `missing_data_report`.
* Los campos indispensables nunca deberán imputarse.
* Los valores inválidos no deberán tratarse como faltantes silenciosamente.

---

## 10. Estructura de respuesta exitosa

```json
{
  "request_id": "REQ-20260803-001",
  "user_id": "USR_0001",
  "analysis_date": "2026-08-03",
  "results": {
    "risk_classification": {
      "risk_level": "low",
      "confidence": 0.6,
      "probabilities": {
        "low": 0.6,
        "medium": 0.3998,
        "high": 0.0002
      }
    },
    "wellbeing": {
      "score": 71.4,
      "level": "medium"
    },
    "calculated_bmi": 25.78
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

## 11. Clasificación de riesgo

La clasificación devolverá una de las siguientes categorías:

* `low`
* `medium`
* `high`

También devolverá:

* Confianza máxima.
* Probabilidad para cada clase.
* Versión del modelo utilizado.

> La confianza representa la probabilidad máxima producida por el modelo y no debe interpretarse como certeza clínica.

---

## 12. Puntaje de bienestar

El regresor devolverá un puntaje limitado al intervalo:

```text
0 a 100
```

Interpretación exploratoria:

| Puntaje          | Nivel    |
| ---------------- | -------- |
| 0 a menos de 50  | `low`    |
| 50 a menos de 75 | `medium` |
| 75 a 100         | `high`   |

> Este puntaje es una estimación analítica construida sobre datos sintéticos.

---

## 13. Respuesta por error de validación

Ejemplo de una solicitud con campos indispensables faltantes:

```json
{
  "request_id": "REQ-20260803-002",
  "status": "validation_error",
  "message": "Faltan campos indispensables para ejecutar la inferencia.",
  "missing_data_report": {
    "required_missing": [
      "weight_kg",
      "mood"
    ],
    "imputed_fields": [],
    "warnings": []
  }
}
```

Código HTTP propuesto:

```http
422 Unprocessable Entity
```

---

## 14. Respuesta por error interno

```json
{
  "request_id": "REQ-20260803-003",
  "status": "internal_error",
  "message": "No fue posible ejecutar la inferencia."
}
```

Código HTTP propuesto:

```http
500 Internal Server Error
```

> La respuesta no deberá exponer rutas locales, trazas completas ni información sensible del servidor.

---

## 15. Artefactos utilizados

### 15.1 Clasificador de riesgo

Ruta:

```text
ml-service/app/models/risk-classification/
best_risk_classifier_safe.joblib
```

Algoritmo:

```text
Logistic Regression
```

### 15.2 Regresor de bienestar

Ruta:

```text
ml-service/app/models/wellbeing-regression/
best_wellbeing_regressor.joblib
```

Algoritmo:

```text
Ridge Regression
```

### 15.3 Metadatos de imputación

Ruta:

```text
ml-service/data/modeling/
preprocessing_metadata.json
```

---

## 16. Versionado de modelos

Versión inicial propuesta:

```text
risk_classifier: 1.0.0
wellbeing_regressor: 1.0.0
```

Una versión deberá cambiar cuando se modifique:

* Dataset de entrenamiento.
* Selección de variables.
* Preprocesamiento.
* Hiperparámetros.
* Algoritmo.
* Política de imputación.
* Orden o estructura de las características.

---

## 17. Endpoints complementarios propuestos

### 17.1 Estado del servicio

```http
GET /health
```

Respuesta esperada:

```json
{
  "status": "healthy",
  "models_loaded": true
}
```

### 17.2 Información de modelos

```http
GET /api/v1/models/info
```

Respuesta esperada:

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

## 18. Responsabilidades

### 18.1 Microservicio ML

* Validar el contrato.
* Calcular BMI.
* Normalizar `mood`.
* Aplicar imputaciones autorizadas.
* Cargar modelos.
* Ejecutar inferencias.
* Construir respuestas normalizadas.
* Reportar errores sin exponer detalles internos.
* Mantener versiones de modelos.

### 18.2 Backend principal

* Obtener información desde las tablas.
* Construir el JSON.
* Autenticar y autorizar usuarios.
* Consumir el microservicio.
* Manejar tiempos de espera y errores de red.
* Guardar resultados cuando corresponda.
* Entregar resultados al Frontend.

---

## 19. Limitaciones

* Los modelos fueron entrenados con datos sintéticos.
* No existe validación clínica.
* El resultado no sustituye atención profesional.
* Las probabilidades no representan certeza médica.
* El contrato deberá revisarse cuando existan datos reales.
* Las imputaciones deberán quedar registradas en cada respuesta.

## Fuente esperada de los datos

Backend reunirá los datos desde:

- `users`: edad, altura y peso de respaldo.
- `habit_logs`: agua, ejercicio, sueño, nutrición y meditación.
- `symptom_logs`: dolor y mediciones físicas.
- `emotional_logs`: mood, estrés, energía y calidad del sueño.

La selección temporal deberá basarse en `log_date`, no en `created_at`.