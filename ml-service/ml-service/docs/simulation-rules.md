# Reglas de simulación del dataset de VitalMind AI

## Responsable

**Michelle Castro Otero**  
Responsable de Inteligencia Artificial y Machine Learning.

## Estado del documento

> Documento alineado con el esquema MySQL actual, el diccionario de datos y las definiciones proporcionadas por el equipo de Backend.

Algunos campos, como `stress_level`, `energy_level`, `sleep_quality`, `emotional_logs` y `symptom_logs.log_date`, todavía deberán ser implementados por Backend antes de utilizar datos reales.

---

## 1. Objetivo

Definir las reglas para generar un dataset sintético, coherente y reproducible que permita desarrollar, entrenar y evaluar los modelos de Machine Learning de VitalMind AI.

La simulación deberá representar relaciones razonables entre:

- Hábitos diarios.
- Estado emocional.
- Síntomas.
- Signos físicos.
- Características del perfil.
- Bienestar general.
- Nivel preventivo de riesgo.
- Cambios atípicos en la rutina.

El dataset no deberá generarse mediante aleatoriedad completamente independiente.

---

## 2. Propósito del dataset

El dataset sintético se utilizará para:

- Entrenar el clasificador del semáforo de riesgo.
- Comparar algoritmos de clasificación.
- Estimar un puntaje general de bienestar.
- Desarrollar un recomendador de hábitos.
- Detectar cambios atípicos en la rutina.
- Analizar relaciones entre hábitos, emociones y síntomas.
- Preparar el análisis exploratorio de datos.
- Probar procesos de limpieza y transformación.
- Preparar conjuntos de entrenamiento, validación y prueba.
- Crear pruebas locales de inferencia.
- Documentar las entradas y salidas esperadas por Backend.

---

## 3. Fuente conceptual de las variables

El dataset simulado representará información proveniente de las siguientes entidades:

- `users`
- `habit_logs`
- `symptom_logs`
- `emotional_logs`

También podrán utilizarse, en mecanismos posteriores:

- `medications`
- `medication_logs`
- `medical_history_items`

La primera versión del dataset se concentrará principalmente en perfil, hábitos, síntomas y emociones.

---

## 4. Cantidad inicial de registros

Se propone generar inicialmente:

```text
5000 registros diarios
```

Esta cantidad permitirá:

Realizar análisis exploratorio.
Comparar diferentes algoritmos.
Separar conjuntos de entrenamiento, validación y prueba.
Generar casos normales, extremos y anómalos.
Evaluar el comportamiento inicial de los modelos.

La cantidad podrá incrementarse posteriormente.

## 5. Cantidad de usuarios

Se propone simular:

250 usuarios anónimos

Cada usuario tendrá varios registros distribuidos a lo largo del periodo simulado.

Los identificadores deberán tener un formato anónimo, por ejemplo:

USR_0001
USR_0002
USR_0003

> Los identificadores no deberán contener nombres, correos ni datos personales.

## 6. Unidad de observación

Cada fila representará:

Un registro diario de bienestar por usuario.

La clave lógica del registro será:

user_id + log_date

Cada usuario podrá aparecer en diferentes fechas para permitir:

Análisis temporal.
Detección de tendencias.
Identificación de anomalías.
Comparación con su comportamiento habitual.
## 7. Periodo simulado

Se propone generar información correspondiente a:

90 días

Las fechas deberán distribuirse dentro de un periodo continuo.

Ejemplo:

2026-04-01 a 2026-06-29

El periodo definitivo podrá modificarse posteriormente.

## 8. Semilla de reproducibilidad

La generación deberá utilizar una semilla fija.

```python
import numpy as np

np.random.seed(2026)

```

Cuando se utilice el módulo random:

```python
import random

random.seed(2026)

```

La semilla permitirá generar el mismo dataset cuando se ejecute nuevamente el script bajo las mismas condiciones.

## 9. Nombres canónicos de Machine Learning

