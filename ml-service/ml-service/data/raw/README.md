# Datos originales

Esta carpeta almacena los datos originales utilizados por VitalMind AI.

## Propósito

Conservar una copia sin modificaciones de los datos recopilados, importados o generados.

## Contenido esperado

- Dataset original.
- Datos simulados sin procesar.
- Archivos CSV.
- Archivos JSON.
- Datos exportados de una fuente autorizada.
- Información sobre la procedencia de los datos.

## Reglas

- No editar manualmente los archivos.
- No reemplazar archivos sin registrar el cambio.
- Conservar nombres descriptivos.
- Documentar la fuente.
- Registrar la fecha de generación o recopilación.
- No incluir datos personales sensibles.
- Mantener una copia original antes de cualquier transformación.

## Ejemplo de nombres

~~~text
vitalmind_dataset_raw_v1.csv
vitalmind_habitos_raw_v1.csv
vitalmind_emociones_raw_v1.csv
~~~

## Nota

Las transformaciones deben realizarse mediante scripts y sus resultados deben guardarse en `data/processed/`.

---