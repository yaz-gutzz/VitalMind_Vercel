USE vitalmind;

-- ============================================================
-- LIMPIAR DATOS ANTERIORES DE PRUEBA DE YAZMIN
-- user_id = 10
-- ============================================================

DELETE FROM medication_logs
WHERE user_id = 10;

DELETE FROM symptom_logs
WHERE user_id = 10;

DELETE FROM emotional_logs
WHERE user_id = 10;

DELETE FROM habit_logs
WHERE user_id = 10;

DELETE FROM health_metrics
WHERE user_id = 10;


-- ============================================================
-- HEALTH METRICS
-- Últimos 30 días
-- ============================================================

INSERT INTO health_metrics
(
    user_id,
    metric_date,
    water_l,
    steps,
    sleep_hours,
    weight_kg,
    wellness_score
)
SELECT
    10,
    d,
    ROUND(
        CASE
            WHEN DATEDIFF(CURDATE(), d) > 21 THEN 1.20 + (DAY(d) % 4) * 0.10
            WHEN DATEDIFF(CURDATE(), d) > 14 THEN 1.45 + (DAY(d) % 5) * 0.10
            WHEN DATEDIFF(CURDATE(), d) > 7 THEN 1.65 + (DAY(d) % 4) * 0.10
            ELSE 1.80 + (DAY(d) % 4) * 0.08
        END,
        2
    ),
    CASE
        WHEN DATEDIFF(CURDATE(), d) > 21 THEN 2800 + (DAY(d) % 6) * 450
        WHEN DATEDIFF(CURDATE(), d) > 14 THEN 4200 + (DAY(d) % 7) * 500
        WHEN DATEDIFF(CURDATE(), d) > 7 THEN 5600 + (DAY(d) % 8) * 550
        ELSE 6800 + (DAY(d) % 7) * 450
    END,
    ROUND(
        CASE
            WHEN DATEDIFF(CURDATE(), d) > 21 THEN 5.40 + (DAY(d) % 5) * 0.15
            WHEN DATEDIFF(CURDATE(), d) > 14 THEN 5.90 + (DAY(d) % 5) * 0.15
            WHEN DATEDIFF(CURDATE(), d) > 7 THEN 6.40 + (DAY(d) % 5) * 0.14
            ELSE 6.80 + (DAY(d) % 5) * 0.12
        END,
        2
    ),
    ROUND(
        50.60 - (DATEDIFF(CURDATE(), d) * 0.02),
        2
    ),
    CASE
        WHEN DATEDIFF(CURDATE(), d) > 21 THEN 48 + (DAY(d) % 6)
        WHEN DATEDIFF(CURDATE(), d) > 14 THEN 55 + (DAY(d) % 8)
        WHEN DATEDIFF(CURDATE(), d) > 7 THEN 63 + (DAY(d) % 7)
        ELSE 70 + (DAY(d) % 8)
    END
FROM (
    SELECT DATE_SUB(CURDATE(), INTERVAL n DAY) AS d
    FROM (
        SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL
        SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL
        SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL
        SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL
        SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL
        SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL
        SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20 UNION ALL
        SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL
        SELECT 24 UNION ALL SELECT 25 UNION ALL SELECT 26 UNION ALL
        SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29
    ) nums
) dates
ORDER BY d;


-- ============================================================
-- HABITS
-- Cada día tiene 5 hábitos
-- ============================================================

INSERT INTO habit_logs
(
    user_id,
    habit_key,
    log_date,
    value,
    goal
)
SELECT
    10,
    habit_key,
    d,
    CASE habit_key

        WHEN 'water' THEN
            ROUND(
                CASE
                    WHEN DATEDIFF(CURDATE(), d) > 21 THEN 1.20 + (DAY(d) % 4) * 0.10
                    WHEN DATEDIFF(CURDATE(), d) > 14 THEN 1.45 + (DAY(d) % 5) * 0.10
                    WHEN DATEDIFF(CURDATE(), d) > 7 THEN 1.65 + (DAY(d) % 4) * 0.10
                    ELSE 1.80 + (DAY(d) % 4) * 0.08
                END,
                2
            )

        WHEN 'exercise' THEN
            CASE
                WHEN DATEDIFF(CURDATE(), d) > 21 THEN 15 + (DAY(d) % 4) * 5
                WHEN DATEDIFF(CURDATE(), d) > 14 THEN 25 + (DAY(d) % 5) * 5
                WHEN DATEDIFF(CURDATE(), d) > 7 THEN 30 + (DAY(d) % 4) * 5
                ELSE 40 + (DAY(d) % 5) * 5
            END

        WHEN 'sleep' THEN
            ROUND(
                CASE
                    WHEN DATEDIFF(CURDATE(), d) > 21 THEN 5.5 + (DAY(d) % 4) * 0.15
                    WHEN DATEDIFF(CURDATE(), d) > 14 THEN 6.0 + (DAY(d) % 4) * 0.15
                    WHEN DATEDIFF(CURDATE(), d) > 7 THEN 6.5 + (DAY(d) % 4) * 0.15
                    ELSE 6.9 + (DAY(d) % 4) * 0.15
                END,
                2
            )

        WHEN 'nutrition' THEN
            CASE
                WHEN DATEDIFF(CURDATE(), d) > 21 THEN 2 + (DAY(d) % 2)
                WHEN DATEDIFF(CURDATE(), d) > 14 THEN 3
                WHEN DATEDIFF(CURDATE(), d) > 7 THEN 3 + (DAY(d) % 2)
                ELSE 4
            END

        WHEN 'meditation' THEN
            CASE
                WHEN DAY(d) % 3 = 0 THEN 0
                WHEN DAY(d) % 2 = 0 THEN 5
                ELSE 10
            END

    END,

    CASE habit_key
        WHEN 'water' THEN 2.00
        WHEN 'exercise' THEN 45.00
        WHEN 'sleep' THEN 8.00
        WHEN 'nutrition' THEN 5.00
        WHEN 'meditation' THEN 10.00
    END

