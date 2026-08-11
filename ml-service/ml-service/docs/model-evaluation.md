# Evaluación de modelos de Machine Learning — VitalMind AI

## 1. Propósito

Este documento resume el proceso de entrenamiento, comparación, selección y evaluación final de los modelos de Machine Learning desarrollados para VitalMind AI.

Los resultados corresponden a modelos entrenados principalmente con datos sintéticos generados para fines académicos y de desarrollo.

Los modelos no representan herramientas de diagnóstico clínico.

---

## 2. Preparación de datos

El dataset utilizado contiene:

```text
Registros totales: 5000
Usuarios: 250
Periodo: 2026-04-01 a 2026-06-29
```

Después del procesamiento:

```text
Registros procesados: 5000
Valores faltantes procesados: 0
Pesos recuperados desde perfil: 150
```

La división se realizó de forma temporal para reducir el riesgo de fuga de información.

### Entrenamiento

```text
Registros: 3418
Porcentaje: 68.36 %
Periodo: 2026-04-01 a 2026-06-01
Usuarios: 250
```

Distribución de riesgo:

```text
low:    37.30 %
medium: 39.53 %
high:   23.17 %
```

### Validación

```text
Registros: 731
Porcentaje: 14.62 %
Periodo: 2026-06-02 a 2026-06-14
Usuarios: 240
```

Distribución:

```text
low:    34.75 %
medium: 40.36 %
high:   24.90 %
```

### Prueba

```text
Registros: 851
Porcentaje: 17.02 %
Periodo: 2026-06-15 a 2026-06-29
Usuarios: 248
```

Distribución:

```text
low:    37.60 %
medium: 38.07 %
high:   24.32 %
```

El conjunto de prueba fue reservado hasta la evaluación final.

---

# 3. Clasificación del nivel de riesgo

## 3.1 Tipo de problema

Clasificación multiclase.

Clases:

```text
low
medium
high
```

## 3.2 Modelos evaluados inicialmente

Se compararon:

```text
Logistic Regression
Random Forest Classifier
```

### Logistic Regression

```text
Accuracy:           0.8933
Precision weighted: 0.8935
Recall weighted:    0.8933
F1 weighted:        0.8929
F1 macro:           0.8933
ROC-AUC weighted:   0.9771
```

### Random Forest

```text
Accuracy:           0.8824
Precision weighted: 0.8826
Recall weighted:    0.8824
F1 weighted:        0.8821
F1 macro:           0.8825
ROC-AUC weighted:   0.9701
```

El mejor modelo provisional fue:

```text
Logistic Regression
```

---

## 3.3 Ajuste del clasificador

El modelo seleccionado fue ajustado utilizando exclusivamente los conjuntos de entrenamiento y validación.

Configuración final:

```text
Modelo: logistic_regression

Parámetros:
C = 10.0
class_weight = balanced
solver = lbfgs
```

Resultados en validación:

```text
Accuracy:    0.8892
F1 macro:    0.8890
Recall high: 0.9011
ROC-AUC:     0.9765
```

Artefacto final:

```text
ml-service/app/models/risk-classification/
best_risk_classifier_safe.joblib
```

---

## 3.4 Evaluación final del clasificador

La evaluación final se realizó una sola vez sobre el conjunto de prueba.

```text
Registros de prueba: 851

Accuracy:           0.9048
Precision weighted: 0.9052
Recall weighted:    0.9048
F1 weighted:        0.9049

Precision macro:    0.9017
Recall macro:       0.9059
F1 macro:           0.9037

ROC-AUC weighted:   0.9804
ROC-AUC macro:      0.9808
```

### Clase `high`

```text
Precision: 0.8750
Recall:    0.9130
F1:        0.8936
```

### Matriz de confusión

```text
        high  low  medium
high     189    0      18
low        0  300      20
medium    27   16     281
```

El modelo mostró un desempeño equilibrado entre las tres clases y una capacidad adecuada para identificar la clase preventiva `high`.

El conjunto de prueba no fue utilizado posteriormente para realizar ajustes.

---

# 4. Regresión del puntaje de bienestar

## 4.1 Tipo de problema

Regresión supervisada.

Variable objetivo:

```text
wellbeing_score
```

Rango:

