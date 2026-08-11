# Diccionario de datos de VitalMind AI

## Responsable

**Michelle Castro Otero**  
Responsable de Inteligencia Artificial y Machine Learning.

## Estado del documento

> Documento alineado con la estructura y las definiciones proporcionadas por el equipo de Backend.

Algunos campos ya existen físicamente en MySQL y otros forman parte del esquema objetivo que Backend deberá implementar antes de integrar los modelos con datos reales.

---

## 1. Objetivo

Definir las variables que se utilizarán durante la simulación, preparación, análisis, entrenamiento y evaluación de los modelos de Machine Learning de VitalMind AI.

Este documento establece:

- Nombre canónico de cada variable.
- Tabla de origen.
- Tipo de dato.
- Unidad.
- Rango esperado.
- Regla de validación.
- Uso dentro de Machine Learning.
- Estado actual de implementación.

---

## 2. Consideraciones generales

- La fuente principal de datos será MySQL.
- Los nombres del dataset de Machine Learning serán explícitos y descriptivos.
- Backend podrá mapear los nombres actuales de las columnas hacia los nombres canónicos definidos en este documento.
- Los datos utilizados para entrenamiento deberán ser anónimos o simulados.
- Las variables no deberán interpretarse como información diagnóstica.
- Los resultados serán preventivos e informativos.
- No se utilizarán datos que permitan identificar directamente al usuario.
- Los rangos podrán ajustarse después del análisis exploratorio.
- Las variables derivadas deberán calcularse mediante scripts reproducibles.
- El dataset tendrá una granularidad inicial de un registro diario por usuario.

---

## 3. Convención de nombres

Los nombres utilizados en Machine Learning deberán indicar directamente el significado o la unidad de la variable.

| Campo actual en Backend | Nombre canónico para ML |
|---|---|
| `habit_logs.water` | `water_glasses` |
| `habit_logs.exercise` | `exercise_minutes` |
| `habit_logs.sleep` | `sleep_hours` |
| `habit_logs.nutrition` | `healthy_meals_count` |
| `habit_logs.meditation` | `meditation_minutes` |
| `symptom_logs.weight` | `weight_kg` |
| `symptom_logs.log_date` | `log_date` |
| `emotional_logs.energy_level` | `energy_level` |

---

# 4. Variables de identificación técnica

Estas variables se utilizarán para organizar y relacionar los registros, pero no necesariamente como características predictoras.

| Variable | Origen | Tipo | Descripción | Regla de validación | Uso en ML |
|---|---|---|---|---|---|
| `record_id` | Dataset de ML | Cadena | Identificador anónimo único del registro analítico | Único, no vacío y sin información personal | Trazabilidad |
| `user_id` | Tablas de Backend | Entero o cadena anonimizada | Identificador técnico del usuario | No debe contener nombre, correo u otro dato personal | Agrupación por usuario |
| `log_date` | `habit_logs`, `symptom_logs` y `emotional_logs` | Fecha | Fecha real a la que pertenece el registro | Formato `YYYY-MM-DD` | Análisis temporal |
| `log_time` | `symptom_logs` o `emotional_logs` | Hora | Hora aproximada del registro, cuando esté disponible | Formato `HH:MM:SS` | Análisis temporal opcional |
| `created_at` | Tablas de Backend | Fecha y hora | Momento en que el registro fue almacenado en el sistema | Formato consistente de fecha y hora | Auditoría, no característica |

## Consideración temporal

`log_date` representará la fecha real del evento o medición.

`created_at` representará únicamente el momento en que la información fue guardada en el sistema.

Para el entrenamiento de modelos y el análisis histórico se utilizará preferentemente `log_date`.

---

# 5. Variables del perfil del usuario

## Tabla de origen

