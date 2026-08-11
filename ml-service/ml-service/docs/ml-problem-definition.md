# Definición del problema de Machine Learning

## Responsable

**Michelle Castro Otero**  
Responsable de Inteligencia Artificial y Machine Learning.

## Estado del documento

> Documento alineado con la estructura actual de MySQL y con las definiciones proporcionadas por el equipo de Backend.

Algunos campos necesarios para los modelos, como `stress_level`, `energy_level`, `sleep_quality` y la entidad `emotional_logs`, todavía deberán ser implementados por Backend antes de utilizar datos reales.

---

## 1. Contexto

VitalMind AI es una plataforma digital orientada al registro, seguimiento y análisis de información relacionada con la salud preventiva y el bienestar de los usuarios.

La aplicación administra información proveniente principalmente de una base de datos MySQL mediante las siguientes entidades:

- `users`
- `habit_logs`
- `symptom_logs`
- `medications`
- `medication_logs`
- `medical_history_items`
- `appointments`
- `notifications`
- `audit_logs`

También se propone incorporar una entidad independiente:

```text
emotional_logs
```

Esta entidad permitirá separar la información emocional de los registros físicos y almacenar variables como:

- Estado de ánimo.
- Nivel de estrés.
- Nivel de energía.
- Calidad del sueño.
- Notas emocionales.
- Fecha del registro.

El módulo de Machine Learning analizará información de hábitos, síntomas, signos físicos y estado emocional para identificar patrones, clasificar niveles preventivos de riesgo, estimar el bienestar, generar recomendaciones generales y detectar cambios relevantes en la rutina.

## 2. Problemática

Los registros diarios de bienestar pueden encontrarse distribuidos entre diferentes tablas y presentar valores faltantes, frecuencias distintas y cambios a lo largo del tiempo.

Un usuario puede experimentar variaciones graduales o repentinas en:

- Horas de sueño.
- Actividad física.
- Hidratación.
- Alimentación.
- Meditación.
- Estado de ánimo.
- Estrés.
- Energía.
- Calidad del sueño.
- Dolor.
- Temperatura.
- Presión arterial.
- Glucosa.
- Frecuencia cardiaca.
- Peso.

Estas variaciones pueden ser difíciles de interpretar manualmente cuando existen numerosos registros históricos.

VitalMind AI necesita mecanismos que permitan:

- Integrar información diaria procedente de distintas tablas.
- Identificar patrones de deterioro en los hábitos.
- Clasificar un nivel preventivo de riesgo.
- Estimar un puntaje general de bienestar.
- Generar recomendaciones generales de autocuidado.
- Detectar cambios atípicos respecto al comportamiento habitual.
- Analizar la evolución del estado emocional.
- Facilitar el seguimiento mediante resultados comprensibles.

> Los modelos no emitirán diagnósticos médicos ni sustituirán la valoración de profesionales.

## 3. Objetivo general

Desarrollar modelos de Machine Learning que analicen información de hábitos, síntomas, signos físicos y estado emocional de los usuarios de VitalMind AI para identificar patrones de bienestar, clasificar niveles preventivos de riesgo, generar recomendaciones generales y detectar cambios relevantes en la rutina.

## 4. Objetivos específicos

Integrar y preparar datos procedentes de users, habit_logs, symptom_logs y, cuando sea implementada, emotional_logs.
Validar tipos, rangos, unidades, fechas y valores faltantes.
Construir un dataset analítico con granularidad diaria por usuario.
Calcular características derivadas como el índice de masa corporal.
Construir un clasificador para el semáforo de riesgo preventivo.
Comparar Regresión Logística, Random Forest Classifier y XGBoost Classifier.
Desarrollar modelos para estimar un puntaje general de bienestar.
Comparar Random Forest Regressor y XGBoost Regressor.
Analizar la viabilidad de Prophet cuando existan suficientes registros temporales por usuario.
Desarrollar un recomendador de hábitos mediante reglas explicables, KNN y filtrado basado en contenido.
Analizar la viabilidad de un modelo de predicción emocional.
Detectar cambios atípicos mediante Isolation Forest y One-Class SVM.
Evaluar, comparar y seleccionar los modelos más útiles.
Serializar los modelos y preprocesadores seleccionados.
Documentar entradas, salidas, métricas, versiones y limitaciones para Backend.
Entregar scripts locales que permitan comprobar la carga y ejecución de los modelos.
## 5. Usuarios beneficiados

