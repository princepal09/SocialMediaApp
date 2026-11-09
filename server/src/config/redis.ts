import { createClient } from "redis";
import { env } from "../constants.js";

export const redisClient = createClient({
  url: env.REDIS_URL,
  disableOfflineQueue: true,
  socket: {
    connectTimeout: 5_000,
    reconnectStrategy: (retries) => retries >= 5 ? false : Math.min(500 * (retries + 1), 2_000),
  },
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

export const connectRedis = () => redisClient.connect();
