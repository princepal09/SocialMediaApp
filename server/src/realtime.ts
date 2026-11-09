import { Server } from "socket.io";
import { env } from "./constants.js";
import { getAccessUser } from "./middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";

export const io = new Server({
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
  } catch (error) {
    if (!(error instanceof jwt.JsonWebTokenError)) {
      return next(Object.assign(new Error("Realtime service is temporarily unavailable."), {
        data: { code: "REALTIME_UNAVAILABLE" },
      }));
    }
  }

  next(Object.assign(new Error("Sign in to connect to Pixora."), {
    data: { code: "SESSION_REQUIRED" },
  }));
});

io.on("connection", (socket) => {
  socket.join(socket.data.userId);
});

