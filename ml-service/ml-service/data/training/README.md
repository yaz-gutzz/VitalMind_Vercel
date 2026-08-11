# Conjunto de entrenamiento

Esta carpeta almacena los datos utilizados para entrenar los modelos de Machine Learning.

## Propósito

Proporcionar el conjunto principal con el que los algoritmos aprenderán patrones y relaciones.

## Contenido esperado

- Variables de entrada.
- Variables objetivo.
- Dataset completo de entrenamiento.
- Información sobre la proporción utilizada.
- Registro de la semilla.
- Distribución de clases.

## Archivos posibles

~~~text
X_train.csv
y_train.csv
train.csv
training_metadata.json
~~~

## Reglas

- No mezclar con validación o prueba.
- No incluir variables que revelen directamente el resultado.
- Aplicar transformaciones aprendidas únicamente con entrenamiento.
- Registrar la semilla utilizada.
- Verificar el balance de clases.
- Documentar la proporción.
- No utilizar el conjunto de prueba durante el entrenamiento.

---