### 5.1 Usuario de VitalMind AI

Podrá:

- Consultar tendencias generales de sus hábitos.
- Visualizar cambios en su bienestar.
- Recibir recomendaciones preventivas.
- Conocer un nivel de riesgo informativo.
- Identificar cambios relevantes en su rutina.
### 5.2 Administrador

Podrá consultar información agregada sobre:

- Funcionamiento de los modelos.
- Distribución de niveles de riesgo.
- Patrones generales.
- Cantidad de inferencias.
- Resultados y métricas.

> La información deberá mostrarse de forma anónima y agregada.

### 5.3 Equipo de Backend

Recibirá:

- Modelos serializados.
- Preprocesadores.
- Codificadores.
- Lista y orden de variables.
- Reglas de validación.
- Ejemplos de entrada y salida.
- Contratos técnicos.
- Versiones y métricas.

Backend será responsable de:

- Extraer los datos desde MySQL.
- Mapear los campos del sistema.
- Construir endpoints.
- Ejecutar la integración.
- Entregar los resultados al frontend.
### 5.4 Equipo de Frontend

Consumirá los resultados proporcionados por Backend para mostrarlos en:

- Dashboard.
- Semáforo de riesgo.
- Recomendaciones.
- Historial.
- Componentes del chatbot.
## 6. Fuentes de datos

### 6.1 users

Variables relevantes:

- `age`
- `weight_kg`
- `height_cm`

Variables de uso técnico o excluidas inicialmente:

- `blood_type`
- `role`
- `full_name`
- `email`
- `phone`
- `password_hash`
### 6.2 habit_logs

Campos actuales y nombres canónicos para Machine Learning:

| Campo de Backend | Nombre para ML | Unidad |
|---|---|---|
| `water` | `water_glasses` | Vasos de aproximadamente 250 ml |
| `exercise` | `exercise_minutes` | Minutos |
| `sleep` | `sleep_hours` | Horas |
| `nutrition` | `healthy_meals_count` | Comidas saludables |
| `meditation` | `meditation_minutes` | Minutos |
| `log_date` | `log_date` | Fecha del registro |
### 6.3 symptom_logs

Variables relevantes:

- `pain`
- `temperature`
- `systolic`
- `diastolic`
- `glucose`
- `weight`
- `heart_rate`
- `notes`

Backend deberá agregar:

- `log_date`
- log_time, cuando se determine necesario.

El campo mood existe actualmente dentro de symptom_logs, pero la propuesta definitiva es mover el registro emocional a una entidad independiente.

### 6.4 emotional_logs

Entidad propuesta con los siguientes campos:

- `user_id`
- `log_date`
- `mood`
- `stress_level`
- `energy_level`
- `sleep_quality`
- `notes`
- `created_at`
### 6.5 medication_logs

Variables disponibles para mecanismos futuros:

- `taken_date`
- `taken_time`
- `taken`

Estas variables podrán utilizarse posteriormente para analizar adherencia a medicamentos.

## 7. Granularidad del dataset

La unidad de observación inicial será:

- Un registro diario por usuario.

Cada fila integrará la información correspondiente a un mismo user_id y log_date.

Cuando exista más de un registro de síntomas o emociones durante el mismo día, deberá aplicarse una regla de agregación documentada, por ejemplo:

- Último registro del día.
- Promedio diario.
- Valor máximo.
- Registro más cercano a una hora de referencia.

- La regla definitiva dependerá del tipo de variable.

## 8. Problemas de Machine Learning

### 8.1 Clasificación del nivel preventivo de riesgo

El modelo clasificará el nivel preventivo de riesgo a partir de hábitos, síntomas, signos físicos y variables emocionales.

**Tipo de problema:**

- Clasificación multiclase.

**Variable objetivo:**

- `risk_level`
**Clases internas:**

- `low`
- `medium`
- `high`
**Representación para la interfaz:**

- Bajo.
- Medio.
- Alto.
**Algoritmos iniciales:**

- Regresión Logística.
- Random Forest Classifier.
- XGBoost Classifier.
**Variables principales:**

- `age`
- `weight_kg`
- `height_cm`
- `bmi`
- `sleep_hours`
- `exercise_minutes`
- `water_glasses`
- `healthy_meals_count`
- `meditation_minutes`
- `mood`
- `heart_rate_bpm`
- `pain`
**Variables complementarias:**

