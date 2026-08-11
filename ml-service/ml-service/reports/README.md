# Reportes y resultados

Esta carpeta almacena los resultados generados durante el análisis y la evaluación de los modelos.

## Propósito

Conservar evidencia clara de las métricas, comparaciones, gráficas y decisiones utilizadas para seleccionar los modelos finales.

## Contenido esperado

- Métricas de clasificación.
- Métricas de regresión.
- Matrices de confusión.
- Curvas ROC.
- Curvas de aprendizaje.
- Importancia de variables.
- Comparaciones entre modelos.
- Resultados del recomendador.
- Resultados de análisis emocional.
- Resultados de anomalías.
- Gráficas finales.
- Tablas comparativas.
- Conclusiones técnicas.

## Estructura sugerida

~~~text
reports/
├── README.md
├── classification/
├── regression/
├── recommendation/
├── emotional-analysis/
├── anomaly-detection/
└── comparisons/
~~~

Cuando estas subcarpetas sean creadas, cada una deberá incluir su propio `README.md`.

## Formatos permitidos

- `.csv`
- `.json`
- `.md`
- `.png`
- `.jpg`
- `.pdf`

## Reglas

- Utilizar nombres descriptivos.
- Incluir la versión del modelo.
- Indicar el conjunto de datos evaluado.
- No mostrar únicamente métricas sin interpretación.
- Documentar limitaciones.
- Mantener trazabilidad entre resultados y modelos.
- Evitar sobrescribir resultados anteriores.

---