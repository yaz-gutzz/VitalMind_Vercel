# Conjunto de prueba

Esta carpeta contiene los datos reservados para la evaluación final de los modelos.

## Propósito

Medir la capacidad de generalización del modelo seleccionado con datos que no se utilizaron durante el entrenamiento ni la optimización.

## Usos

- Obtener métricas finales.
- Generar la matriz de confusión final.
- Evaluar la capacidad de generalización.
- Comparar predicciones con valores reales.
- Validar el modelo seleccionado.

## Archivos posibles

~~~text
X_test.csv
y_test.csv
test.csv
test_metadata.json
~~~

## Reglas

- No utilizar para entrenar.
- No utilizar para ajustar hiperparámetros.
- No revisar repetidamente para modificar el modelo.
- Aplicar exactamente el mismo preprocesamiento.
- Conservar los resultados como evidencia final.
- Documentar cualquier limitación encontrada.

---