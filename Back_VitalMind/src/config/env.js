import dotenv from "dotenv";

dotenv.config();

const required = (value, fallback) => (value && String(value).trim() ? String(value).trim() : fallback);

export const env = {
  NODE_ENV: required(process.env.NODE_ENV, "development"),
  PORT: Number(required(process.env.PORT, "4000")),
  CORS_ORIGIN: required(process.env.CORS_ORIGIN, "*"),
  JWT_SECRET: required(process.env.JWT_SECRET, "dev-secret-change-me"),
  JWT_EXPIRES_IN: required(process.env.JWT_EXPIRES_IN, "7d"),
  MYSQL_HOST: required(process.env.MYSQL_HOST, "127.0.0.1"),
  MYSQL_PORT: Number(required(process.env.MYSQL_PORT, "3306")),
  MYSQL_USER: required(process.env.MYSQL_USER, "root"),
  MYSQL_PASSWORD: required(process.env.MYSQL_PASSWORD, "1234"),
  MYSQL_DATABASE: required(process.env.MYSQL_DATABASE, "vitalmind"),
  MYSQL_CONNECT_TIMEOUT_MS: Number(required(process.env.MYSQL_CONNECT_TIMEOUT_MS, "5000")),
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? String(process.env.ANTHROPIC_API_KEY).trim() : "",
};
