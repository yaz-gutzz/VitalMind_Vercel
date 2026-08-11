# Proceso ETL para Machine Learning — VitalMind AI

## 1. Propósito

Este documento describe el proceso de extracción, transformación y preparación de datos utilizado por el módulo de Machine Learning de VitalMind AI.

El objetivo es definir cómo los datos pasan desde las fuentes operativas del sistema hasta convertirse en entradas válidas para los modelos de clasificación de riesgo, regresión de bienestar, recomendaciones y chatbot inteligente.

---

## 2. Arquitectura general

El flujo principal es:

```text
MySQL
  ↓
Backend Node.js
  ↓
Extracción y unificación
  ↓
JSON de análisis
  ↓
Microservicio ML FastAPI
  ↓
Validación y transformación
  ↓
Modelos ML
  ↓
Resultados preventivos
```

Para el chatbot:

```text
Resultados ML
  ↓
Motor de recomendaciones
  ↓
Contexto estructurado
  ↓
Mistral AI
  ↓
Respuesta conversacional
```

---

## 3. Fuentes de datos

Las principales fuentes productivas son:

```text
users
habit_logs
symptom_logs
emotional_logs
```

Cada tabla aporta variables diferentes.

---

## 4. Extracción

La etapa de extracción corresponde principalmente a Backend.

Backend debe consultar MySQL y obtener los valores necesarios para la fecha de análisis.

### `users`

Variables:

```text
age
height_cm
weight_kg
```

### `habit_logs`

Variables:

```text
water
exercise
sleep
nutrition
meditation
```

### `symptom_logs`

Variables:

```text
pain
temperature
systolic
diastolic
glucose
heart_rate
weight
```

### `emotional_logs`

Variables:

```text
mood
stress_level
energy_level
sleep_quality
```

---

## 5. Selección temporal

La solicitud de inferencia incluye:

```text
analysis_date
```

Backend deberá seleccionar los datos correspondientes a esa fecha.

La fuente temporal principal será:

```text
habit_logs.log_date
symptom_logs.log_date
emotional_logs.log_date
```

`created_at` no debe utilizarse como fecha clínica o de comportamiento cuando exista `log_date`.

---

## 6. Política temporal

La prioridad recomendada es:

```text
1. Registro cuya log_date coincida con analysis_date
2. Registro más cercano a analysis_date
3. Aplicar política de faltantes cuando no exista información
```

La lógica exacta de selección deberá permanecer consistente entre Backend y ML.

---

## 7. Selección del peso

El peso puede provenir de dos fuentes:

```text
symptom_logs.weight
users.weight_kg
```

Orden de prioridad:

```text
1. symptom_logs.weight asociado con la fecha analizada
2. users.weight_kg como respaldo
```

El campo enviado al microservicio siempre será:

```text
weight_kg
```

---

## 8. Mapeo de nombres

Backend transforma los nombres físicos de la base a los nombres definidos por el contrato ML.

### Hábitos

```text
habit_logs.water
    -> water_glasses

habit_logs.exercise
    -> exercise_minutes

habit_logs.sleep
    -> sleep_hours

habit_logs.nutrition
    -> healthy_meals_count

habit_logs.meditation
    -> meditation_minutes
```

### Síntomas

```text
symptom_logs.temperature
    -> temperature_c

symptom_logs.systolic
    -> systolic_mmhg

symptom_logs.diastolic
    -> diastolic_mmhg

symptom_logs.glucose
    -> glucose_mg_dl

symptom_logs.heart_rate
    -> heart_rate_bpm

symptom_logs.weight
    -> weight_kg
```

### Estado emocional

```text
emotional_logs.mood
    -> mood

emotional_logs.stress_level
    -> stress_level

emotional_logs.energy_level
    -> energy_level

emotional_logs.sleep_quality
    -> sleep_quality
```

---

## 9. Unificación

Backend debe construir un único objeto JSON.

Ejemplo:

```json
{
  "request_id": "REQ-001",
  "user_id": "USR_001",
  "analysis_date": "2026-08-09",
  "features": {
    "age": 25,
    "height_cm": 165,
    "weight_kg": 65,
    "water_glasses": 6,
    "exercise_minutes": 20,
    "sleep_hours": 7,
    "healthy_meals_count": 2,
    "meditation_minutes": 5,
    "pain": 2,
    "temperature_c": 36.7,
    "systolic_mmhg": 120,
    "diastolic_mmhg": 80,
    "glucose_mg_dl": 95,
    "heart_rate_bpm": 75,
    "mood": "regular",
    "stress_level": 5,
    "energy_level": 6,
    "sleep_quality": 6
  }
}
```

---

# 10. Transformación dentro del microservicio

Después de recibir el JSON, el microservicio ejecuta:

```text
Validación
  ↓
Normalización
  ↓
Imputación autorizada
  ↓
Cálculo de BMI
  ↓
Ordenamiento de características
  ↓
Inferencia
```

---

## 11. Validación

Los esquemas Pydantic verifican:

* tipos de datos;
* rangos;
* campos obligatorios;
* categorías permitidas;
* variables desconocidas;
* formato de fecha.

Los valores inválidos se rechazan mediante:

```text
HTTP 422
```

---

## 12. Campos indispensables

Los siguientes campos no pueden ser imputados:

```text
age
height_cm
weight_kg
mood
stress_level
energy_level
sleep_quality
```

Si falta alguno, la solicitud debe ser rechazada.

---

## 13. Campos imputables

Los siguientes campos pueden tratarse mediante la estrategia aprendida en entrenamiento:

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

Nunca deben sustituirse automáticamente por cero.

