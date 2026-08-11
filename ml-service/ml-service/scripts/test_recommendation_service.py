from app.services.recommendation_service import (
    generate_recommendations,
)


def main() -> None:
    features = {
        "water_glasses": 5,
        "exercise_minutes": 15,
        "sleep_hours": 5.5,
        "healthy_meals_count": 2,
        "meditation_minutes": 5,
        "stress_level": 8,
        "energy_level": 4,
        "sleep_quality": 4,
    }

    recommendations = (
        generate_recommendations(
            features=features,
            risk_level="medium",
            wellbeing_score=58.5,
        )
    )

    print()
    print("=" * 65)
    print("RECOMENDACIONES PREVENTIVAS DE VITALMIND AI")
    print("=" * 65)

    for index, recommendation in enumerate(
        recommendations,
        start=1,
    ):
        print(
            f"{index}. {recommendation}"
        )

    print()
    print(
        f"Total: {len(recommendations)}"
    )

    print("=" * 65)


if __name__ == "__main__":
    main()