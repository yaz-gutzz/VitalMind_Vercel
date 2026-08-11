# Conjunto de validación

Esta carpeta contiene los datos utilizados para seleccionar y optimizar los modelos.

## Propósito

Evaluar configuraciones durante el desarrollo sin utilizar todavía el conjunto de prueba final.

## Usos

- Ajuste de hiperparámetros.
- Comparación de configuraciones.
- Selección de características.
- Revisión de sobreajuste.
- Selección preliminar del modelo.
- Evaluación de estabilidad.

## Archivos posibles

~~~text
X_validation.csv
y_validation.csv
validation.csv
validation_metadata.json
~~~

## Reglas

- No utilizar estos datos como entrenamiento principal.
- No presentar sus métricas como resultado final.
- Mantenerlos separados del conjunto de prueba.
- Aplicar el mismo preprocesamiento aprendido con entrenamiento.
- Documentar cualquier decisión tomada a partir de estos datos.

---