El dataset utilizará nombres explícitos, aunque Backend mantenga temporalmente nombres diferentes en MySQL.

| Campo actual de Backend | Nombre canónico para ML |
| --- | --- |
| habit_logs.water | water_glasses |
| habit_logs.exercise | exercise_minutes |
| habit_logs.sleep | sleep_hours |
| habit_logs.nutrition | healthy_meals_count |
| habit_logs.meditation | meditation_minutes |
| symptom_logs.temperature | temperature_c |
| symptom_logs.systolic | systolic_mmhg |
| symptom_logs.diastolic | diastolic_mmhg |
| symptom_logs.glucose | glucose_mg_dl |
| symptom_logs.heart_rate | heart_rate_bpm |
| symptom_logs.weight | weight_kg |
| Nuevo campo de síntomas | log_date |

## 10. Variables iniciales del dataset

### 10.1 Identificación técnica

- `record_id`
- `user_id`
- `log_date`
### 10.2 Perfil

- `age`
- `weight_profile_kg`
- `weight_kg`
- `height_cm`
- `bmi`
### 10.3 Hábitos

- `water_glasses`
- `exercise_minutes`
- `sleep_hours`
- `healthy_meals_count`
- `meditation_minutes`
### 10.4 Síntomas y signos físicos

- `pain`
- `temperature_c`
- `systolic_mmhg`
- `diastolic_mmhg`
- `glucose_mg_dl`
- `heart_rate_bpm`
### 10.5 Estado emocional

- `mood`
- `stress_level`
- `energy_level`
- `sleep_quality`
### 10.6 Variables derivadas

- `water_liters`
- `sleep_score`
- `activity_score`
- `nutrition_score`
- `emotional_score`
- `physical_condition_score`
- `wellbeing_score`
- `risk_level`
- `is_anomaly`
## 11. Variables excluidas de la primera versión

No se incluirán inicialmente las siguientes variables porque no existe una fuente definida o aprobada en Backend:

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

Estas variables podrán agregarse posteriormente cuando exista una fuente real y documentada.

## 12. Rangos de simulación

### 12.1 Edad

18 a 80 años

Distribución sugerida:

Mayor concentración entre 18 y 45 años.
Menor proporción entre 46 y 65 años.
Proporción reducida entre 66 y 80 años.

La edad será constante para todos los registros del mismo usuario.

### 12.2 Altura

140 a 200 cm

La altura será constante para todos los registros del mismo usuario.

### 12.3 Peso del perfil

40 a 180 kg

weight_profile_kg representará el último peso conocido almacenado en el perfil.

Será relativamente estable, aunque podrá actualizarse ocasionalmente.

### 12.4 Peso histórico

40 a 180 kg

weight_kg representará el peso registrado en una fecha determinada.

Deberá variar gradualmente.

No deberán generarse cambios extremos de un día a otro, excepto en casos anómalos controlados.

Variación diaria normal sugerida:

-0.5 a +0.5 kg
### 12.5 Índice de masa corporal

Se calculará mediante:

```text
bmi = weight_kg / (height_cm / 100)²
```

Rango plausible esperado:

12 a 60

Los valores fuera de este rango deberán marcarse para revisión.

### 12.6 Vasos de agua

0 a 16 vasos por día

Cada vaso representará aproximadamente:

250 ml

La mayor concentración deberá encontrarse entre:

4 y 10 vasos
### 12.7 Litros de agua

Se calculará mediante:

```text
water_liters = water_glasses × 0.25
```

Rango esperado:

0 a 4 litros
### 12.8 Actividad física

0 a 180 minutos por día

La mayor parte de los registros deberá concentrarse entre:

0 y 60 minutos

Se deberán generar algunos usuarios con:

Baja actividad.
Actividad moderada.
Actividad alta.
### 12.9 Horas de sueño

3 a 10 horas por día

La mayor concentración deberá encontrarse entre:

6 y 8 horas

