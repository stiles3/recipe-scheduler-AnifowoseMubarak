import IORedis from "ioredis";

export const redis = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
});

export async function clearRedis() {
  try {
    await redis.flushall();
  } catch (error) {
    console.error("Error clearing Redis:", error);
  }
}