```text
users
```
| Variable | Tipo | Unidad o categoría | Rango o valores | Descripción | Uso en ML | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| age | Entero | Años | 18 a 80 | Edad del usuario | Característica | Existente |
| weight_profile_kg | Decimal | Kilogramos | 30 a 250 | Último peso conocido en el perfil | Valor de respaldo | Existente |
| height_cm | Decimal | Centímetros | 120 a 230 | Altura registrada en el perfil | Característica | Existente |
| blood_type | Categórica | Grupo sanguíneo | Catálogo válido | Grupo sanguíneo del usuario | No se usará inicialmente | Existente |
| role | Categórica | Rol del sistema | admin, patient, caregiver | Rol dentro de la aplicación | Filtro técnico, no característica inicial | Existente |

### Reglas

age debe ser mayor o igual a 18 para el dataset inicial.
weight_profile_kg solo se utilizará cuando no exista un peso histórico cercano a la fecha analizada.
height_cm deberá ser mayor que cero para calcular el IMC.
role no deberá utilizarse como predictor de riesgo.
blood_type no se utilizará en el primer modelo porque no existe una justificación directa para el objetivo planteado.

## 6. Variables de peso

VitalMind AI conservará dos fuentes diferentes de peso.

| Variable | Origen | Tipo | Unidad | Descripción | Prioridad para ML |
| --- | --- | --- | --- | --- | --- |
| weight_profile_kg | users.weight_kg | Decimal | Kilogramos | Último peso conocido almacenado en el perfil | Respaldo |
| weight_kg | symptom_logs.weight | Decimal | Kilogramos | Peso histórico registrado en una fecha específica | Principal |

### Regla de selección

Para cada registro diario:

- Se buscará el valor de symptom_logs.weight más cercano a log_date.
- Si existe, se utilizará como weight_kg.
- Si no existe, se utilizará users.weight_kg.
- Si ambos valores están ausentes, se aplicará el tratamiento de nulos definido en el proceso de preparación.

## 7. Variables derivadas del perfil

| Variable | Tipo | Unidad | Rango esperado | Descripción | Regla | Uso en ML |
| --- | --- | --- | --- | --- | --- | --- |
| bmi | Decimal | kg/m² | 10 a 70 | Índice de masa corporal calculado | weight_kg / (height_cm / 100)² | Característica derivada |

### Fórmula

```text
bmi = weight_kg / (height_cm / 100)²
```

### Reglas

No calcular el IMC cuando weight_kg o height_cm estén ausentes.
No reemplazar los valores originales de peso y altura.
El IMC será una característica técnica y no se utilizará por sí solo para emitir conclusiones médicas.

## 8. Variables de hábitos diarios

### Tabla de origen

`habit_logs`

| Variable canónica | Campo actual | Tipo | Unidad | Rango inicial | Descripción | Uso en ML | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| water_glasses | water | Decimal | Vasos de 250 ml | 0 a 20 | Vasos de agua consumidos durante el día | Característica | Existente con nombre corto |
| exercise_minutes | exercise | Decimal | Minutos | 0 a 300 | Minutos de actividad física realizados | Característica | Existente con nombre corto |
| sleep_hours | sleep | Decimal | Horas | 0 a 14 | Horas de sueño registradas | Característica | Existente con nombre corto |
| healthy_meals_count | nutrition | Decimal o entero | Comidas saludables | 0 a 5 | Número de comidas saludables realizadas | Característica | Existente con nombre corto |
| meditation_minutes | meditation | Decimal | Minutos | 0 a 180 | Minutos totales de meditación realizados | Característica | Existente con nombre corto |

### Conversión de hidratación

Cada vaso representará aproximadamente:

250 ml

La cantidad aproximada de litros podrá calcularse mediante:

```text
water_liters = water_glasses × 0.25
```

water_liters podrá utilizarse para visualización o análisis, pero water_glasses será la variable original del dataset.

### Reglas

Ningún valor puede ser negativo.
healthy_meals_count deberá contener cantidades completas cuando el formulario no admita fracciones.
sleep_hours no debe superar las 24 horas.
exercise_minutes y meditation_minutes no deben superar los minutos disponibles en un día.
Deberá existir como máximo un registro de hábitos por usuario y fecha.
Backend podrá conservar temporalmente los nombres actuales y mapearlos hacia los nombres canónicos.

## 9. Variables físicas y de síntomas

### Tabla de origen

`symptom_logs`

