import { createServer } from "node:http";
import { Server } from "socket.io";
import { app } from "./app.js";
import dbConnect from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { env } from "./constants.js";
import { getAccessUser } from "./middlewares/auth.middleware.js";

const server = createServer(app);

export const io = new Server(server, {
  cors: { origin: env.CORS_ORIGINS, credentials: true },
  allowRequest: (req, callback) => {
    const origin = req.headers.origin;
    callback(null, !origin || env.CORS_ORIGINS.includes(origin));
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.request.headers.cookie?.match(/(?:^|;\s*)accessToken=([^;]+)/)?.[1];
    const user = token ? await getAccessUser(token) : null;
    if (user) {
      socket.data.userId = user.id;
      return next();
    }
  } catch {
    // Reject invalid sessions without revealing token or database details.
  }

  next(new Error("Sign in to connect to Pixora."));
});

io.on("connection", (socket) => {
  socket.join(socket.data.userId);
});

async function start() {
  const required = [
    "MONGO_URI", "REDIS_URL", "ACCESS_TOKEN_SECRET", "ACCESS_TOKEN_EXPIRY",
    "REFRESH_TOKEN_SECRET", "REFRESH_TOKEN_EXPIRY", "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET",
  ];
  const missing = required.filter((key) => !process.env[key]?.trim());
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);
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
