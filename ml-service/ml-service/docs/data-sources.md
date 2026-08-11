# Fuentes de datos — VitalMind AI

## 1. Propósito

Este documento identifica las fuentes de datos utilizadas por el módulo de Machine Learning de VitalMind AI y describe su función durante las etapas de simulación, entrenamiento, validación e integración.

El desarrollo inicial de los modelos se realizó con información sintética debido a que el sistema todavía no cuenta con un volumen suficiente de datos reales históricos.

---

## 2. Fuentes utilizadas durante el desarrollo

Durante el desarrollo del módulo ML se utilizaron principalmente dos tipos de fuentes:

1. Dataset sintético generado para entrenamiento y evaluación.
2. Esquema relacional MySQL proporcionado por Backend para definir la futura integración con datos reales.

---

# 3. Dataset sintético original

Archivo principal:

```text
ml-service/data/raw/vitalmind_dataset_raw.csv
```

El dataset fue generado mediante:

```text
ml-service/scripts/generate_dataset.py
```

Características generales:

```text
Usuarios simulados: 250
Registros: 5000
Periodo: 2026-04-01 a 2026-06-29
```

El dataset incluye información relacionada con:

* datos demográficos;
* peso y altura;
* hábitos diarios;
* síntomas;
* estado emocional;
* variables cardiovasculares;
* nivel preventivo de riesgo;
* puntaje de bienestar;
* anomalías sintéticas.

---

## 4. Motivo de la simulación

Los modelos no podían entrenarse inicialmente con datos reales debido a la ausencia de suficiente historial dentro de la aplicación.

Por esta razón se desarrolló un proceso de simulación controlada.

Las reglas utilizadas se encuentran documentadas en:

```text
ml-service/docs/simulation-rules.md
```

La simulación busca reproducir combinaciones plausibles de hábitos y variables preventivas únicamente con fines académicos y de desarrollo.

Los datos sintéticos no representan pacientes reales.

---

# 5. Dataset procesado

Después de validar y limpiar el dataset original se generó:

```text
ml-service/data/processed/vitalmind_dataset_processed.csv
```

Características:

```text
Registros: 5000
Valores faltantes después del procesamiento: 0
```

Durante el procesamiento se realizaron tareas como:

* normalización de nombres;
* recuperación de peso histórico;
* cálculo de variables derivadas;
* tratamiento documentado de valores faltantes;
* validación de rangos;
* preparación de variables para modelado.

---

# 6. División temporal

El dataset procesado fue dividido respetando el orden temporal.

## Entrenamiento

```text
ml-service/data/training/train.csv
```

```text
Registros: 3418
Periodo: 2026-04-01 a 2026-06-01
```

## Validación

```text
ml-service/data/validation/validation.csv
```

```text
Registros: 731
Periodo: 2026-06-02 a 2026-06-14
```

## Prueba

```text
ml-service/data/test/test.csv
```

```text
Registros: 851
Periodo: 2026-06-15 a 2026-06-29
```

El conjunto de prueba fue reservado hasta la evaluación final de los modelos supervisados.

---

# 7. Datos preparados para modelado

Después de aprender la estrategia de imputación exclusivamente desde entrenamiento se generaron:

```text
ml-service/data/modeling/train_model.csv
ml-service/data/modeling/validation_model.csv
ml-service/data/modeling/test_model.csv
```

También se generaron:

```text
ml-service/data/modeling/preprocessing_metadata.json
ml-service/data/modeling/model_data_quality_report.json
```

`preprocessing_metadata.json` conserva las estadísticas aprendidas desde entrenamiento necesarias para realizar imputaciones posteriores sin utilizar información de validación o prueba.

---

# 8. Fuente real futura: MySQL

La fuente productiva de información para el microservicio será la base de datos MySQL administrada por Backend.

El microservicio ML no consulta directamente la base de datos.

Backend será responsable de reunir la información desde diferentes tablas y construir un único JSON.

---

# 9. Tabla `users`

Fuente de:

```text
age
height_cm
weight_kg
```

El campo:

```text
users.weight_kg
```

representa el último peso conocido del perfil.

Se utiliza como respaldo cuando no existe una medición histórica de peso disponible para la fecha analizada.

---

# 10. Tabla `habit_logs`

Fuente de hábitos diarios.