| Variable | Campo de origen | Tipo | Unidad o categoría | Rango inicial | Descripción | Uso en ML | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| pain | pain | Entero | Escala | 0 a 10 | Nivel de dolor reportado | Característica | Existente |
| temperature_c | temperature | Decimal | Grados Celsius | 34 a 43 | Temperatura corporal registrada | Característica opcional | Existente |
| systolic_mmhg | systolic | Entero | mmHg | 60 a 250 | Presión arterial sistólica | Característica opcional | Existente |
| diastolic_mmhg | diastolic | Entero | mmHg | 30 a 150 | Presión arterial diastólica | Característica opcional | Existente |
| glucose_mg_dl | glucose | Entero | mg/dL | 40 a 600 | Nivel de glucosa registrado | Característica opcional | Existente |
| heart_rate_bpm | heart_rate | Entero | Latidos por minuto | 30 a 220 | Frecuencia cardíaca registrada | Característica | Existente |
| weight_kg | weight | Decimal | Kilogramos | 30 a 250 | Peso histórico medido en una fecha | Característica | Existente |
| physical_notes | notes | Texto | Texto libre | Longitud máxima por definir | Observaciones físicas o de síntomas | Análisis de texto opcional | Existente |
| log_date | Nuevo campo | Fecha | YYYY-MM-DD | Fecha válida | Fecha real del síntoma o medición | Análisis temporal | Pendiente |
| log_time | Nuevo campo opcional | Hora | HH:MM:SS | Hora válida | Hora aproximada del síntoma o medición | Análisis temporal opcional | Pendiente |

### Reglas

pain = 0 representará ausencia de dolor.
Los valores físicos fuera de rangos plausibles deberán marcarse para revisión.
Los campos opcionales podrán contener nulos.
log_date será obligatorio cuando Backend implemente la migración.
created_at no sustituirá a log_date.
Las notas no deberán contener nombres, teléfonos, correos ni otros identificadores directos.

## 10. Variables emocionales

### Tabla de origen propuesta

`emotional_logs`

| Variable | Tipo | Unidad o categoría | Rango o valores | Descripción | Uso en ML | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| mood | Categórica | Estado emocional | Muy bien, Bien, Regular, Mal, Muy mal | Estado de ánimo reportado | Característica | Pendiente de entidad independiente |
| stress_level | Entero | Escala | 1 a 10 | Nivel de estrés percibido | Característica | Pendiente |
| energy_level | Entero | Escala | 1 a 10 | Nivel de energía percibido | Característica | Pendiente |
| sleep_quality | Entero | Escala | 1 a 10 | Calidad percibida del sueño | Característica | Pendiente |
| emotional_notes | Texto | Texto libre | Longitud máxima por definir | Comentario emocional voluntario | Entrada de NLP opcional | Pendiente |
| log_date | Fecha | YYYY-MM-DD | Fecha válida | Fecha del registro emocional | Análisis temporal | Pendiente |
| created_at | Fecha y hora | Marca temporal | Fecha y hora válidas | Momento de almacenamiento | Auditoría | Pendiente |

### Interpretación de escalas

**Estrés**

- `1  = estrés muy bajo`
- `10 = estrés muy alto`
**Energía**

- `1  = energía muy baja`
- `10 = energía muy alta`
**Calidad del sueño**

- `1  = calidad muy baja`
- `10 = calidad excelente`

### Reglas

Los valores deben ser enteros entre 1 y 10.
mood debe pertenecer al catálogo oficial.
El registro emocional deberá mantenerse separado del registro físico.
Las notas emocionales no deberán utilizarse como diagnóstico psicológico.
Mientras emotional_logs no exista físicamente, estas variables solo podrán utilizarse en datos simulados.

## 11. Codificación inicial del estado de ánimo

Para ciertos modelos podrá generarse una representación ordinal auxiliar.

| Estado de ánimo | Código preliminar |
| --- | --- |
| Muy mal | 1 |
| Mal | 2 |
| Regular | 3 |
| Bien | 4 |
| Muy bien | 5 |

### Consideración

La codificación ordinal no deberá aplicarse automáticamente a todos los algoritmos.

Dependiendo del modelo, podrá utilizarse:

- Codificación ordinal.
- One-Hot Encoding.
- Embeddings.
- Representación textual.

- El codificador utilizado deberá guardarse junto con el modelo.

## 12. Variables de medicamentos

### Tablas de origen

`medications`
`medication_logs`

| Variable | Tipo | Unidad o categoría | Descripción | Uso inicial en ML |
| --- | --- | --- | --- | --- |
| medication_id | Entero | Identificador técnico | Medicamento asociado con la dosis | Relación técnica |
| taken_date | Fecha | YYYY-MM-DD | Fecha correspondiente a la dosis | Análisis de adherencia |
| taken_time | Hora | HH:MM:SS | Hora programada o registrada | Análisis de adherencia |
| taken | Booleano | 0 o 1 | Indica si la dosis fue tomada | Característica u objetivo futuro |
| days_duration | Entero | Días | Duración total del tratamiento | Característica opcional |

### Marca temporal derivada

Cuando sea necesario se construirá:

```text
taken_at = taken_date + taken_time
```

taken_at no se almacenará como una tercera columna permanente para evitar duplicidad.

### Alcance inicial

Las variables de medicamentos no formarán parte obligatoria del primer clasificador de riesgo.

Podrán utilizarse posteriormente para:

- Analizar adherencia.
- Detectar omisiones.
- Generar recordatorios.
- Estimar riesgo de incumplimiento.

## 13. Variables opcionales de historial médico

### Tabla de origen

`medical_history_items`

| Variable | Tipo | Descripción | Uso en ML |
| --- | --- | --- | --- |
| medical_history_category | Categórica | Categoría del antecedente | Característica futura |
| medical_history_description | Texto | Descripción del antecedente | Análisis futuro |

### Consideración

El historial médico no se utilizará en la primera versión del modelo hasta contar con:

- Catálogos consistentes.
- Datos suficientes.
- Reglas de anonimización.
- Justificación de uso.
- Revisión ética.

## 14. Variables derivadas de Machine Learning

| Variable | Tipo | Rango | Descripción | Regla preliminar | Uso en ML |
| --- | --- | --- | --- | --- | --- |
| bmi | Decimal | 10 a 70 | Índice de masa corporal | Peso dividido entre altura al cuadrado | Característica |
| water_liters | Decimal | 0 a 5 | Consumo aproximado en litros | water_glasses × 0.25 | Característica opcional |
| sleep_score | Decimal | 0 a 100 | Puntaje de sueño | Basado en horas y calidad del sueño | Característica derivada |
| activity_score | Decimal | 0 a 100 | Puntaje de actividad | Basado en ejercicio realizado | Característica derivada |
| nutrition_score | Decimal | 0 a 100 | Puntaje de alimentación e hidratación | Basado en comidas saludables y agua | Característica derivada |
| emotional_score | Decimal | 0 a 100 | Puntaje emocional | Basado en ánimo, estrés y energía | Característica derivada |
| wellbeing_score | Decimal | 0 a 100 | Puntaje general de bienestar | Combinación ponderada de dimensiones | Objetivo de regresión |
| risk_level | Categórica | low, medium, high | Nivel preventivo de riesgo | Regla de etiquetado documentada | Objetivo de clasificación |
| is_anomaly | Booleano | Verdadero o falso | Indica si el registro es atípico | Determinado por el modelo | Resultado |
| anomaly_score | Decimal | Dependiente del modelo | Puntaje de comportamiento atípico | Determinado por el detector | Resultado |
| emotional_prediction | Categórica | Categorías por definir | Estado emocional estimado | Determinado por el modelo | Resultado futuro |
| stress_probability | Decimal | 0 a 1 | Probabilidad estimada de estrés elevado | Modelo emocional futuro | Resultado futuro |

## 15. Variables del primer clasificador de riesgo

### Variables obligatorias

| Variable | Razón |
| --- | --- |
| age | Factor demográfico |
| weight_kg | Medición física y cálculo de IMC |
| height_cm | Cálculo de IMC |
| bmi | Característica derivada |
| sleep_hours | Recuperación y descanso |
| exercise_minutes | Nivel de actividad física |
| mood | Estado emocional |
| heart_rate_bpm | Indicador físico |
| pain | Intensidad de síntomas |