Se incluirán pocos casos extremos entre 0 y 3 horas o entre 10 y 14 horas para pruebas de validación.

### 12.10 Comidas saludables

0 a 5 comidas saludables por día

La mayor concentración deberá ubicarse entre:

1 y 4 comidas

Los valores deberán ser enteros.

### 12.11 Minutos de meditación

0 a 120 minutos por día

La mayoría de los usuarios deberá registrar:

0 a 30 minutos

Se permitirá que muchos registros tengan valor 0.

### 12.12 Dolor

0 a 10

Interpretación:

| Valor | Interpretación |
| --- | --- |
| 0 | Sin dolor |
| 1 a 3 | Dolor leve |
| 4 a 6 | Dolor moderado |
| 7 a 10 | Dolor intenso |

### 12.13 Temperatura corporal

### 35.0 a 42.0 °C

La mayoría de los registros deberá encontrarse entre:

### 36.0 y 37.5 °C

Los valores superiores deberán ser poco frecuentes.

### 12.14 Presión sistólica

80 a 220 mmHg

La mayoría de los registros deberá concentrarse entre:

100 y 140 mmHg
### 12.15 Presión diastólica

50 a 130 mmHg

La mayoría de los registros deberá concentrarse entre:

60 y 90 mmHg

Debe cumplirse normalmente:

```text
systolic_mmhg > diastolic_mmhg
```

### 12.16 Glucosa

50 a 350 mg/dL

La mayoría de los registros deberá encontrarse entre:

70 y 140 mg/dL

La simulación no deberá interpretar por sí sola estos valores como diagnóstico.

### 12.17 Frecuencia cardiaca

40 a 200 latidos por minuto

La mayoría de los registros deberá encontrarse entre:

60 y 100 latidos por minuto
### 12.18 Estado de ánimo

Valores permitidos:

Muy bien
Bien
Regular
Mal
Muy mal

Distribución inicial sugerida:

| Estado | Porcentaje aproximado |
| --- | --- |
| Muy bien | 15 % |
| Bien | 30 % |
| Regular | 30 % |
| Mal | 18 % |
| Muy mal | 7 % |

La distribución final dependerá de las demás variables.

### 12.19 Nivel de estrés

1 a 10

Interpretación:

| Rango | Nivel |
| --- | --- |
| 1 a 3 | Bajo |
| 4 a 6 | Moderado |
| 7 a 8 | Alto |
| 9 a 10 | Muy alto |

### 12.20 Nivel de energía

1 a 10

Interpretación:

| Rango | Nivel |
| --- | --- |
| 1 a 3 | Bajo |
| 4 a 6 | Moderado |
| 7 a 8 | Alto |
| 9 a 10 | Muy alto |

### 12.21 Calidad del sueño

1 a 10

Interpretación:

| Rango | Calidad |
| --- | --- |
| 1 a 3 | Mala |
| 4 a 6 | Regular |
| 7 a 8 | Buena |
| 9 a 10 | Excelente |

## 13. Perfiles base de usuario

Para evitar aleatoriedad total, cada usuario deberá recibir un perfil base.

Ejemplos:

Perfil saludable
Sueño entre 7 y 9 horas.
Actividad física moderada.
Hidratación adecuada.
Estrés bajo o moderado.
Energía alta.
Estado de ánimo positivo.
Síntomas poco frecuentes.
Perfil irregular
Sueño variable.
Actividad física inconsistente.
Hidratación moderada.
Estrés cambiante.
Estado de ánimo regular.
Síntomas ocasionales.
Perfil de hábitos deficientes
Sueño bajo.
Actividad física baja.
Hidratación insuficiente.
Estrés elevado.
Energía baja.
Estado de ánimo negativo.
Mayor presencia de síntomas.
Perfil físicamente vulnerable
Mayor frecuencia de signos físicos fuera de rangos habituales.
Dolor moderado o alto.
Frecuencia cardiaca más variable.
Menor puntaje de condición física.

El perfil base deberá influir en los registros diarios sin hacerlos idénticos.

