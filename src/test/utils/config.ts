export const API_URL = process.env.API_URL || "http://localhost:3000";
export const DYNAMODB_ENDPOINT =
  process.env.DYNAMODB_ENDPOINT || "http://localhost:8000";
export const REDIS_HOST = process.env.REDIS_HOST || "localhost";
export const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");