- `temperature_c`
- `systolic_mmhg`
- `diastolic_mmhg`
- `glucose_mg_dl`
- `stress_level`
- `energy_level`
- `sleep_quality`

Las variables emocionales se utilizarán con datos reales cuando Backend implemente emotional_logs.

### 8.2 Estimación del bienestar

El modelo estimará un puntaje general de bienestar a partir de las dimensiones disponibles.

**Tipo de problema:**

- Regresión.

**Variable objetivo:**

- `wellbeing_score`
**Rango:**

0 a 100
**Algoritmos iniciales:**

- Random Forest Regressor.
- XGBoost Regressor.
**Algoritmo temporal opcional:**

- Prophet.

Prophet solo se utilizará si existen suficientes registros históricos ordenados por fecha y una frecuencia temporal consistente.

**Dimensiones consideradas:**

- Sueño.
- Actividad física.
- Hidratación.
- Alimentación.
- Meditación.
- Estado emocional.
- Síntomas.
- Signos físicos.
### 8.3 Recomendación de hábitos

El mecanismo generará recomendaciones generales de bienestar según el perfil diario del usuario.

**Tipo de problema:**

- Sistema híbrido de recomendación.

**Enfoques iniciales:**

- Reglas explicables.
- K-Nearest Neighbors.
- Filtrado basado en contenido.
**Entradas principales:**

- `sleep_hours`
- `exercise_minutes`
- `water_glasses`
- `healthy_meals_count`
- `meditation_minutes`
- `mood`
- `stress_level`
- `energy_level`
- `sleep_quality`
- `pain`
**Ejemplos de recomendaciones:**

- Mejorar la regularidad del descanso.
- Aumentar gradualmente la hidratación.
- Incorporar actividad física ligera.
- Realizar una pausa de respiración o meditación.
Registrar síntomas persistentes y consultar a un profesional cuando corresponda.

> Las recomendaciones no incluirán diagnósticos, medicamentos, dosis ni tratamientos.

### 8.4 Predicción emocional

El mecanismo analizará la evolución del estado emocional del usuario.

**Tipo de problema:**

- Clasificación supervisada o estimación de probabilidad.

**Variables de entrada:**

- Historial de mood.
- `stress_level.`
- `energy_level.`
- `sleep_quality.`
- `sleep_hours.`
- `exercise_minutes.`
- `pain.`
**Posibles salidas:**

- `emotional_prediction`
- `stress_probability`
**Algoritmos iniciales:**

- Regresión Logística.
- Random Forest Classifier.
- SVM.
**Limitación actual:**

Este modelo dependerá de:

- La implementación de emotional_logs.
- La disponibilidad de registros históricos.
- Una variable objetivo correctamente definida.
- Una cantidad suficiente de ejemplos.

No se desarrollará como modelo definitivo mientras estas condiciones no se cumplan.

### 8.5 Análisis de texto emocional

Las notas voluntarias podrían analizarse como una ampliación futura.

**Fuentes posibles:**

- `emotional_logs.notes`
- `symptom_logs.notes`
**Tipo de problema:**

- Clasificación de texto.

**Algoritmos posibles:**

- SVM con TF-IDF.
- DistilBERT.
**Condiciones necesarias:**

- Textos suficientes.
- Etiquetas confiables.
- Anonimización.
- Revisión de sesgos.
- Recursos de procesamiento adecuados.

No se asumirá que las notas actuales ya son suficientes para entrenar un modelo de NLP.

### 8.6 Detección de cambios drásticos

El modelo identificará registros que se alejen considerablemente del comportamiento habitual del mismo usuario.

**Tipo de problema:**

- Detección no supervisada de anomalías.

**Algoritmos iniciales:**

- Isolation Forest.
- One-Class SVM.
**Ejemplos de anomalías:**

- Caída repentina de las horas de sueño.
- Incremento abrupto del nivel de estrés.
- Reducción importante de actividad física.
- Cambio considerable en frecuencia cardiaca.
- Aumento inusual del dolor.
- Abandono repentino de hábitos.
- Variación anormal del estado emocional.
**Resultados:**

- `is_anomaly`
- `anomaly_score`

> La detección de una anomalía no implicará automáticamente una condición médica.

## 9. Preguntas de análisis