### Variables complementarias

| Variable | Condición |
| --- | --- |
| water_glasses | Disponible en habit_logs |
| healthy_meals_count | Disponible en habit_logs |
| meditation_minutes | Disponible en habit_logs |
| temperature_c | Puede contener nulos |
| systolic_mmhg | Puede contener nulos |
| diastolic_mmhg | Puede contener nulos |
| glucose_mg_dl | Puede contener nulos |
| stress_level | Se utilizará cuando exista emotional_logs |
| energy_level | Se utilizará cuando exista emotional_logs |
| sleep_quality | Se utilizará cuando exista emotional_logs |

## 16. Variables objetivo

### 16.1 Clasificación de riesgo

- `risk_level`

### Clases internas

- `low`
- `medium`
- `high`

### Representación para la interfaz

| Valor interno | Texto mostrado |
| --- | --- |
| low | Bajo |
| medium | Medio |
| high | Alto |

La etiqueta deberá generarse mediante una regla documentada que combine diferentes variables.

No deberá depender exclusivamente de wellbeing_score.

### 16.2 Regresión del bienestar

- `wellbeing_score`

### Rango

0 a 100

El puntaje se generará mediante una combinación ponderada de:

- Sueño.
- Actividad física.
- Hidratación y alimentación.
- Estado emocional.
- Síntomas.
- Consistencia de hábitos.

- Se agregará variación controlada para evitar una relación perfecta entre las entradas y la salida.

### 16.3 Detección de anomalías

- `is_anomaly`
- `anomaly_score`

Estos campos representarán:

- Cambio abrupto en la rutina.
- Valor atípico respecto al comportamiento histórico.
- Combinación poco común de variables.

- is_anomaly podrá utilizarse como etiqueta de evaluación en datos simulados, pero el modelo no supervisado no deberá utilizarla durante el entrenamiento.

### 16.4 Predicción emocional

### Variables objetivo futuras

- `emotional_prediction`
- `stress_probability`

La predicción emocional dependerá de la implementación de emotional_logs y de la existencia de suficientes registros históricos.

No se utilizará la palabra “diagnóstico”.

## 17. Variables excluidas de la primera versión

Las siguientes variables no formarán parte del dataset inicial porque no existe actualmente una fuente definida o aprobada:

- `gender`
- `steps`
- `sedentary_minutes`
- `activity_intensity`
- `sleep_interruptions`
- `bedtime_consistency`
- `meals_count`
- `healthy_meals_percentage`
- `meal_schedule_consistency`
- `anxiety_level`
- `symptom_type`
- `symptom_duration_minutes`
- `symptom_frequency_week`
- `has_persistent_symptoms`
- `habits_completed`
- `habits_planned`
- `habit_adherence_percentage`
- `consecutive_days`
- `daily_sessions`
- `app_usage_minutes`
- `chatbot_interactions`
- `days_since_last_access`
- `notifications_opened_percentage`

Estas variables podrán agregarse posteriormente si:

- Backend crea una fuente real para almacenarlas.
- Se define su unidad.
- Se documenta su rango.
- Se justifica su utilidad.
- Se dispone de datos suficientes.

## 18. Datos que no deben utilizarse como características

Los siguientes campos no deberán incluirse como entradas de los modelos:

- `full_name`
- `email`
- `phone`
- `password_hash`
- Tokens de autenticación.
- Dirección.
- CURP.
- Credenciales.
- Identificadores externos.
- Contenido de auditoría.
- Información que permita identificar directamente a una persona.

### Identificadores técnicos

user_id y record_id podrán conservarse para trazabilidad, agrupación y análisis temporal, pero no deberán utilizarse como características predictoras.

## 19. Reglas generales de validación

### Identificadores

record_id debe ser único.
user_id no debe contener información personal.
No deben existir registros sin identificador técnico.

### Fechas

Las fechas deben utilizar el formato YYYY-MM-DD.
log_date no debe sustituirse por created_at.
No deben existir fechas inválidas.
Las fechas futuras deberán marcarse para revisión.