Mapeo:

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

Unidades confirmadas por Backend:

| Campo físico | Significado                    |
| ------------ | ------------------------------ |
| `water`      | vasos de agua                  |
| `exercise`   | minutos de ejercicio           |
| `sleep`      | horas de sueño                 |
| `nutrition`  | cantidad de comidas saludables |
| `meditation` | minutos de meditación          |

La fecha del registro se obtiene mediante:

```text
habit_logs.log_date
```

---

# 11. Tabla `symptom_logs`

Fuente de información física.

Mapeo:

```text
symptom_logs.pain
    -> pain

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

Para ML se recomienda utilizar:

```text
symptom_logs.log_date
```

como fecha real del síntoma.

`created_at` debe conservarse únicamente como fecha técnica de inserción.

---

# 12. Tabla `emotional_logs`

Se definió una entidad independiente para almacenar el historial emocional del usuario.

Fuente de:

```text
mood
stress_level
energy_level
sleep_quality
```

Escalas:

```text
stress_level:  1 a 10
energy_level:  1 a 10
sleep_quality: 1 a 10
```

Valores posibles de `mood` en la base:

```text
Muy bien
Bien
Regular
Mal
Muy mal
```

El microservicio normaliza estos valores a minúsculas antes de realizar la inferencia.

La selección temporal se realizará utilizando:

```text
emotional_logs.log_date
```

---

# 13. Selección temporal de datos reales

Backend deberá construir el registro asociado con:

```text
analysis_date
```

utilizando preferentemente los registros cuya `log_date` corresponda a esa fecha.

Cuando exista más de un registro o no exista una coincidencia exacta, Backend deberá utilizar la política temporal acordada para seleccionar el registro más cercano.

---

# 14. Peso utilizado por Machine Learning

Orden de preferencia:

```text
1. symptom_logs.weight
2. users.weight_kg
```

Se utilizará primero el peso histórico asociado con la fecha analizada.

Cuando no exista, se utilizará el último peso registrado en el perfil.

El nombre enviado al microservicio siempre será:

```text
weight_kg
```

---

# 15. Construcción del JSON

Backend reunirá las variables de las diferentes tablas y enviará un único objeto.

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
    "exercise_minutes": 30,
    "sleep_hours": 7,
    "healthy_meals_count": 3,
    "meditation_minutes": 10,
    "pain": 2,
    "temperature_c": 36.7,
    "systolic_mmhg": 120,
    "diastolic_mmhg": 80,
    "glucose_mg_dl": 95,
    "heart_rate_bpm": 75,
    "mood": "bien",
    "stress_level": 4,
    "energy_level": 7,
    "sleep_quality": 7
  }
}
```

---

# 16. Privacidad

Los datasets utilizados para desarrollo son sintéticos.

El módulo ML no requiere:

* nombre;
* correo electrónico;
* teléfono;
* dirección;
* contraseña;
* CURP;
* token de autenticación.

`user_id` se utiliza únicamente para trazabilidad y no debe utilizarse como característica predictiva.

---

# 17. Archivos relacionados

Diccionario de variables:

```text
ml-service/docs/data-dictionary.md
```

Reglas de simulación:

```text
ml-service/docs/simulation-rules.md
```

Contrato ML:

```text
ml-service/docs/ml-integration-contract.md
```

Análisis del esquema Backend:

```text
ml-service/docs/backend-schema-analysis.md
```

Evaluación de modelos:

```text
ml-service/docs/model-evaluation.md
```

---

# 18. Limitaciones

* El entrenamiento actual utiliza datos sintéticos.
* Las distribuciones reales de usuarios pueden ser diferentes.
* La base productiva todavía requiere integración completa con Backend.
* Los modelos deberán reevaluarse cuando exista suficiente información real.
* Los datos reales requerirán controles adicionales de privacidad, seguridad y calidad.

---

# 19. Conclusión

VitalMind AI utiliza actualmente un dataset sintético controlado como fuente para entrenamiento y evaluación.

La arquitectura final establece a MySQL como fuente productiva de información.

Backend será responsable de reunir datos desde `users`, `habit_logs`, `symptom_logs` y `emotional_logs`, mientras que el microservicio ML será responsable del preprocesamiento, inferencia y generación de resultados preventivos.