¿Qué variables se relacionan más con el nivel preventivo de riesgo?
¿Cómo se relacionan las horas de sueño, el estado emocional y la actividad física con el bienestar?
¿Qué algoritmo clasifica mejor el semáforo de riesgo?
¿Qué modelo obtiene menor error al estimar el puntaje de bienestar?
¿Qué influencia tienen el dolor, la frecuencia cardiaca y otros signos físicos?
¿Qué hábitos aparecen asociados con niveles bajos de bienestar?
¿Existen perfiles diarios con características similares?
¿Qué cambios pueden considerarse atípicos respecto al historial del usuario?
¿Qué variables tienen mayor importancia para las predicciones?
¿Qué tan estables son los resultados de los modelos?
¿Qué efecto tienen los valores faltantes sobre el rendimiento?
¿Qué variables realmente estarán disponibles durante una inferencia?
¿Qué preprocesamiento deberá aplicar Backend?
¿Qué limitaciones deben mostrarse junto con cada resultado?
## 10. Entradas iniciales

### 10.1 Variables obligatorias

- `age`
- `weight_kg`
- `height_cm`
- `bmi`
- `sleep_hours`
- `exercise_minutes`
- `mood`
- `heart_rate_bpm`
- `pain`
### 10.2 Variables de hábitos complementarias

- `water_glasses`
- `healthy_meals_count`
- `meditation_minutes`
### 10.3 Variables físicas opcionales

- `temperature_c`
- `systolic_mmhg`
- `diastolic_mmhg`
- `glucose_mg_dl`
### 10.4 Variables emocionales pendientes de implementación

- `stress_level`
- `energy_level`
- `sleep_quality`
### 10.5 Variables técnicas

- `record_id`
- `user_id`
- `log_date`

Estas variables se utilizarán para trazabilidad y análisis temporal, pero no como características predictoras.

## 11. Salidas preliminares

### 11.1 Clasificador de riesgo

```json
{
  "risk_level": "medium",
  "probability": 0.78,
  "message": "Se observa sueño reducido y baja actividad física."
}
```

### 11.2 Modelo de bienestar

```json
{
  "wellbeing_score": 67.5
}
```

### 11.3 Recomendador

```json
{
  "recommendations": [
    {
      "type": "habit",
      "title": "Mejora tu descanso",
      "description": "Procura mantener un horario de sueño más regular.",
      "priority": "high"
    },
    {
      "type": "habit",
      "title": "Aumenta tu hidratación",
      "description": "Intenta incrementar gradualmente tu consumo de agua.",
      "priority": "medium"
    }
  ]
}
```

### 11.4 Detector de anomalías

```json
{
  "is_anomaly": true,
  "anomaly_score": -0.42,
  "message": "Se detectó un cambio relevante respecto al comportamiento habitual."
}
```

### 11.5 Predicción emocional futura

```json
{
  "emotional_prediction": "high_stress",
  "stress_probability": 0.81
}
```

Los nombres finales de las respuestas deberán acordarse con Backend antes de la integración.

## 12. Métricas de evaluación

### 12.1 Clasificación

Accuracy.
Precision.
Recall.
F1-Score.
Matriz de confusión.
ROC-AUC multiclase, cuando aplique.

Debido a que el nivel alto podría ser una clase minoritaria, no se seleccionará un modelo únicamente por Accuracy.

### 12.2 Regresión

MAE.
MSE.
RMSE.
R².
### 12.3 Recomendación

Similitud entre perfiles.
Cobertura.
Diversidad.
Coherencia de las recomendaciones.
Revisión de reglas.
Evaluación manual inicial.
Precision@K o Recall@K, cuando existan interacciones reales.
### 12.4 Detección de anomalías

Proporción de anomalías.
Estabilidad entre ejecuciones.
Revisión de falsos positivos.
Interpretación de los registros detectados.
Comparación con etiquetas sintéticas, cuando se utilicen datos simulados.
### 12.5 Predicción emocional

Accuracy.
Precision.
Recall.
F1-Score.
Matriz de confusión.
ROC-AUC, cuando aplique.
## 13. Alcance del módulo de Machine Learning

El módulo llegará hasta:

- Análisis del esquema de datos.
- Definición del dataset.
- Simulación estratégica.
- Validación de calidad.
- Preparación de datos.
- Análisis exploratorio.
- Ingeniería de características.
- División de conjuntos.
- Entrenamiento.
- Ajuste de hiperparámetros.
- Evaluación.
- Comparación.
- Selección de modelos.
- Serialización.
- Pruebas locales.
- Documentación técnica.
- Entrega de artefactos y contratos a Backend.
## 14. Fuera de alcance

