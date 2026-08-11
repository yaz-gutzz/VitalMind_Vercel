# Modelos entrenados

Esta carpeta almacena los modelos de Machine Learning entrenados y serializados para VitalMind AI.

## Propósito

Conservar los artefactos finales que serán entregados al equipo de Backend para su integración con el sistema.

## Contenido esperado

- Modelos de clasificación del semáforo de riesgo.
- Modelos de regresión o pronóstico.
- Modelos de recomendación.
- Modelos de análisis emocional.
- Modelos de detección de anomalías.
- Escaladores.
- Codificadores.
- Vectorizadores.
- Transformadores.
- Archivos de metadatos.
- Listas de características utilizadas.

## Formatos permitidos

- `.joblib`
- `.pkl`
- `.json`
- `.txt`, para listas o configuraciones sencillas.

## Convención sugerida de nombres

~~~text
clasificador_riesgo_v1.joblib
regresor_bienestar_v1.joblib
recomendador_bienestar_v1.joblib
analizador_emocional_v1.joblib
detector_anomalias_v1.joblib
scaler_clasificador_v1.joblib
encoder_variables_v1.joblib
metadata_clasificador_v1.json
~~~

## Metadatos mínimos

Cada modelo deberá contar con información sobre:

- Nombre.
- Versión.
- Fecha de entrenamiento.
- Algoritmo.
- Variables de entrada.
- Variable objetivo.
- Métricas.
- Preprocesamiento requerido.
- Archivo del modelo.
- Limitaciones.
- Responsable.

## Reglas

- No guardar modelos sin evaluar.
- No sobrescribir versiones anteriores sin justificación.
- Utilizar nombres descriptivos.
- Documentar las entradas y salidas.
- Guardar los preprocesadores necesarios.
- Verificar que el modelo pueda cargarse después de serializarlo.
- No incluir credenciales ni datos personales.

---