## 14. Relaciones entre variables

La simulación no deberá generar las variables de manera independiente.

Regla 1: sueño y calidad del sueño

Cuando sleep_hours esté entre 7 y 9:

sleep_quality deberá tender a aumentar.
energy_level deberá tender a aumentar.
stress_level deberá tender a disminuir.
sleep_score deberá aumentar.

Cuando sleep_hours sea menor a 5:

sleep_quality deberá tender a disminuir.
energy_level deberá tender a disminuir.
stress_level deberá tender a aumentar.
wellbeing_score deberá reducirse.
Regla 2: ejercicio y bienestar

Cuando exercise_minutes aumente dentro de rangos moderados:

activity_score deberá aumentar.
mood podrá mejorar.
stress_level podrá disminuir.
energy_level podrá aumentar.
wellbeing_score podrá mejorar.

Una cantidad excesiva de ejercicio no deberá producir automáticamente un bienestar máximo.

Regla 3: hidratación

Cuando water_glasses sea menor a 4:

nutrition_score deberá disminuir.
energy_level podrá disminuir.
pain podrá aumentar ligeramente.
wellbeing_score podrá reducirse.

Cuando water_glasses se encuentre entre 6 y 10:

nutrition_score deberá tender a aumentar.
Regla 4: comidas saludables

Cuando healthy_meals_count sea alto:

nutrition_score deberá aumentar.
energy_level podrá mejorar.
wellbeing_score podrá aumentar.

Cuando sea igual a 0:

nutrition_score deberá disminuir significativamente.
Regla 5: meditación y estrés

Cuando meditation_minutes sea mayor a 10:

stress_level podrá disminuir.
emotional_score podrá aumentar.
mood podrá mejorar.

La relación deberá ser moderada y no perfecta.

Regla 6: estrés y estado de ánimo

Cuando stress_level aumente:

mood deberá tender hacia Regular, Mal o Muy mal.
sleep_quality deberá tender a disminuir.
energy_level podrá disminuir.
emotional_score deberá reducirse.
Regla 7: energía y sueño

Cuando sleep_hours y sleep_quality sean altos:

energy_level deberá tender a ser alto.

Cuando ambos sean bajos:

energy_level deberá tender a ser bajo.
Regla 8: dolor y estado emocional

Cuando pain sea alto:

mood podrá empeorar.
stress_level podrá aumentar.
physical_condition_score deberá reducirse.
risk_level podrá aumentar.
Regla 9: signos físicos

Cuando se presenten combinaciones poco favorables de:

Temperatura elevada.
Frecuencia cardiaca alta.
Presión arterial fuera del rango habitual.
Glucosa fuera del rango habitual.
Dolor alto.

Entonces:

physical_condition_score deberá disminuir.
El nivel preventivo de riesgo podrá aumentar.
Regla 10: peso e IMC

weight_kg y height_cm deberán determinar bmi.

> El IMC no deberá utilizarse como único factor para generar risk_level.

Regla 11: variación temporal

Los registros consecutivos del mismo usuario deberán guardar cierta continuidad.

Ejemplos:

El peso no debe cambiar bruscamente.
El estado de ánimo puede cambiar gradualmente.
El estrés puede aumentar durante varios días.
Las horas de sueño pueden presentar tendencias.
La actividad física puede reducirse durante periodos específicos.
## 15. Puntajes normalizados

Todos los puntajes derivados deberán permanecer entre:

0 y 100

Se utilizarán para facilitar el análisis y la generación inicial de etiquetas.

## 16. Puntaje de sueño

El sleep_score deberá considerar:

Horas de sueño.
Calidad del sueño.

Propuesta inicial:

```text
sleep_score =
```

60 % puntaje normalizado de sleep_hours
+ 40 % puntaje normalizado de sleep_quality

Las horas cercanas a 8 deberán recibir un puntaje mayor.

Dormir más horas no deberá aumentar indefinidamente el puntaje.

