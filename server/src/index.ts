import { createServer } from "node:http";
import { app } from "./app.js";
import dbConnect from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { env } from "./constants.js";
import { io } from "./realtime.js";

const server = createServer(app);

io.attach(server);

async function start() {
  const required = [
    "MONGO_URI",
    "REDIS_URL",
    "ACCESS_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRY",
    "REFRESH_TOKEN_SECRET",
    "REFRESH_TOKEN_EXPIRY",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length)
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  if (env.ACCESS_TOKEN_SECRET === env.REFRESH_TOKEN_SECRET) {
    throw new Error("Access and refresh tokens require separate secrets.");
  }
  if (env.NODE_ENV === "production" && !process.env.CORS_ORIGIN) {
    throw new Error("Set CORS_ORIGIN to the public frontend origin.");
  }

  await Promise.all([dbConnect(), connectRedis()]);
  server.listen(env.PORT, "0.0.0.0", () => {
    console.info(`Pixora API listening on port ${env.PORT}`);
  });
}

server.on("error", (error) => {
  console.error("Pixora could not start listening:", error.message);
  process.exit(1);
});

start().catch((error: Error) => {
  console.error("Pixora startup failed:", error.message);
  process.exit(1);
});
