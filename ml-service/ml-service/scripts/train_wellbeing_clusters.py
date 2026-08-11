"""
Entrenamiento del modelo no supervisado de agrupación
de perfiles de bienestar para VitalMind AI.

El script:
- utiliza únicamente el conjunto temporal de entrenamiento;
- agrega los registros diarios por usuario;
- excluye etiquetas y variables derivadas;
- evalúa K-Means con diferentes cantidades de clusters;
- selecciona el mejor número de clusters mediante Silhouette Score;
- genera descripciones estadísticas de cada grupo;
- serializa el pipeline final.

Los clusters representan patrones exploratorios y no diagnósticos.
"""

from __future__ import annotations

from pathlib import Path
import json
import sys
from typing import Any

import joblib
import numpy as np
import pandas as pd

from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import (
    calinski_harabasz_score,
    davies_bouldin_score,
    silhouette_score,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


# ============================================================
# 1. CONFIGURACIÓN
# ============================================================

RANDOM_SEED = 2026

CLUSTER_RANGE = range(2, 7)

MOOD_SCORE_MAP = {
    "muy mal": 1,
    "very_bad": 1,

    "mal": 2,
    "bad": 2,

    "regular": 3,
    "neutral": 3,

    "bien": 4,
    "good": 4,

    "muy bien": 5,
    "very_good": 5,
}

DAILY_NUMERIC_FEATURES = [
    "water_glasses",
    "exercise_minutes",
    "sleep_hours",
    "healthy_meals_count",
    "meditation_minutes",
    "pain",
    "temperature_c",
    "systolic_mmhg",
    "diastolic_mmhg",
    "glucose_mg_dl",
    "heart_rate_bpm",
    "stress_level",
    "energy_level",
    "sleep_quality",
]

STATIC_FEATURES = [
    "age",
    "height_cm",
    "weight_kg",
    "bmi",
]

AGGREGATED_FEATURES = [
    "age",
    "height_cm",
    "weight_kg",
    "bmi",
    "water_glasses_mean",
    "exercise_minutes_mean",
    "sleep_hours_mean",
    "healthy_meals_count_mean",
    "meditation_minutes_mean",
    "pain_mean",
    "temperature_c_mean",
    "systolic_mmhg_mean",
    "diastolic_mmhg_mean",
    "glucose_mg_dl_mean",
    "heart_rate_bpm_mean",
    "stress_level_mean",
    "energy_level_mean",
    "sleep_quality_mean",
    "mood_score_mean",
    "records_count",
]


# ============================================================
# 2. RUTAS
# ============================================================

SCRIPT_PATH = Path(__file__).resolve()
ML_SERVICE_DIR = SCRIPT_PATH.parent.parent

TRAIN_DATA_PATH = (
    ML_SERVICE_DIR
    / "data"
    / "modeling"
    / "train_model.csv"
)

MODELS_DIR = (
    ML_SERVICE_DIR
    / "app"
    / "models"
    / "wellbeing-clustering"
)

REPORTS_DIR = (
    ML_SERVICE_DIR
    / "reports"
    / "clustering"
)

MODEL_PATH = (
    MODELS_DIR
    / "wellbeing_kmeans_pipeline.joblib"
)

METRICS_PATH = (
    REPORTS_DIR
    / "cluster_selection_metrics.csv"
)

ASSIGNMENTS_PATH = (
    REPORTS_DIR
    / "user_cluster_assignments.csv"
)

PROFILES_PATH = (
    REPORTS_DIR
    / "cluster_profiles.csv"
)

SUMMARY_PATH = (
    REPORTS_DIR
    / "clustering_summary.json"
)

PCA_PATH = (
    REPORTS_DIR
    / "cluster_pca_coordinates.csv"
)


# ============================================================
# 3. CARGA Y VALIDACIÓN
# ============================================================

def load_training_data() -> pd.DataFrame:
    """Carga el conjunto temporal de entrenamiento."""
    if not TRAIN_DATA_PATH.exists():
        raise FileNotFoundError(
            "No se encontró el conjunto de entrenamiento:\n"
            f"{TRAIN_DATA_PATH}"
        )

    return pd.read_csv(
        TRAIN_DATA_PATH,
        parse_dates=["log_date"],
    )


def validate_dataset(
    dataset: pd.DataFrame,
) -> None:
    """Valida las columnas requeridas."""
    required_columns = (
        ["user_id", "log_date", "mood"]
        + STATIC_FEATURES
        + DAILY_NUMERIC_FEATURES
    )

    missing_columns = [
        column
        for column in required_columns
        if column not in dataset.columns
    ]

    if missing_columns:
        raise ValueError(
            "Faltan columnas requeridas: "
            f"{missing_columns}"
        )

    if dataset.empty:
        raise ValueError(
            "El conjunto de entrenamiento está vacío."
        )

    missing_values = int(
        dataset[required_columns]
        .isna()
        .sum()
        .sum()
    )

    if missing_values > 0:
        raise ValueError(
            "El dataset conserva "
            f"{missing_values} valores faltantes."
        )

    normalized_moods = (
    dataset["mood"]
    .astype("string")
    .str.strip()
    .str.lower()
)

    invalid_moods = (
        set(normalized_moods.unique())
        - set(MOOD_SCORE_MAP)
    )

    if invalid_moods:
        raise ValueError(
            "Se encontraron estados de ánimo inválidos: "
            f"{sorted(invalid_moods)}"
        )


# ============================================================
# 4. AGREGACIÓN POR USUARIO
# ============================================================

def create_user_profiles(
    dataset: pd.DataFrame,
) -> pd.DataFrame:
    """
    Resume los registros diarios en un perfil por usuario.

    No utiliza risk_level, wellbeing_score, profile_type
    ni otras etiquetas.
    """
    working_data = dataset.copy()

    working_data["mood_normalized"] = (
    working_data["mood"]
    .astype("string")
    .str.strip()
    .str.lower()
)

    working_data["mood_score"] = (
        working_data["mood_normalized"]
        .map(MOOD_SCORE_MAP)
        .astype(float)
    )

    aggregation_rules: dict[str, Any] = {
        "age": "first",
        "height_cm": "first",
        "weight_kg": "mean",
        "bmi": "mean",
        "mood_score": "mean",
        "log_date": "count",
    }

    for feature in DAILY_NUMERIC_FEATURES:
        aggregation_rules[feature] = "mean"

    user_profiles = (
        working_data
        .groupby(
            "user_id",
            as_index=False,
        )
        .agg(aggregation_rules)
    )

    rename_columns = {
        feature: f"{feature}_mean"
        for feature in DAILY_NUMERIC_FEATURES
    }

    rename_columns.update(
        {
            "mood_score": "mood_score_mean",
            "log_date": "records_count",
        }
    )

    user_profiles = user_profiles.rename(
        columns=rename_columns
    )

    for feature in [
        "weight_kg",
        "bmi",
    ]:
        user_profiles[feature] = (
            user_profiles[feature]
            .round(4)
        )

    return user_profiles


def validate_user_profiles(
    profiles: pd.DataFrame,
) -> None:
    """Valida los perfiles agregados."""
    missing_columns = [
        column
        for column in (
            ["user_id"]
            + AGGREGATED_FEATURES
        )
        if column not in profiles.columns
    ]

    if missing_columns:
        raise ValueError(
            "Faltan columnas en los perfiles agregados: "
            f"{missing_columns}"
        )

    if profiles["user_id"].duplicated().any():
        raise ValueError(
            "Existen usuarios duplicados después "
            "de la agregación."
        )

    if profiles[AGGREGATED_FEATURES].isna().any().any():
        raise ValueError(
            "Los perfiles agregados contienen "
            "valores faltantes."
        )


# ============================================================
# 5. EVALUACIÓN DE CLUSTERS
# ============================================================

def evaluate_cluster_candidates(
    features: pd.DataFrame,
) -> pd.DataFrame:
    """Evalúa diferentes cantidades de clusters."""
    scaler = StandardScaler()

    scaled_features = scaler.fit_transform(
        features
    )

    results: list[dict[str, Any]] = []

    for cluster_count in CLUSTER_RANGE:
        model = KMeans(
            n_clusters=cluster_count,
            random_state=RANDOM_SEED,
            n_init=20,
        )

        labels = model.fit_predict(
            scaled_features
        )

        cluster_sizes = (
            pd.Series(labels)
            .value_counts()
        )

        results.append(
            {
                "n_clusters": cluster_count,
                "silhouette_score": float(
                    silhouette_score(
                        scaled_features,
                        labels,
                    )
                ),
                "davies_bouldin_score": float(
                    davies_bouldin_score(
                        scaled_features,
                        labels,
                    )
                ),
                "calinski_harabasz_score": float(
                    calinski_harabasz_score(
                        scaled_features,
                        labels,
                    )
                ),
                "inertia": float(
                    model.inertia_
                ),
                "minimum_cluster_size": int(
                    cluster_sizes.min()
                ),
                "maximum_cluster_size": int(
                    cluster_sizes.max()
                ),
            }
        )

    return pd.DataFrame(results)


def select_best_cluster_count(
    metrics: pd.DataFrame,
) -> int:
    """
    Selecciona la cantidad de clusters.

    Prioridad:
    1. Mayor Silhouette Score.
    2. Menor Davies-Bouldin.
    3. Mayor Calinski-Harabasz.
    """
    ordered_metrics = metrics.sort_values(
        by=[
            "silhouette_score",
            "davies_bouldin_score",
            "calinski_harabasz_score",
        ],
        ascending=[
            False,
            True,
            False,
        ],
    )

    return int(
        ordered_metrics.iloc[0][
            "n_clusters"
        ]
    )


# ============================================================
# 6. ENTRENAMIENTO FINAL
# ============================================================

def build_final_pipeline(
    cluster_count: int,
) -> Pipeline:
    """Construye el pipeline final de K-Means."""
    return Pipeline(
        steps=[
            (
                "scaler",
                StandardScaler(),
            ),
            (
                "clusterer",
                KMeans(
                    n_clusters=cluster_count,
                    random_state=RANDOM_SEED,
                    n_init=20,
                ),
            ),
        ]
    )


def create_cluster_profiles(
    user_profiles: pd.DataFrame,
) -> pd.DataFrame:
    """Resume las características de cada cluster."""
    profile_columns = (
        ["cluster"]
        + AGGREGATED_FEATURES
    )

    cluster_profiles = (
        user_profiles[profile_columns]
        .groupby(
            "cluster",
            as_index=False,
        )
        .mean()
    )

    cluster_sizes = (
        user_profiles["cluster"]
        .value_counts()
        .sort_index()
        .rename("users")
    )

    cluster_profiles = (
        cluster_profiles
        .merge(
            cluster_sizes,
            left_on="cluster",
            right_index=True,
            how="left",
        )
    )

    ordered_columns = [
        "cluster",
        "users",
        *AGGREGATED_FEATURES,
    ]

    return cluster_profiles[
        ordered_columns
    ]


def create_pca_coordinates(
    features: pd.DataFrame,
    user_profiles: pd.DataFrame,
) -> tuple[pd.DataFrame, float]:
    """Reduce los perfiles a dos componentes para visualización."""
    scaler = StandardScaler()

    scaled_features = scaler.fit_transform(
        features
    )

    pca = PCA(
        n_components=2,
        random_state=RANDOM_SEED,
    )

    coordinates = pca.fit_transform(
        scaled_features
    )

    explained_variance = float(
        pca.explained_variance_ratio_.sum()
    )

    pca_dataframe = pd.DataFrame(
        {
            "user_id": user_profiles[
                "user_id"
            ].values,
            "cluster": user_profiles[
                "cluster"
            ].values,
            "pca_component_1": (
                coordinates[:, 0]
            ),
            "pca_component_2": (
                coordinates[:, 1]
            ),
        }
    )

    return (
        pca_dataframe,
        explained_variance,
    )


# ============================================================
# 7. DESCRIPCIÓN AUTOMÁTICA
# ============================================================

def describe_clusters(
    cluster_profiles: pd.DataFrame,
) -> dict[str, Any]:
    """
    Genera comparaciones relativas.

    Los nombres son exploratorios y no clínicos.
    """
    comparison_features = [
        "exercise_minutes_mean",
        "sleep_hours_mean",
        "healthy_meals_count_mean",
        "stress_level_mean",
        "energy_level_mean",
        "sleep_quality_mean",
        "pain_mean",
    ]

    descriptions: dict[str, Any] = {}

    global_means = (
        cluster_profiles[
            comparison_features
        ]
        .mean()
    )

    for _, row in cluster_profiles.iterrows():
        cluster_id = int(
            row["cluster"]
        )

        higher_features = []
        lower_features = []

        for feature in comparison_features:
            difference = (
                row[feature]
                - global_means[feature]
            )

            if difference > 0.25:
                higher_features.append(
                    feature
                )
            elif difference < -0.25:
                lower_features.append(
                    feature
                )

        descriptions[
            str(cluster_id)
        ] = {
            "users": int(row["users"]),
            "relatively_higher_features": (
                higher_features
            ),
            "relatively_lower_features": (
                lower_features
            ),
            "interpretation": (
                "Perfil exploratorio construido por "
                "similitud estadística. No representa "
                "una categoría médica."
            ),
        }

    return descriptions


# ============================================================
# 8. EXPORTACIÓN
# ============================================================

def save_outputs(
    pipeline: Pipeline,
    metrics: pd.DataFrame,
    user_profiles: pd.DataFrame,
    cluster_profiles: pd.DataFrame,
    pca_coordinates: pd.DataFrame,
    summary: dict[str, Any],
) -> None:
    """Guarda el modelo y los reportes."""
    MODELS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    REPORTS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    joblib.dump(
        pipeline,
        MODEL_PATH,
    )

    metrics.to_csv(
        METRICS_PATH,
        index=False,
        encoding="utf-8-sig",
    )

    user_profiles.to_csv(
        ASSIGNMENTS_PATH,
        index=False,
        encoding="utf-8-sig",
    )

    cluster_profiles.to_csv(
        PROFILES_PATH,
        index=False,
        encoding="utf-8-sig",
    )

    pca_coordinates.to_csv(
        PCA_PATH,
        index=False,
        encoding="utf-8-sig",
    )

    with SUMMARY_PATH.open(
        "w",
        encoding="utf-8",
    ) as summary_file:
        json.dump(
            summary,
            summary_file,
            ensure_ascii=False,
            indent=2,
        )


# ============================================================
# 9. PRESENTACIÓN
# ============================================================

def print_results(
    metrics: pd.DataFrame,
    best_cluster_count: int,
    user_profiles: pd.DataFrame,
    cluster_profiles: pd.DataFrame,
    explained_variance: float,
) -> None:
    """Muestra los resultados principales."""
    print("\n" + "=" * 70)
    print("AGRUPACIÓN DE PERFILES DE BIENESTAR")
    print("=" * 70)

    print(
        f"Usuarios analizados: "
        f"{len(user_profiles)}"
    )

    print(
        "Cantidad seleccionada de clusters: "
        f"{best_cluster_count}"
    )

    best_row = metrics[
        metrics["n_clusters"]
        == best_cluster_count
    ].iloc[0]

    print(
        f"Silhouette Score: "
        f"{best_row['silhouette_score']:.4f}"
    )

    print(
        f"Davies-Bouldin Score: "
        f"{best_row['davies_bouldin_score']:.4f}"
    )

    print(
        f"Calinski-Harabasz Score: "
        f"{best_row['calinski_harabasz_score']:.4f}"
    )

    print(
        "Varianza explicada por PCA 2D: "
        f"{explained_variance:.4f}"
    )

    print("\nComparación de cantidades de clusters:")

    print(
        metrics
        .round(4)
        .to_string(index=False)
    )

    print("\nTamaño de los clusters:")

    cluster_sizes = (
        user_profiles["cluster"]
        .value_counts()
        .sort_index()
    )

    print(cluster_sizes.to_string())

    display_columns = [
        "cluster",
        "users",
        "exercise_minutes_mean",
        "sleep_hours_mean",
        "healthy_meals_count_mean",
        "stress_level_mean",
        "energy_level_mean",
        "sleep_quality_mean",
        "pain_mean",
    ]

    print("\nResumen de perfiles:")

    print(
        cluster_profiles[
            display_columns
        ]
        .round(2)
        .to_string(index=False)
    )


# ============================================================
# 10. EJECUCIÓN
# ============================================================

def main() -> None:
    """Ejecuta el entrenamiento de clustering."""
    try:
        training_data = load_training_data()

        validate_dataset(
            training_data
        )

        user_profiles = create_user_profiles(
            training_data
        )

        validate_user_profiles(
            user_profiles
        )

        features = user_profiles[
            AGGREGATED_FEATURES
        ].copy()

        metrics = evaluate_cluster_candidates(
            features
        )

        best_cluster_count = (
            select_best_cluster_count(
                metrics
            )
        )

        final_pipeline = (
            build_final_pipeline(
                best_cluster_count
            )
        )

        cluster_labels = (
            final_pipeline.fit_predict(
                features
            )
        )

        user_profiles["cluster"] = (
            cluster_labels
        )

        cluster_profiles = (
            create_cluster_profiles(
                user_profiles
            )
        )

        pca_coordinates, (
            explained_variance
        ) = create_pca_coordinates(
            features=features,
            user_profiles=user_profiles,
        )

        descriptions = describe_clusters(
            cluster_profiles
        )

        best_metrics = (
            metrics[
                metrics["n_clusters"]
                == best_cluster_count
            ]
            .iloc[0]
            .to_dict()
        )

        summary = {
            "method": "kmeans",
            "data_level": "aggregated_user_profiles",
            "data_source": "training_only",
            "users": int(
                len(user_profiles)
            ),
            "selected_clusters": int(
                best_cluster_count
            ),
            "selected_metrics": {
                key: (
                    int(value)
                    if isinstance(
                        value,
                        (np.integer,)
                    )
                    else float(value)
                )
                for key, value
                in best_metrics.items()
            },
            "pca_explained_variance_2d": (
                explained_variance
            ),
            "features": (
                AGGREGATED_FEATURES
            ),
            "excluded_variables": [
                "risk_level",
                "wellbeing_score",
                "profile_type",
                "is_anomaly",
                "risk_factors_count",
            ],
            "cluster_descriptions": (
                descriptions
            ),
            "limitations": [
                "Synthetic dataset",
                "Exploratory clusters",
                "Not clinically validated",
                "Cluster identifiers have no ordinal meaning",
            ],
        }

        save_outputs(
            pipeline=final_pipeline,
            metrics=metrics,
            user_profiles=user_profiles,
            cluster_profiles=cluster_profiles,
            pca_coordinates=pca_coordinates,
            summary=summary,
        )

        print_results(
            metrics=metrics,
            best_cluster_count=(
                best_cluster_count
            ),
            user_profiles=user_profiles,
            cluster_profiles=(
                cluster_profiles
            ),
            explained_variance=(
                explained_variance
            ),
        )

        print("\nArchivos generados:")
        print(f"- {MODEL_PATH}")
        print(f"- {METRICS_PATH}")
        print(f"- {ASSIGNMENTS_PATH}")
        print(f"- {PROFILES_PATH}")
        print(f"- {SUMMARY_PATH}")
        print(f"- {PCA_PATH}")

        print(
            "\nLa agrupación finalizó "
            "correctamente."
        )

    except Exception as error:
        print(
            "\nError durante la agrupación "
            "de perfiles:"
        )
        print(error)
        sys.exit(1)


if __name__ == "__main__":
    main()