Ejemplo conceptual:

```text
8 horas  → puntaje alto
```

```text
5 horas  → puntaje bajo
```

```text
12 horas → puntaje reducido por exceso
```

## 17. Puntaje de actividad

El activity_score deberá basarse principalmente en exercise_minutes.

Propuesta inicial:

```text
activity_score =
```

```text
100 × min(exercise_minutes / 60, 1)
```

Se podrá agregar una reducción moderada cuando el ejercicio diario sea excesivamente alto.

## 18. Puntaje de nutrición e hidratación

Propuesta inicial:

```text
nutrition_score =
```

55 % puntaje de water_glasses
+ 45 % puntaje de healthy_meals_count

Valores de referencia:

```text
8 vasos de agua       → hidratación de referencia
```

```text
3 comidas saludables → alimentación de referencia
```

> No deberán interpretarse como recomendaciones médicas universales.

## 19. Puntaje emocional

Propuesta inicial:

```text
emotional_score =
```

30 % mood_score
+ 25 % energy_score
+ 25 % inverse_stress_score
+ 20 % sleep_quality_score

Donde:

```text
inverse_stress_score = 100 - stress_score
```

Codificación preliminar del estado de ánimo:

| Mood | Puntaje |
| --- | --- |
| Muy mal | 10 |
| Mal | 30 |
| Regular | 50 |
| Bien | 75 |
| Muy bien | 95 |

## 20. Puntaje de condición física

El physical_condition_score deberá considerar:

Dolor.
Temperatura.
Frecuencia cardiaca.
Presión sistólica.
Presión diastólica.
Glucosa.

Propuesta inicial:

```text
physical_condition_score =
```

30 % inverse_pain_score
+ 20 % temperature_score
+ 20 % heart_rate_score
+ 20 % blood_pressure_score
+ 10 % glucose_score

Cuando una variable opcional esté ausente, el puntaje deberá recalcularse utilizando únicamente las variables disponibles.

## 21. Puntaje general de bienestar

El wellbeing_score deberá calcularse inicialmente mediante:

```text
wellbeing_score =
```

25 % sleep_score
+ 20 % activity_score
+ 15 % nutrition_score
+ 25 % emotional_score
+ 15 % physical_condition_score

El resultado deberá permanecer entre:

0 y 100

Se deberá agregar una variación aleatoria controlada, por ejemplo:

-5 a +5 puntos

Esto evitará una relación perfecta entre variables y objetivo.

## 22. Regla inicial del nivel de riesgo

La variable objetivo será:

- `risk_level`

Clases permitidas:

- `low`
- `medium`
- `high`
### 22.1 Riesgo bajo

Condición base:

```text
wellbeing_score >= 70
```

Además, no deberá existir una combinación relevante de factores físicos o emocionales desfavorables.

### 22.2 Riesgo medio

Condición base:

wellbeing_score entre 45 y 69.99

También podrá asignarse cuando exista una combinación moderada de factores como:

Sueño insuficiente.
Estrés alto.
Estado de ánimo negativo.
Actividad física baja.
Dolor moderado.
Frecuencia cardiaca fuera del rango habitual.
### 22.3 Riesgo alto

Condición base:

```text
wellbeing_score < 45
```

También podrá asignarse cuando exista una combinación de varios factores como:

Sueño menor a 5 horas.
Estrés igual o superior a 8.
Energía igual o inferior a 3.
Estado de ánimo Mal o Muy mal.
Dolor igual o superior a 7.
Temperatura elevada.
Frecuencia cardiaca considerablemente fuera del rango habitual.
Presión arterial fuera de rangos plausibles.
Deterioro continuo durante varios días.
## 23. Factores adicionales de riesgo

Se podrá calcular una cantidad de factores desfavorables.

Ejemplo:

- `risk_factors_count`

Factores posibles:

```text
sleep_hours < 5
```

```text
exercise_minutes < 10
```

```text
water_glasses < 4
```

```text
healthy_meals_count = 0
```