FROM (
    SELECT DATE_SUB(CURDATE(), INTERVAL n DAY) AS d
    FROM (
        SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL
        SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL
        SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL
        SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL
        SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL
        SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL
        SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20 UNION ALL
        SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL
        SELECT 24 UNION ALL SELECT 25 UNION ALL SELECT 26 UNION ALL
        SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29
    ) nums
) dates
CROSS JOIN (
    SELECT 'water' AS habit_key
    UNION ALL SELECT 'exercise'
    UNION ALL SELECT 'sleep'
    UNION ALL SELECT 'nutrition'
    UNION ALL SELECT 'meditation'
) habits
ORDER BY d, habit_key;


-- ============================================================
-- ESTADO EMOCIONAL
-- Últimos 30 días
-- ============================================================

INSERT INTO emotional_logs
(
    user_id,
    mood,
    stress_level,
    energy_level,
    sleep_quality,
    notes,
    log_date
)
SELECT
    10,

    CASE
        WHEN DATEDIFF(CURDATE(), d) > 21 THEN 'Regular'
        WHEN DATEDIFF(CURDATE(), d) > 14 THEN
            CASE
                WHEN DAY(d) % 4 = 0 THEN 'Mal'
                ELSE 'Regular'
            END
        WHEN DATEDIFF(CURDATE(), d) > 7 THEN
            CASE
                WHEN DAY(d) % 3 = 0 THEN 'Regular'
                ELSE 'Bien'
            END
        ELSE
            CASE
                WHEN DAY(d) % 4 = 0 THEN 'Bien'
                ELSE 'Muy bien'
            END
    END,

    CASE
        WHEN DATEDIFF(CURDATE(), d) > 21 THEN 8 - (DAY(d) % 2)
        WHEN DATEDIFF(CURDATE(), d) > 14 THEN 7 - (DAY(d) % 2)
        WHEN DATEDIFF(CURDATE(), d) > 7 THEN 5 + (DAY(d) % 2)
        ELSE 3 + (DAY(d) % 2)
    END,

    CASE
        WHEN DATEDIFF(CURDATE(), d) > 21 THEN 3 + (DAY(d) % 2)
        WHEN DATEDIFF(CURDATE(), d) > 14 THEN 4 + (DAY(d) % 2)
        WHEN DATEDIFF(CURDATE(), d) > 7 THEN 5 + (DAY(d) % 2)
        ELSE 7
    END,

    CASE
        WHEN DATEDIFF(CURDATE(), d) > 21 THEN 4 + (DAY(d) % 2)
        WHEN DATEDIFF(CURDATE(), d) > 14 THEN 5 + (DAY(d) % 2)
        WHEN DATEDIFF(CURDATE(), d) > 7 THEN 6 + (DAY(d) % 2)
        ELSE 7 + (DAY(d) % 2)
    END,

    CASE
        WHEN DATEDIFF(CURDATE(), d) > 21
            THEN 'Semana con más estrés y descanso irregular.'
        WHEN DATEDIFF(CURDATE(), d) > 14
            THEN 'Mejorando poco a poco la rutina.'
        WHEN DATEDIFF(CURDATE(), d) > 7
            THEN 'He tenido días con mejor energía.'
        ELSE
            'Me siento mejor y estoy manteniendo una rutina más estable.'
    END,

    d

FROM (
    SELECT DATE_SUB(CURDATE(), INTERVAL n DAY) AS d
    FROM (
        SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL
        SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL
        SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL
        SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL
        SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL
        SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL
        SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20 UNION ALL
        SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL
        SELECT 24 UNION ALL SELECT 25 UNION ALL SELECT 26 UNION ALL
        SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29
    ) nums
) dates
ORDER BY d;


-- ============================================================
-- SÍNTOMAS
-- Solo algunos días para que el historial sea creíble.
-- ============================================================