No corresponde a este módulo:

- Implementar endpoints.
- Desarrollar FastAPI.
- Desarrollar Express.js.
- Crear rutas o controladores.
- Administrar MySQL.
- Aplicar migraciones del Backend.
- Implementar autenticación.
- Manejar sesiones.
- Implementar Socket.IO.
- Integrar directamente el frontend.
- Crear Swagger.
- Desplegar la API.
- Emitir diagnósticos médicos o psicológicos.
## 15. Consideraciones éticas y de privacidad

Los resultados serán preventivos e informativos.
No se emitirán diagnósticos médicos ni psicológicos.
No se sustituirá la valoración de profesionales.
Los datos deberán ser anónimos, anonimizados o simulados.
No se utilizarán nombres, correos, teléfonos, contraseñas ni identificadores directos.
user_id solo se utilizará para relacionar registros y no como predictor.
Se documentarán posibles sesgos.
Se revisará el rendimiento por grupos cuando existan variables adecuadas.
Se explicarán las limitaciones de cada modelo.
Las recomendaciones serán generales y no prescriptivas.
Las anomalías deberán interpretarse dentro del contexto del usuario.
Las notas de texto deberán anonimizarse antes del entrenamiento.
Una probabilidad alta no deberá presentarse como certeza.
## 16. Dependencias con Backend

Backend deberá:

- Mantener disponible la información de users.
- Mantener disponible la información de habit_logs.
- Mantener disponible la información de symptom_logs.
- Crear emotional_logs.
- Agregar stress_level.
- Agregar energy_level.
- Agregar sleep_quality.
- Agregar log_date a symptom_logs.
- Definir si se utilizará log_time.
- Mantener taken_date y taken_time en medication_logs.
Mapear los nombres actuales de hábitos hacia los nombres canónicos.
Definir la forma en que se extraerán los datos.
- Construir los endpoints.
- Cargar y ejecutar los modelos.
- Aplicar las validaciones de entrada acordadas.
## 17. Entregables para Backend

El módulo de Machine Learning deberá entregar:

- Modelo serializado.
- Preprocesador.
- Escalador, cuando aplique.
- Codificador de categorías.
- Orden exacto de columnas.
- Tipos esperados.
- Unidades.
- Rangos válidos.
- Política de valores faltantes.
- Ejemplo de entrada.
- Ejemplo de salida.
- Versión del modelo.
- Métricas.
- Limitaciones.
- Script local de prueba.
- Documento de integración.
## 18. Restricciones actuales

emotional_logs todavía no está implementada.
stress_level, energy_level y sleep_quality no están disponibles actualmente en la base.
symptom_logs.log_date todavía debe agregarse.
Los nombres canónicos de hábitos todavía deberán mapearse desde los nombres actuales.
No existe un endpoint de predicción.
No existe todavía un dataset histórico suficiente para todos los mecanismos.
La variable objetivo risk_level deberá generarse inicialmente mediante reglas documentadas.
wellbeing_score será inicialmente una variable sintética.
El modelo emocional no podrá considerarse definitivo hasta contar con etiquetas suficientes.
El análisis de texto dependerá de la disponibilidad y calidad de las notas.
## 19. Estado actual

Con la información proporcionada por Backend ya es posible avanzar con:

- Diseño del dataset.
- Simulación.
- Reglas de calidad.
- Ingeniería de características.
- EDA.
- Entrenamiento inicial con datos sintéticos.

La integración con datos reales deberá esperar hasta que Backend implemente y confirme:

- `emotional_logs.`
- Los campos emocionales.
- `symptom_logs.log_date.`
- El mapeo final de nombres.
- El mecanismo de extracción de datos.
## 20. Conclusión

La primera versión del módulo priorizará tres mecanismos:

- Clasificación del nivel preventivo de riesgo.
- Recomendación general de hábitos.
- Estimación o seguimiento del estado emocional.

También se desarrollarán mecanismos complementarios de:

- Estimación del bienestar.
- Detección de anomalías.

El primer modelo implementado deberá ser el clasificador de riesgo preventivo porque utiliza la mayor cantidad de variables ya disponibles y puede integrarse posteriormente con el semáforo de riesgo del dashboard.