```text
stress_level >= 8
```

```text
energy_level <= 3
```

```text
sleep_quality <= 3
```

```text
pain >= 7
```

```text
heart_rate_bpm < 45
```

```text
heart_rate_bpm > 130
```

```text
temperature_c >= 38
```

```text
mood = Mal
```

```text
mood = Muy mal
```

> La etiqueta no deberá depender únicamente de esta cantidad.

## 24. Evitar etiquetas perfectas

risk_level no deberá ser una traducción directa de wellbeing_score.

Se incorporarán:

Ruido limitado.
Casos frontera.
Combinaciones de variables.
Usuarios con buenos hábitos y síntomas físicos.
Usuarios con hábitos deficientes, pero sin síntomas.
Registros con puntajes similares y clases diferentes.
Variación temporal.
Factores adicionales de riesgo.
Cambios graduales.

Se podrá aplicar una probabilidad controlada de ajuste de clase en casos cercanos a los umbrales.

Ejemplo:

5 % a 10 % de los casos frontera
## 25. Distribución inicial de clases

Se propone una distribución aproximada:

| Nivel de riesgo | Porcentaje aproximado |
| --- | --- |
| low | 50 % |
| medium | 35 % |
| high | 15 % |

La distribución no deberá forzarse de manera exacta.

Después de generar el dataset se deberá revisar:

Cantidad de registros por clase.
Porcentaje por clase.
Relación con las variables.
Casos frontera.
Desbalance.
## 26. Valores faltantes

Se propone introducir valores faltantes controlados en:

2 % a 5 % de los registros

Podrán existir nulos en:

- `weight_kg`
- `temperature_c`
- `systolic_mmhg`
- `diastolic_mmhg`
- `glucose_mg_dl`
- `heart_rate_bpm`
- `mood`
- `stress_level`
- `energy_level`
- `sleep_quality`

No deberán existir nulos en:

- `record_id`
- `user_id`
- `log_date`
- `age`
- `height_cm`
- `risk_level`
- `wellbeing_score`

Cuando weight_kg esté ausente, podrá utilizarse:

- `weight_profile_kg`

como respaldo.

## 27. Valores atípicos

Se introducirán valores atípicos controlados en:

1 % a 3 % de los registros

Ejemplos:

Sueño extremadamente bajo.
Actividad física muy alta.
Consumo de agua inusualmente elevado.
Frecuencia cardiaca extrema.
Temperatura elevada.
Presión fuera del comportamiento habitual.
Dolor máximo.
Estrés máximo.
Energía mínima.
Variación poco común del peso.

Los valores atípicos deberán permanecer dentro de límites técnicamente posibles o ser marcados como errores de calidad.

## 28. Anomalías temporales

Las anomalías deberán representar cambios respecto al comportamiento histórico del mismo usuario.

Ejemplos:

Caída repentina de las horas de sueño.
Incremento abrupto del estrés.
Reducción importante del ejercicio.
Disminución repentina de la hidratación.
Aumento inusual del dolor.
Cambio abrupto del estado de ánimo.
Frecuencia cardiaca diferente al patrón habitual.
Deterioro de varios indicadores durante días consecutivos.

La variable:

- `is_anomaly`

se utilizará únicamente para evaluar los datos sintéticos.

> No deberá utilizarse como característica durante el entrenamiento no supervisado.

## 29. Proporción de anomalías

Se propone marcar como anomalías sintéticas aproximadamente:

2 % a 5 % de los registros

La proporción deberá ajustarse después de revisar el comportamiento del detector.

## 30. Casos normales

La mayoría de los registros deberá representar condiciones comunes.

Ejemplo:

Sueño entre 6 y 8 horas.
Ejercicio entre 10 y 60 minutos.
Agua entre 4 y 10 vasos.
Entre 1 y 4 comidas saludables.
Estrés entre 3 y 7.
Energía entre 4 y 8.
Calidad del sueño entre 4 y 8.
Dolor entre 0 y 3.
Frecuencia cardiaca entre 60 y 100.
Estado de ánimo Regular, Bien o Muy bien.
## 31. Casos frontera