```text
0 a 100
```

---

## 4.2 Comparación inicial

Se evaluaron:

```text
Dummy Regressor
Ridge Regression
Random Forest Regressor
```

Resultados:

| Modelo                  |     MAE |    RMSE |      R² |
| ----------------------- | ------: | ------: | ------: |
| Ridge Regression        |  2.8878 |  3.5190 |  0.9644 |
| Random Forest Regressor |  3.0494 |  3.7504 |  0.9596 |
| Dummy Regressor         | 16.1651 | 18.6662 | -0.0011 |

El mejor modelo provisional fue:

```text
Ridge Regression
```

---

## 4.3 Ajuste del regresor

Configuración final:

```text
Modelo: ridge_regression
alpha: 10.0
```

Resultados en validación:

```text
MAE:  2.8873
RMSE: 3.5172
R²:   0.9645

Residuo promedio:      -0.0267
Error absoluto máximo: 10.6010
```

Artefacto final:

```text
ml-service/app/models/wellbeing-regression/
best_wellbeing_regressor.joblib
```

---

## 4.4 Evaluación final del regresor

Evaluación sobre el conjunto de prueba:

```text
Registros: 851

MAE:  3.1230
RMSE: 3.8266

Mediana del error absoluto: 2.7044
R²: 0.9584

Residuo promedio:      0.2417
Error absoluto máximo: 15.0235
```

Percentiles:

```text
p25: 1.4497
p50: 2.7044
p75: 4.4205
p90: 5.9256
p95: 7.0274
```

Distribución de errores:

| Intervalo | Registros | Porcentaje |
| --------- | --------: | ---------: |
| 0 a 2     |       301 |    35.37 % |
| >2 a 5    |       401 |    47.12 % |
| >5 a 10   |       140 |    16.45 % |
| >10       |         9 |     1.06 % |

El modelo conserva un R² elevado en datos temporales no utilizados durante el ajuste.

---

# 5. Agrupación de perfiles de bienestar

## 5.1 Tipo de aprendizaje

No supervisado.

Algoritmo:

```text
K-Means
```

Se evaluaron valores de:

```text
k = 2 a 6
```

Resultados principales:

| Clusters | Silhouette |
| -------: | ---------: |
|        2 |     0.3615 |
|        3 |     0.2419 |
|        4 |     0.2293 |
|        5 |     0.2175 |
|        6 |     0.1528 |

Se seleccionaron:

```text
2 clusters
```

Métricas:

```text
Silhouette Score:          0.3615
Davies-Bouldin Score:      1.0408
Calinski-Harabasz Score: 184.4039
PCA 2D explained variance: 0.6558
```

Tamaños:

```text
Cluster 0: 160 usuarios
Cluster 1: 90 usuarios
```

### Cluster 0

```text
Exercise:            17.35 min
Sleep:                5.86 h
Healthy meals:        1.60
Stress:               5.31
Energy:               2.75
Sleep quality:        5.47
Pain:                 4.19
```

### Cluster 1

```text
Exercise:            45.31 min
Sleep:                7.71 h
Healthy meals:        2.96
Stress:               1.97
Energy:               6.53
Sleep quality:        7.75
Pain:                 0.83
```

Artefacto:

```text
ml-service/app/models/wellbeing-clustering/
wellbeing_kmeans_pipeline.joblib
```

La agrupación se utiliza con propósito exploratorio y no representa categorías clínicas.

---

# 6. Detección de anomalías

## 6.1 Algoritmo

```text
Isolation Forest
```

Tipo:

```text
Aprendizaje no supervisado
```

Contaminación configurada:

```text
3 %
```

Resultados:

```text
Registros analizados: 3418
Anomalías detectadas: 103
Porcentaje detectado: 3.01 %

Anomalías sintéticas externas: 97
Porcentaje externo: 2.84 %
```

Evaluación externa:

```text
Accuracy:  0.9491
Precision: 0.1262
Recall:    0.1340
F1:        0.1300
```

Matriz:

```text
Verdaderos normales: 3231
Falsos positivos:      90
Falsos negativos:      84
Verdaderas anomalías:  13
```

La etiqueta sintética `is_anomaly` no fue utilizada durante el entrenamiento.