INSERT INTO symptom_logs
(
    user_id,
    pain,
    temperature,
    systolic,
    diastolic,
    glucose,
    weight,
    heart_rate,
    mood,
    notes,
    created_at
)
VALUES
(
    10,
    3,
    36.7,
    118,
    76,
    96,
    50.4,
    78,
    'Regular',
    'Dolor de cabeza leve después de una jornada pesada.',
    DATE_SUB(CURDATE(), INTERVAL 27 DAY)
),
(
    10,
    2,
    36.6,
    116,
    74,
    91,
    50.3,
    76,
    'Bien',
    'Ligero cansancio durante la tarde.',
    DATE_SUB(CURDATE(), INTERVAL 22 DAY)
),
(
    10,
    4,
    36.8,
    120,
    78,
    99,
    50.2,
    80,
    'Regular',
    'Dolor muscular leve después de ejercicio.',
    DATE_SUB(CURDATE(), INTERVAL 17 DAY)
),
(
    10,
    3,
    36.6,
    117,
    75,
    94,
    50.1,
    77,
    'Bien',
    'Dolor de cabeza ocasional.',
    DATE_SUB(CURDATE(), INTERVAL 11 DAY)
),
(
    10,
    2,
    36.5,
    115,
    73,
    92,
    50.0,
    75,
    'Bien',
    'Sin molestias importantes.',
    DATE_SUB(CURDATE(), INTERVAL 6 DAY)
),
(
    10,
    1,
    36.5,
    114,
    72,
    90,
    49.9,
    74,
    'Muy bien',
    'Mejor sensación general durante el día.',
    DATE_SUB(CURDATE(), INTERVAL 2 DAY)
);


-- ============================================================
-- TOMAS DE MEDICAMENTOS
-- Últimos 30 días
--
-- Medicamentos:
-- 7  Metformina
-- 8  Losartán
-- 9  Vitamina D
-- 10 Omega 3
-- 11 Salbutamol PRN
--
-- No todos los días se toma todo:
-- esto permitirá probar adherencia.
-- ============================================================

INSERT INTO medication_logs
(
    medication_id,
    user_id,
    taken_date,
    taken_time,
    taken
)
SELECT
    medication_id,
    10,
    d,
    taken_time,
    1
FROM (
    SELECT
        7 AS medication_id,
        DATE_SUB(CURDATE(), INTERVAL n DAY) AS d,
        '08:00:00' AS taken_time,
        n
    FROM (
        SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL
        SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL
        SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL
        SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL
        SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL
        SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL
        SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20 UNION ALL
        SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL
        SELECT 24 UNION ALL SELECT 25 UNION ALL SELECT 26 UNION ALL
        SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29
    ) nums
) metformina
WHERE MOD(n, 9) <> 0

UNION ALL

SELECT
    8,
    10,
    DATE_SUB(CURDATE(), INTERVAL n DAY),
    '08:00:00',
    1
FROM (
    SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL
    SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL
    SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL
    SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL
    SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL
    SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL
    SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20 UNION ALL
    SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL
    SELECT 24 UNION ALL SELECT 25 UNION ALL SELECT 26 UNION ALL
    SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29
) nums
WHERE MOD(n, 7) <> 0

UNION ALL

SELECT
    9,
    10,
    DATE_SUB(CURDATE(), INTERVAL n DAY),
    '12:00:00',
    1
FROM (
    SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL
    SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL
    SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL
    SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL
    SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL
    SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL
    SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20 UNION ALL
    SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL
    SELECT 24 UNION ALL SELECT 25 UNION ALL SELECT 26 UNION ALL
    SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29
) nums
WHERE MOD(n, 6) <> 0

UNION ALL

SELECT
    10,
    10,
    DATE_SUB(CURDATE(), INTERVAL n DAY),
    '13:00:00',
    1
FROM (
    SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL
    SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL
    SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL
    SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL
    SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL
    SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL
    SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20 UNION ALL
    SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL
    SELECT 24 UNION ALL SELECT 25 UNION ALL SELECT 26 UNION ALL
    SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29
) nums
WHERE MOD(n, 5) <> 0;


-- ============================================================
-- ACTUALIZAR ESTADO "taken" DE MEDICAMENTOS
-- ============================================================

UPDATE medications
SET taken = 1
WHERE id IN (7, 8, 9, 10)
  AND user_id = 10;


-- ============================================================
-- RESULTADO
-- ============================================================

SELECT
    'health_metrics' AS tabla,
    COUNT(*) AS registros
FROM health_metrics
WHERE user_id = 10

UNION ALL

SELECT
    'habit_logs',
    COUNT(*)
FROM habit_logs
WHERE user_id = 10

UNION ALL

SELECT
    'emotional_logs',
    COUNT(*)
FROM emotional_logs
WHERE user_id = 10

UNION ALL

SELECT
    'symptom_logs',
    COUNT(*)
FROM symptom_logs
WHERE user_id = 10

UNION ALL

SELECT
    'medication_logs',
    COUNT(*)
FROM medication_logs
WHERE user_id = 10;