---

## 14. Estrategia de imputación

Los valores de imputación se aprendieron únicamente desde el conjunto de entrenamiento.

Los metadatos se encuentran en:

```text
ml-service/data/modeling/preprocessing_metadata.json
```

Esto evita utilizar estadísticas obtenidas desde validación o prueba.

Toda imputación realizada durante inferencia se devuelve en:

```text
missing_data_report
```

---

## 15. Normalización de `mood`

Los valores esperados son:

```text
muy mal
mal
regular
bien
muy bien
```

El microservicio aplica:

* eliminación de espacios externos;
* normalización de espacios repetidos;
* conversión a minúsculas.

Ejemplo:

```text
"  MUY   BIEN "
```

se transforma a:

```text
"muy bien"
```

---

## 16. Cálculo de BMI

Backend no necesita enviar:

```text
bmi
```

Se calcula dentro del microservicio utilizando:

```text
weight_kg
height_cm
```

El resultado se valida antes de enviarse a los modelos.

---

## 17. Preparación para modelos

La entrada final contiene las características utilizadas por los modelos:

```text
age
height_cm
weight_kg
bmi
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
stress_level
energy_level
sleep_quality
mood
```

Estas variables se organizan en el mismo formato utilizado durante entrenamiento.

---

# 18. Clasificación de riesgo

El clasificador recibe las características procesadas y devuelve:

```text
risk_level
confidence
probabilities
```

Clases:

```text
low
medium
high
```

---

# 19. Regresión de bienestar

El regresor devuelve:

```text
wellbeing.score
wellbeing.level
```

El puntaje se limita al intervalo:

```text
0 a 100
```

Niveles interpretativos:

```text
low
medium
high
```

---

# 20. Recomendaciones preventivas

Después de obtener los resultados del modelo se ejecuta el motor de recomendaciones.

Este utiliza:

```text
features
risk_level
wellbeing_score
```

y genera un máximo de:

```text
5 recomendaciones
```

Las reglas se implementan en:

```text
ml-service/app/services/recommendation_service.py
```

---

# 21. Chatbot

Para el flujo combinado:

```http
POST /api/v1/chat/analyze
```

el proceso continúa:

```text
Inferencia ML
   ↓
Recomendaciones
   ↓
Construcción de contexto
   ↓
Mistral AI
   ↓
Respuesta conversacional
```

Mistral no realiza directamente la extracción o transformación de datos.

---

# 22. Salida del proceso

Ejemplo simplificado:

```json
{
  "results": {
    "risk_classification": {
      "risk_level": "medium"
    },
    "wellbeing": {
      "score": 58.4,
      "level": "medium"
    },
    "calculated_bmi": 23.88,
    "recommendations": [
      "Procura mejorar gradualmente la regularidad y duración de tu descanso."
    ]
  },
  "missing_data_report": {
    "required_missing": [],
    "imputed_fields": [],
    "warnings": []
  }
}
```

---

# 23. ETL del dataset sintético

Durante la etapa de desarrollo se utilizó un proceso ETL adicional sobre datos simulados.

Flujo:

```text
generate_dataset.py
        ↓
vitalmind_dataset_raw.csv
        ↓
validate_dataset.py
        ↓
clean_dataset.py
        ↓
vitalmind_dataset_processed.csv
        ↓
split_dataset.py
        ↓
train / validation / test
        ↓
prepare_model_data.py
        ↓
datasets de modelado
```

---

## 24. Validación del dataset sintético

Script:

```text
ml-service/scripts/validate_dataset.py
```

Se revisaron aspectos como:

* estructura;
* rangos;
* valores faltantes;
* coherencia de hidratación;
* distribución de clases;
* porcentaje de anomalías.

Resultado final:

```text
DATASET VÁLIDO
```

---

## 25. Limpieza

Script:

```text
ml-service/scripts/clean_dataset.py
```

Resultado:

```text
Registros raw: 5000
Registros procesados: 5000
Valores faltantes raw: 1500
Valores faltantes procesados: 0
Pesos recuperados desde perfil: 150
```

---

## 26. División temporal

Script:

```text
ml-service/scripts/split_dataset.py
```

Particiones:

```text
Train:      3418
Validation: 731
Test:       851
```

La división no se realizó de forma aleatoria.

Se conservó la separación temporal para simular un escenario futuro de inferencia.

---

# 27. Responsabilidades

## Backend

Responsable de:

* conexión con MySQL;
* selección temporal;
* extracción de registros;
* combinación de tablas;
* mapeo de campos;
* construcción del JSON;
* autenticación del usuario.

## Machine Learning

Responsable de:

* validación del contrato;
* normalización;
* imputación;
* cálculo de BMI;
* inferencia;
* recomendaciones;
* chatbot;
* reporte de faltantes.

---

# 28. Seguridad

El proceso ETL no requiere enviar al microservicio:

```text
full_name
email
phone
password
address
authentication_token
```

Los modelos no utilizan datos de identificación personal como características.

---

# 29. Archivos relacionados

```text
ml-service/docs/data-sources.md
ml-service/docs/data-dictionary.md
ml-service/docs/simulation-rules.md
ml-service/docs/ml-integration-contract.md
ml-service/docs/backend-integration-guide.md
ml-service/docs/model-evaluation.md
```

---

# 30. Conclusión

El proceso ETL de VitalMind AI separa claramente la extracción de datos realizada por Backend de las transformaciones específicas requeridas por Machine Learning.

Esta separación permite que el microservicio permanezca independiente de la estructura física de MySQL y reciba siempre un contrato uniforme de datos.