### Valores numéricos

No se permiten cantidades negativas.
Los valores deben permanecer dentro de los rangos definidos.
Los valores fuera de rango deberán corregirse, marcarse como nulos o excluirse mediante una regla documentada.
No deben modificarse manualmente los datos para mejorar las métricas.

### Categorías

mood debe pertenecer al catálogo autorizado.
risk_level solo puede contener low, medium o high.
Las categorías deben utilizar una escritura consistente.
Los codificadores deben guardarse junto con los modelos.

### Valores faltantes

Los campos opcionales podrán contener valores nulos.
Los valores faltantes deberán tratarse mediante un proceso reproducible.
No se deberá imputar utilizando información del conjunto de prueba.
Los identificadores y variables objetivo no deberán contener valores faltantes.

### Variables derivadas

Deberán calcularse mediante scripts.
No deberán editarse manualmente.
Las fórmulas utilizadas deberán quedar documentadas.
Deberán recalcularse cuando cambien las variables originales.

## 20. Mapeo preliminar de Backend al dataset de ML

| Tabla | Campo Backend | Variable ML |
| --- | --- | --- |
| users | age | age |
| users | weight_kg | weight_profile_kg |
| users | height_cm | height_cm |
| habit_logs | log_date | log_date |
| habit_logs | water | water_glasses |
| habit_logs | exercise | exercise_minutes |
| habit_logs | sleep | sleep_hours |
| habit_logs | nutrition | healthy_meals_count |
| habit_logs | meditation | meditation_minutes |
| symptom_logs | pain | pain |
| symptom_logs | temperature | temperature_c |
| symptom_logs | systolic | systolic_mmhg |
| symptom_logs | diastolic | diastolic_mmhg |
| symptom_logs | glucose | glucose_mg_dl |
| symptom_logs | weight | weight_kg |
| symptom_logs | heart_rate | heart_rate_bpm |
| symptom_logs | notes | physical_notes |
| symptom_logs | Nuevo log_date | log_date |
| emotional_logs | mood | mood |
| emotional_logs | stress_level | stress_level |
| emotional_logs | energy_level | energy_level |
| emotional_logs | sleep_quality | sleep_quality |
| emotional_logs | notes | emotional_notes |
| medication_logs | taken_date | taken_date |
| medication_logs | taken_time | taken_time |
| medication_logs | taken | taken |

## 21. Campos pendientes de implementación en Backend

Antes de consumir datos reales deberán estar disponibles o formalmente mapeados:

- Tabla emotional_logs.
- `emotional_logs.mood.`
- `emotional_logs.stress_level.`
- `emotional_logs.energy_level.`
- `emotional_logs.sleep_quality.`
- `emotional_logs.log_date.`
- `symptom_logs.log_date.`
- symptom_logs.log_time, cuando se decida utilizar.
- Mapeo de water a water_glasses.
- Mapeo de exercise a exercise_minutes.
- Mapeo de sleep a sleep_hours.
- Mapeo de nutrition a healthy_meals_count.
- Mapeo de meditation a meditation_minutes.

## 22. Estado de las variables

| Estado | Significado |
| --- | --- |
| Existente | El campo ya se encuentra en el esquema actual |
| Existente con nombre corto | El campo existe, pero ML utilizará un nombre canónico |
| Pendiente | Backend deberá agregarlo |
| Derivada | Se calculará durante el procesamiento |
| Resultado | Será producido por un modelo |
| Futura | No se incluirá en la primera versión |

## 23. Conclusión

El dataset inicial de VitalMind AI se construirá principalmente a partir de:

- `users`
- `habit_logs`
- `symptom_logs`
emotional_logs, cuando sea implementada

- Los nombres canónicos permitirán separar el diseño del dataset de los nombres temporales utilizados en la base de datos.

- La primera versión priorizará variables disponibles, interpretables y relacionadas directamente con los objetivos del proyecto.

- Los campos que aún no existan podrán simularse para el entrenamiento inicial, pero no se considerarán disponibles para integración real hasta que Backend complete y confirme las modificaciones correspondientes.
