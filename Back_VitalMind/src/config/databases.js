import mysql from "mysql2/promise";
import { env } from "./env.js";
import { seedInitialData } from "../seeds/seedInitialData.js";

let mysqlPool = null;

// Agrega columnas a una tabla solo si todavía no existen,
// consultando information_schema.
async function ensureColumns(pool, table, columns) {
  const [existingRows] = await pool.query(
    `SELECT COLUMN_NAME AS name
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?`,
    [table]
  );

  const existing = new Set(existingRows.map((r) => r.name));
  const missing = columns.filter((column) => !existing.has(column.name));

  if (!missing.length) {
    return;
  }

  const alterSql = `
    ALTER TABLE ${table}
    ${missing
      .map((column) => `ADD COLUMN ${column.name} ${column.ddl}`)
      .join(", ")}
  `;

  await pool.query(alterSql);
}

export async function connectDatabases() {
  if (!mysqlPool) {
    const adminConnection = await mysql.createConnection({
      host: env.MYSQL_HOST,
      port: env.MYSQL_PORT,
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      connectTimeout: env.MYSQL_CONNECT_TIMEOUT_MS,
    });

    await adminConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.MYSQL_DATABASE}\`
       CHARACTER SET utf8mb4
       COLLATE utf8mb4_unicode_ci`
    );

    await adminConnection.end();

    mysqlPool = mysql.createPool({
      host: env.MYSQL_HOST,
      port: env.MYSQL_PORT,
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      database: env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
      decimalNumbers: true,
      connectTimeout: env.MYSQL_CONNECT_TIMEOUT_MS,
    });

    await mysqlPool.query("SELECT 1");

    /*
    |--------------------------------------------------------------------------
    | USERS
    |--------------------------------------------------------------------------
    */

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        full_name VARCHAR(120) NOT NULL,
        email VARCHAR(160) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        age INT NOT NULL DEFAULT 0,
        joined_label VARCHAR(40) NULL,
        last_active_label VARCHAR(40) NULL,
        status ENUM('active','inactive','pending') NOT NULL DEFAULT 'pending',
        registros INT NOT NULL DEFAULT 0,
        consultas INT NOT NULL DEFAULT 0,
        color VARCHAR(20) NOT NULL DEFAULT '#0F766E',
        role ENUM('admin','patient','caregiver') NOT NULL DEFAULT 'patient',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      )
    `);

    /*
    |--------------------------------------------------------------------------
    | USERS - CAMPOS ADICIONALES
    |--------------------------------------------------------------------------
    */

    await ensureColumns(mysqlPool, "users", [
      { name: "blood_type", ddl: "VARCHAR(5) NULL" },
      { name: "phone", ddl: "VARCHAR(30) NULL" },
      { name: "weight_kg", ddl: "DECIMAL(5,1) NULL" },
      { name: "height_cm", ddl: "DECIMAL(5,1) NULL" },
      { name: "last_active_at", ddl: "DATETIME NULL" },
    ]);

    /*
    |--------------------------------------------------------------------------
    | MEDICATIONS
    |--------------------------------------------------------------------------
    */

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS medications (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NULL,

        name VARCHAR(120) NOT NULL,
        dose VARCHAR(80) NOT NULL,
        frequency VARCHAR(80) NOT NULL,
        time_label VARCHAR(80) NOT NULL,

        color VARCHAR(20) NOT NULL DEFAULT '#0F766E',

        taken TINYINT(1) NOT NULL DEFAULT 0,

        days_duration INT NOT NULL DEFAULT 0,

        type ENUM(
          'pastilla',
          'capsula',
          'jarabe',
          'inyeccion',
          'tableta',
          'gota',
          'crema',
          'parche'
        ) NOT NULL DEFAULT 'pastilla',

        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (id),

        CONSTRAINT fk_medications_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      )
    `);

    /*
    |--------------------------------------------------------------------------
    | MEDICATION LOGS
    |--------------------------------------------------------------------------
    */

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS medication_logs (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        medication_id BIGINT UNSIGNED NOT NULL,
        user_id BIGINT UNSIGNED NULL,

        taken_date DATE NOT NULL,
        taken_time TIME NOT NULL,

        taken TINYINT(1) NOT NULL DEFAULT 1,

        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

        PRIMARY KEY (id),

        UNIQUE KEY uq_medication_day_time (
          medication_id,
          taken_date,
          taken_time
        ),

        FOREIGN KEY (medication_id)
          REFERENCES medications(id)
          ON DELETE CASCADE,

        FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      )
    `);

    /*
    |--------------------------------------------------------------------------
    | APPOINTMENTS
    |--------------------------------------------------------------------------
    */

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NULL,

        specialty VARCHAR(120) NOT NULL,
        doctor VARCHAR(120) NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time VARCHAR(10) NOT NULL,
        place VARCHAR(160) NOT NULL,

        color VARCHAR(20) NOT NULL DEFAULT '#0F766E',

        status ENUM(
          'proxima',
          'completada',
          'cancelada'
        ) NOT NULL DEFAULT 'proxima',

        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (id),

        CONSTRAINT fk_appointments_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      )
    `);

    /*
    |--------------------------------------------------------------------------
    | REFRESH TOKENS
    |--------------------------------------------------------------------------
    */

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,

        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,

        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        PRIMARY KEY (id),

        CONSTRAINT fk_refresh_tokens_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      )
    `);

    /*
    |--------------------------------------------------------------------------
    | NOTIFICATIONS
    |--------------------------------------------------------------------------
    */

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NULL,

        kind ENUM(
          'tip',
          'reminder',
          'ai',
          'alert'
        ) NOT NULL DEFAULT 'tip',

        title VARCHAR(180) NOT NULL,
        body TEXT NOT NULL,
        time_label VARCHAR(80) NOT NULL DEFAULT 'Ahora',

        is_read TINYINT(1) NOT NULL DEFAULT 0,

        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (id),

        CONSTRAINT fk_notifications_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      )
    `);

    /*
    |--------------------------------------------------------------------------
    | MEDICAL HISTORY
    |--------------------------------------------------------------------------
    */

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS medical_history_items (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,

        category ENUM(
          'diseases',
          'allergies',
          'medications',
          'surgeries',
          'consultations',
          'vaccines',
          'results'
        ) NOT NULL,

        description VARCHAR(255) NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_medical_history_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      )
    `);

    /*
    |--------------------------------------------------------------------------
    | HABIT LOGS
    |--------------------------------------------------------------------------
    */

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS habit_logs (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT UNSIGNED NOT NULL,

        log_date DATE NOT NULL,

        water DECIMAL(6,2) NOT NULL DEFAULT 0,
        exercise DECIMAL(6,2) NOT NULL DEFAULT 0,
        sleep DECIMAL(6,2) NOT NULL DEFAULT 0,
        nutrition DECIMAL(6,2) NOT NULL DEFAULT 0,
        meditation DECIMAL(6,2) NOT NULL DEFAULT 0,

        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (id),

        UNIQUE KEY uq_habit_user_date (
          user_id,
          log_date
        ),

        CONSTRAINT fk_habit_logs_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      )
    `);

    /*
    |--------------------------------------------------------------------------
    | AUDIT LOGS
    |--------------------------------------------------------------------------
    */

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

        actor_id BIGINT UNSIGNED NULL,

        action VARCHAR(120) NOT NULL,
        entity VARCHAR(120) NOT NULL,
        entity_id VARCHAR(120) NULL,

        payload LONGTEXT NOT NULL,

        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        PRIMARY KEY (id),

        CONSTRAINT fk_audit_logs_actor
          FOREIGN KEY (actor_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      )
    `);

    /*
    |--------------------------------------------------------------------------
    | SYMPTOM LOGS
    |--------------------------------------------------------------------------
    */

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS symptom_logs (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

        user_id BIGINT UNSIGNED NULL,

        pain INT NOT NULL DEFAULT 0,
        temperature DECIMAL(4,1) NULL,
        systolic INT NULL,
        diastolic INT NULL,
        glucose INT NULL,
        weight DECIMAL(5,1) NULL,
        heart_rate INT NULL,

        mood ENUM(
          'Muy bien',
          'Bien',
          'Regular',
          'Mal',
          'Muy mal'
        ) NULL,

        notes TEXT NULL,

        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        PRIMARY KEY (id),

        CONSTRAINT fk_symptom_logs_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      )
    `);

    /*
    |--------------------------------------------------------------------------
    | EMOTIONAL LOGS
    |--------------------------------------------------------------------------
    */

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS emotional_logs (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

        user_id BIGINT UNSIGNED NOT NULL,

        mood ENUM(
          'Muy bien',
          'Bien',
          'Regular',
          'Mal',
          'Muy mal'
        ) NOT NULL,

        stress_level TINYINT UNSIGNED NOT NULL,
        energy_level TINYINT UNSIGNED NOT NULL,
        sleep_quality TINYINT UNSIGNED NOT NULL,

        notes TEXT NULL,

        log_date DATE NOT NULL,

        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (id),

        UNIQUE KEY uq_emotional_logs_user_day (
          user_id,
          log_date
        ),

        CONSTRAINT fk_emotional_logs_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE,

        CONSTRAINT chk_emotional_stress
          CHECK (stress_level BETWEEN 1 AND 10),

        CONSTRAINT chk_emotional_energy
          CHECK (energy_level BETWEEN 1 AND 10),

        CONSTRAINT chk_emotional_sleep_quality
          CHECK (sleep_quality BETWEEN 1 AND 10)
      )
    `);

    /*
    |--------------------------------------------------------------------------
    | CHAT CONVERSATIONS
    |--------------------------------------------------------------------------
    |
    | Una conversación pertenece a un usuario.
    | No usamos userName/email para relacionarla:
    | usamos el ID real del usuario autenticado.
    |
    */

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

        user_id BIGINT UNSIGNED NOT NULL,

        title VARCHAR(150) NOT NULL
          DEFAULT 'Conversación de VitalMind',

        created_at TIMESTAMP NOT NULL
          DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP NOT NULL
          DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (id),

        KEY idx_chat_conversations_user_id (user_id),

        CONSTRAINT fk_chat_conversations_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
        COLLATE=utf8mb4_unicode_ci
    `);

    /*
    |--------------------------------------------------------------------------
    | CHAT MESSAGES
    |--------------------------------------------------------------------------
    |
    | Guarda tanto mensajes del usuario como respuestas de VitalMind AI.
    |
    */

    await mysqlPool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

        conversation_id BIGINT UNSIGNED NOT NULL,

        role ENUM(
          'user',
          'assistant'
        ) NOT NULL,

        content TEXT NOT NULL,

        created_at TIMESTAMP NOT NULL
          DEFAULT CURRENT_TIMESTAMP,

        PRIMARY KEY (id),

        KEY idx_chat_messages_conversation_id (
          conversation_id
        ),

        KEY idx_chat_messages_created_at (
          created_at
        ),

        CONSTRAINT fk_chat_messages_conversation
          FOREIGN KEY (conversation_id)
          REFERENCES chat_conversations(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
        COLLATE=utf8mb4_unicode_ci
    `);
  }

  /*
  |--------------------------------------------------------------------------
  | DATOS INICIALES
  |--------------------------------------------------------------------------
  */

  await seedInitialData();
}

/*
|--------------------------------------------------------------------------
| MYSQL POOL
|--------------------------------------------------------------------------
*/

export function getMySqlPool() {
  if (!mysqlPool) {
    throw new Error("MySQL pool is not initialized");
  }

  return mysqlPool;
}

/*
|--------------------------------------------------------------------------
| DATABASE STATUS
|--------------------------------------------------------------------------
*/

export function getDatabaseStatus() {
  return {
    mysql: {
      connected: Boolean(mysqlPool),
    },
  };
}