Se deberán generar registros cercanos a los umbrales.

Ejemplos:

wellbeing_score cercano a 45.
wellbeing_score cercano a 70.
Sueño de aproximadamente 5 horas.
Estrés de 7 u 8.
Dolor de 6 o 7.
Buen estado emocional con signos físicos desfavorables.
Mal estado emocional con hábitos favorables.

Los casos frontera serán importantes para evaluar la generalización.

## 32. Casos extremos

Se incluirán pocos registros como:

Sueño menor a 4 horas.
Estrés igual a 10.
Energía igual a 1.
Calidad del sueño igual a 1.
Actividad física igual a 0.
Agua igual a 0.
Comidas saludables igual a 0.
Dolor igual a 10.
Temperatura mayor a 39 °C.
Bienestar menor a 25.

Estos casos deberán ser poco frecuentes.

## 33. Coherencia por usuario

Las variables del perfil deberán mantenerse estables:

- `age`
- `height_cm`
- `weight_profile_kg`

Las variables diarias podrán cambiar:

- `weight_kg`
- `sleep_hours`
- `exercise_minutes`
- `water_glasses`
- `healthy_meals_count`
- `meditation_minutes`
- `mood`
- `stress_level`
- `energy_level`
- `sleep_quality`
Síntomas.
Signos físicos.

Los cambios diarios deberán mostrar continuidad razonable.

## 34. Reglas de calidad

El dataset deberá cumplir las siguientes reglas:

record_id debe ser único.
Debe existir un máximo de un registro diario por usuario.
user_id debe ser anónimo.
log_date debe ser válida.
No deben existir fechas futuras fuera del periodo simulado.
No se permiten valores negativos.
Los valores deben respetar los rangos definidos.
systolic_mmhg debe ser mayor que diastolic_mmhg en condiciones normales.
bmi debe calcularse a partir de peso y altura.
water_liters debe calcularse a partir de water_glasses.
Los puntajes deben permanecer entre 0 y 100.
risk_level solo podrá contener low, medium o high.
Las variables derivadas deben generarse mediante scripts.
No deben incluirse nombres, correos o teléfonos.
La generación debe ser reproducible.
Los casos extremos y anomalías deben permanecer en proporciones controladas.
Los valores faltantes deben respetar la política definida.
> No deberán modificarse manualmente las etiquetas para mejorar las métricas.

## 35. Validaciones específicas

Validación de hábitos
```text
water_glasses >= 0
```

```text
exercise_minutes >= 0
```

```text
sleep_hours >= 0
```

```text
healthy_meals_count >= 0
```

```text
meditation_minutes >= 0
```

Validación emocional
```text
1 <= stress_level <= 10
```

```text
1 <= energy_level <= 10
```

```text
1 <= sleep_quality <= 10
```

Validación física
```text
0 <= pain <= 10
```

```text
temperature_c > 0
```

```text
systolic_mmhg > diastolic_mmhg
```

```text
heart_rate_bpm > 0
```

```text
weight_kg > 0
```

```text
height_cm > 0
```

Validación de resultados
```text
0 <= wellbeing_score <= 100
```

risk_level in {low, medium, high}
is_anomaly in {True, False}
## 36. División futura del dataset

Después de validar y procesar los datos, se propone dividirlos en:

Entrenamiento: 70 %
Validación:    15 %
Prueba:        15 %

La división deberá realizarse después de generar el dataset completo.

Cuando se evalúe un problema temporal, se deberá conservar el orden cronológico:

```text
Entrenamiento → periodo inicial
```

```text
Validación    → periodo intermedio
```

```text
Prueba        → periodo más reciente
```

## 37. Prevención de fuga de información

No se deberá:

Normalizar antes de separar los conjuntos.
Calcular imputaciones utilizando todo el dataset.
Utilizar risk_level para construir variables de entrada.
Utilizar wellbeing_score como característica del clasificador de riesgo si risk_level depende de ese puntaje.
Utilizar is_anomaly como característica en detección no supervisada.
Mezclar registros futuros con registros pasados.
Utilizar identificadores como variables predictoras.

Para el clasificador, se deberá evaluar cuidadosamente si wellbeing_score se excluye de las entradas para evitar una relación circular.

## 38. Archivos esperados

```text
ml-service/
├── data/
│   ├── raw/
│   │   └── vitalmind_dataset_raw.csv
│   ├── processed/
│   │   └── vitalmind_dataset_processed.csv
│   ├── training/
│   │   └── train.csv
│   ├── validation/
│   │   └── validation.csv
│   └── test/
│       └── test.csv
├── scripts/
│   ├── generate_dataset.py
│   ├── validate_dataset.py
│   ├── clean_dataset.py
│   └── split_dataset.py
└── reports/
    └── dataset_quality_report.md
```

## 39. Salida del script generador

El script deberá mostrar un resumen similar a:

Dataset generado correctamente.

Usuarios: 250
Registros: 5000
Periodo: 90 días

Distribución de riesgo:

- low:    50 %
- medium: 35 %
- high:   15 %

Valores faltantes: 3.2 %
Anomalías sintéticas: 3.0 %

Los porcentajes podrán variar ligeramente.

## 40. Evidencias requeridas

La simulación deberá producir:

Script generador.
Dataset original.
Diccionario de datos.
Reglas de simulación.
Reporte de calidad.
Estadísticas descriptivas.
Distribución de clases.
Evidencia de reproducibilidad.
Registro de valores faltantes.
Registro de anomalías.
Explicación de variables derivadas.
## 41. Dependencias con Backend

La simulación ya puede comenzar con nombres canónicos.

Sin embargo, la integración con datos reales deberá esperar hasta que Backend confirme:

Creación de emotional_logs.
Implementación de stress_level.
Implementación de energy_level.
Implementación de sleep_quality.
Incorporación de symptom_logs.log_date.
Incorporación opcional de symptom_logs.log_time.
Mapeo de campos actuales de habit_logs.
Estrategia para extraer y unir datos de MySQL.
Formato final de entrada para inferencia.
## 42. Limitaciones

El dataset inicial será sintético.
Las relaciones estarán basadas en reglas, no en evidencia clínica.
Las etiquetas de riesgo serán artificiales.
El puntaje de bienestar será una construcción analítica.
Los modelos no deberán interpretarse como herramientas de diagnóstico.
Los resultados iniciales solo demostrarán viabilidad técnica.
La calidad real dependerá de los datos recopilados posteriormente.
El modelo emocional no podrá considerarse definitivo sin etiquetas reales.
Las reglas deberán revisarse con especialistas si el sistema evoluciona hacia un uso clínico.
## 43. Estado actual

Con estas reglas ya es posible avanzar con:

Creación del script generate_dataset.py.
Generación de la primera versión sintética.
Validación de calidad.
Análisis exploratorio.
Preparación de conjuntos.
Entrenamiento inicial del clasificador.

La integración con datos reales permanecerá pendiente hasta que Backend implemente y confirme los cambios acordados.

## 44. Conclusión

La simulación de VitalMind AI deberá producir registros diarios coherentes, reproducibles y suficientemente variados para evaluar los mecanismos iniciales de Machine Learning.

El dataset deberá reflejar relaciones razonables entre hábitos, síntomas, signos físicos y estado emocional sin generar etiquetas perfectas ni conclusiones médicas.

La primera prioridad será preparar datos adecuados para:

Clasificación del nivel preventivo de riesgo.
Estimación del bienestar.
Recomendación general de hábitos.
Detección de cambios atípicos.

Los nombres canónicos permitirán mantener consistencia entre Machine Learning y Backend, aunque la base de datos conserve temporalmente nombres de columnas diferentes.
