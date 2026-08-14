import { app } from "./app.js";
import dotenv from "dotenv";
import dbConnect from "./config/db.js";
const PORT = env.PORT;
import http from "http";
import { Server } from "socket.io";
import { env } from "./constants.js";
import { connectRedis } from "./config/redis.js";

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const userId = socket.handshake.query.userId as string;
  if (userId) {
    socket.join(userId);
    console.log("User joined personal room ", userId);
  }

  socket.on("join_conversation", (conversationId: string) => {
    socket.join(conversationId);
    console.log("User joined conversation:", conversationId);
  });

  socket.on("leave_conversation", (conversationId: string) => {
    socket.leave(conversationId);
    console.log(`Left room : ${conversationId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

dbConnect()
  .then(async() => {
    await connectRedis();
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    server.on("error", (error) => {
      console.error("Server Error", error);
      process.exit(1);
    });
  })
  .catch((err: any) => {
    console.error("MongoDB connection failed:", err);
  });
