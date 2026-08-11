# Datos procesados

Esta carpeta contiene los datos después de aplicar limpieza, validación y transformación.

## Propósito

Almacenar conjuntos de datos consistentes y adecuados para el análisis y el entrenamiento de modelos.

## Procesos posibles

- Eliminación de duplicados.
- Tratamiento de valores nulos.
- Corrección de tipos.
- Validación de rangos.
- Codificación de variables categóricas.
- Normalización.
- Estandarización.
- Ingeniería de características.
- Eliminación o tratamiento de valores atípicos.
- Selección de columnas.
- Anonimización.

## Contenido esperado

- Dataset limpio.
- Dataset transformado.
- Dataset con características nuevas.
- Reporte de calidad.
- Registro de transformaciones.

## Reglas

- No editar manualmente los archivos.
- Generar los datos mediante scripts.
- Documentar cada transformación.
- Mantener trazabilidad con respecto a los datos originales.
- No mezclar datos de entrenamiento y prueba antes de tiempo.
- Evitar aplicar transformaciones que produzcan fuga de información.

## Ejemplo de nombres

~~~text
vitalmind_dataset_processed_v1.csv
vitalmind_dataset_clean_v1.csv
vitalmind_features_v1.csv
~~~

---
