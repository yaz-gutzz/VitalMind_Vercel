# Análisis del esquema de Backend para Machine Learning

## 1. Fuente principal de datos

La fuente principal de información de VitalMind AI será una base de datos relacional MySQL.

El módulo de Machine Learning no accederá directamente a MongoDB.

Los datos podrán obtenerse mediante:

- Consultas controladas a MySQL.
- Exportaciones preparadas para entrenamiento.
- Una capa intermedia proporcionada por Backend.
- Archivos CSV o JSON generados a partir de las tablas del sistema.

## 2. Entidades disponibles

Las entidades identificadas son:

- `users`
- `medications`
- `medication_logs`
- `appointments`
- `medical_history_items`
- `habit_logs`
- `symptom_logs`
- `notifications`
- `audit_logs`

También se propone agregar:

- `emotional_logs`

## 3. Entidades principales para la primera versión de ML

### `users`

Aporta información general del usuario:

- `age`
- `weight_kg`
- `height_cm`
- `blood_type`
- `role`

No se utilizarán como características:

- `full_name`
- `email`
- `password_hash`
- `phone`

Estos campos contienen información identificable o no son necesarios para los modelos.

### `habit_logs`

Contiene el registro diario de hábitos.

Las variables se interpretarán como:

| Campo actual | Nombre para ML | Unidad |
|---|---|---|
| `water` | `water_glasses` | Vasos de aproximadamente 250 ml |
| `exercise` | `exercise_minutes` | Minutos |
| `sleep` | `sleep_hours` | Horas |
| `nutrition` | `healthy_meals_count` | Comidas saludables |
| `meditation` | `meditation_minutes` | Minutos |
| `log_date` | `log_date` | Fecha del registro |

### `symptom_logs`

Contiene información física y signos registrados por el usuario.

Variables disponibles:

- `pain`
- `temperature`
- `systolic`
- `diastolic`
- `glucose`
- `weight`
- `heart_rate`
- `mood`
- `notes`

Se agregará:

- `log_date`
- `log_time`, cuando sea necesario.

### `emotional_logs`

Entidad recomendada para separar la dimensión emocional de los síntomas físicos.

Campos propuestos:

- `id`
- `user_id`
- `log_date`
- `mood`
- `stress_level`
- `energy_level`
- `sleep_quality`
- `notes`
- `created_at`

## 4. Nombres canónicos para Machine Learning

Aunque Backend conserve temporalmente nombres más cortos, los archivos de Machine Learning utilizarán nombres explícitos:

```text
water_glasses
exercise_minutes
sleep_hours
healthy_meals_count
meditation_minutes
stress_level
energy_level
sleep_quality
log_date
weight_kg

````markdown
Esto permite identificar directamente la unidad y el significado de cada variable.

---

## 5. Tratamiento del peso

Se conservarán dos fuentes de información:

### `users.weight_kg`

Representa el último peso conocido o el peso actual almacenado en el perfil del usuario.

### `symptom_logs.weight`

Representa una medición histórica asociada con una fecha específica.

Para Machine Learning se utilizará preferentemente:

```text
symptom_logs.weight
````

Se seleccionará el registro de peso más cercano a la fecha analizada.

Cuando no exista una medición histórica, se utilizará:

```text
users.weight_kg
```

como valor de respaldo.

El nombre final dentro del dataset será:

```text
weight_kg
```

---

## 6. Fecha de síntomas

El campo:

```text
symptom_logs.log_date
```

representará la fecha real en la que ocurrió o se midió el síntoma.

El campo:

```text
symptom_logs.created_at
```

representará únicamente el momento en el que la información fue almacenada en el sistema.

Para el análisis temporal se utilizará:

```text
log_date
```

---

## 7. Registro de medicamentos

La versión definitiva conservará los siguientes campos:

* `taken_date`
* `taken_time`

No se almacenará adicionalmente el campo:

```text
taken_at
```

Cuando se necesite una marca temporal completa, se podrá construir durante el procesamiento:

```text
taken_at = taken_date + taken_time
```

---

## 8. Variables obligatorias para el primer modelo

Las variables mínimas propuestas son:

* `age`
* `weight_kg`
* `height_cm`
* `sleep_hours`
* `exercise_minutes`
* `mood`
* `heart_rate`
* `pain`

---

## 9. Variables opcionales

Las variables opcionales propuestas son:

* `glucose`
* `temperature`
* `systolic`
* `diastolic`
* `notes`
* `blood_type`
* `medications`
* `medical_history`
* `stress_level`
* `energy_level`
* `sleep_quality`

Las variables emocionales pasarán a formar parte del conjunto principal cuando la entidad `emotional_logs` sea implementada.

---

## 10. Variable derivada

### Índice de masa corporal

El índice de masa corporal se calculará mediante la siguiente fórmula:

```text
bmi = weight_kg / (height_cm / 100)²
```

El IMC será una característica derivada y no reemplazará los datos originales de peso y altura.

---

## 11. Salida preliminar del clasificador

```json
{
  "risk_level": "medium",
  "probability": 0.72,
  "message": "Se detecta baja actividad física y sueño reducido"
}
```

Las clases internas del dataset serán:

* `low`
* `medium`
* `high`

---

## 12. Salida preliminar del recomendador

```json
{
  "type": "habit",
  "title": "Mejora tu descanso",
  "description": "Procura mantener un horario de sueño más regular",
  "priority": "high"
}
```

Las recomendaciones serán generales y preventivas.

> No constituirán diagnósticos ni tratamientos médicos.

---

## 13. Modelos priorizados

### Modelo 1: clasificación de riesgo preventivo

Algoritmos propuestos:

* Regresión Logística.
* Random Forest Classifier.
* XGBoost Classifier, como comparación adicional.

### Modelo 2: recomendador de bienestar

Enfoques propuestos:

* Reglas explicables.
* KNN.
* Filtrado basado en contenido.

### Modelo 3: predicción emocional

Variables propuestas:

* Historial de `mood`.
* `stress_level`.
* `sleep_hours`.
* `sleep_quality`.
* `exercise_minutes`.
* `pain`.
* `energy_level`.

La implementación dependerá de la disponibilidad de registros históricos y de una variable objetivo correctamente definida.

---

## 14. Responsabilidades

### Machine Learning

* Definir el dataset.
* Simular datos.
* Limpiar y preparar los datos.
* Entrenar modelos.
* Evaluar los modelos.
* Serializar artefactos.
* Documentar entradas y salidas.

### Backend

* Aplicar cambios al esquema.
* Crear o actualizar tablas.
* Extraer datos desde MySQL.
* Mapear los campos actuales hacia los nombres canónicos.
* Construir endpoints.
* Consumir los modelos.
* Entregar los resultados al frontend.

---

## 15. Pendientes de implementación de Backend

* Renombrar o mapear las columnas de `habit_logs`.
* Crear `emotional_logs`.
* Agregar `stress_level`.
* Agregar `energy_level`.
* Agregar `sleep_quality`.
* Agregar `log_date` a `symptom_logs`.
* Definir si se utilizará `log_time`.
* Confirmar que los cambios estén disponibles en la rama de Backend.

---

## 16. Conclusión

La información proporcionada permite comenzar la simulación y preparación del dataset utilizando nombres canónicos.

La integración con datos reales deberá esperar hasta que las modificaciones del esquema se encuentren implementadas y verificadas.

```
```