Se utilizó únicamente como referencia externa.

El bajo F1 indica que las anomalías estadísticas identificadas por Isolation Forest no corresponden necesariamente con las reglas utilizadas para generar las anomalías sintéticas.

Por esta razón, el detector se conserva como herramienta exploratoria.

Artefacto:

```text
ml-service/app/models/anomaly-detection/
isolation_forest_pipeline.joblib
```

---

# 7. Motor de recomendaciones preventivas

VitalMind AI incorpora un motor basado en reglas transparentes.

Las recomendaciones consideran:

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

Metas internas del proyecto:

| Variable           | Meta       |
| ------------------ | ---------- |
| Agua               | 8 vasos    |
| Ejercicio          | 30 minutos |
| Sueño              | 8 horas    |
| Comidas saludables | 3          |
| Meditación         | 10 minutos |

El motor devuelve como máximo:

```text
5 recomendaciones
```

Estas reglas no representan límites clínicos.

Se utilizan como metas internas de seguimiento de VitalMind.

---

# 8. Chatbot inteligente

El chatbot utiliza:

```text
Proveedor: Mistral AI
Modelo: mistral-small-latest
```

El modelo generativo no sustituye los modelos de Machine Learning.

Flujo:

```text
Datos del usuario
        ↓
Clasificador de riesgo
        ↓
Regresor de bienestar
        ↓
Cálculo de BMI
        ↓
Motor de recomendaciones
        ↓
Contexto VitalMind
        ↓
Mistral AI
        ↓
Respuesta conversacional
```

El modelo generativo se utiliza principalmente para:

* explicar resultados;
* contestar preguntas de bienestar;
* redactar recomendaciones;
* mantener una conversación comprensible.

No debe:

* diagnosticar;
* recetar medicamentos;
* modificar tratamientos;
* inventar resultados ML;
* interpretar automáticamente resultados mediante categorías clínicas no proporcionadas por VitalMind.

---

# 9. Microservicio de inferencia

Framework:

```text
FastAPI
```

Endpoints principales:

```http
GET  /health
GET  /api/v1/models/info
POST /api/v1/analyze
POST /api/v1/chat
POST /api/v1/chat/analyze
```

El endpoint:

```http
POST /api/v1/chat/analyze
```

permite ejecutar el flujo completo:

```text
ML + recomendaciones + chatbot
```

en una única solicitud.

---

# 10. Pruebas automatizadas

Las pruebas utilizan:

```text
pytest
FastAPI TestClient
unittest.mock
```

Se validan, entre otros:

* carga de modelos;
* endpoint de salud;
* inferencia completa;
* cálculo de BMI;
* imputación;
* campos indispensables;
* rangos inválidos;
* normalización de `mood`;
* chatbot;
* contexto ML;
* integración `/chat/analyze`;
* errores de entrada.

Las llamadas al proveedor generativo son simuladas mediante mocks durante las pruebas automatizadas para evitar consumo innecesario de API.

---

# 11. Limitaciones

* El dataset principal es sintético.
* No existe validación clínica.
* Las métricas representan desempeño sobre datos derivados del proceso de simulación.
* Los modelos no deben utilizarse como herramientas diagnósticas.
* Las recomendaciones son preventivas.
* El clustering se utiliza únicamente con fines exploratorios.
* La detección de anomalías requiere revisión contextual.
* Los resultados deberán reevaluarse cuando existan datos reales.
* Los modelos deberán versionarse si cambia el dataset, las variables o el preprocesamiento.

---

# 12. Conclusión

El módulo de Machine Learning de VitalMind AI implementa modelos supervisados y no supervisados para análisis preventivo de bienestar.

El clasificador seleccionado obtuvo:

```text
F1 macro final: 0.9037
ROC-AUC macro:  0.9808
```

El regresor seleccionado obtuvo:

```text
MAE final: 3.1230
R² final:  0.9584
```

Estos modelos se encuentran serializados y disponibles mediante un microservicio FastAPI.

El sistema también incorpora agrupación exploratoria, detección de anomalías, generación preventiva de recomendaciones y un chatbot integrado con los resultados de Machine Learning.

Todos los resultados deben interpretarse dentro del contexto académico y preventivo de VitalMind AI.
