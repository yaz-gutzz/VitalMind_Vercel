# Aplicación del módulo de Machine Learning

Esta carpeta contiene los componentes principales utilizados para desarrollar, entrenar, evaluar y preparar los modelos de Machine Learning de VitalMind AI.

## Propósito

Centralizar los recursos técnicos del módulo de Machine Learning y mantener separados los modelos entrenados, los notebooks y las funciones reutilizables.

## Estructura

~~~text
app/
├── README.md
├── models/
│   └── README.md
├── notebooks/
│   └── README.md
└── utils/
    └── README.md
~~~

## Subcarpetas

### `models/`

Almacena los modelos entrenados y serializados, así como los artefactos necesarios para realizar predicciones.

### `notebooks/`

Contiene los notebooks utilizados para la exploración, preparación, entrenamiento, evaluación y comparación de modelos.

### `utils/`

Incluye funciones reutilizables para limpieza, validación, transformación, evaluación y carga de archivos.

## Reglas

- No incluir endpoints.
- No incluir rutas de API.
- No incluir controladores.
- No incluir autenticación.
- No incluir lógica de Backend.
- Mantener el código organizado y documentado.
- Evitar duplicar funciones entre notebooks.
- Utilizar nombres descriptivos para archivos y funciones.

## Responsabilidad

El contenido de esta carpeta pertenece únicamente al módulo de Machine Learning.

La integración de los modelos con el sistema corresponde al equipo de Backend.

---