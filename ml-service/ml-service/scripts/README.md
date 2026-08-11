# Scripts de ejecución y prueba

Esta carpeta contiene scripts independientes para automatizar procesos del módulo de Machine Learning.

## Propósito

Permitir que las tareas principales puedan ejecutarse de forma reproducible sin depender exclusivamente de notebooks.

## Contenido esperado

- Generación del dataset.
- Validación de datos.
- Limpieza.
- Transformación.
- División de conjuntos.
- Entrenamiento.
- Evaluación.
- Serialización.
- Pruebas locales de predicción.
- Generación de reportes.

## Archivos sugeridos

~~~text
generate_dataset.py
validate_dataset.py
clean_dataset.py
split_dataset.py
train_classifier.py
train_regressor.py
train_recommender.py
train_emotional_model.py
train_anomaly_detector.py
evaluate_models.py
serialize_models.py
test_local_prediction.py
generate_reports.py
~~~

## Reglas

- Utilizar rutas relativas.
- Validar entradas.
- Manejar errores.
- Mostrar mensajes claros.
- Evitar código duplicado.
- Reutilizar funciones de `app/utils/`.
- No incluir endpoints.
- No incluir FastAPI.
- No incluir lógica de Backend.
- Documentar parámetros.
- Mantener reproducibilidad.

## Importante

Las pruebas locales pueden cargar un modelo, preparar un ejemplo y ejecutar una predicción.

Eso no significa que esta carpeta deba contener una API.

---