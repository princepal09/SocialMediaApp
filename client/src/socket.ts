import { io, Socket } from "socket.io-client";

const URL = import.meta.env.VITE_SOCKET_URL as string;

let socket: Socket | null = null;

export const connectSocket = (userId: string) => {
  if (!userId) {
    throw new Error("User ID is required for socket connection");
  }

  // If socket already exists, reuse it
  if (socket) {
    if (!socket.connected) {
      socket.connect();
    }

    return socket;
  }

  socket = io(URL, {
    withCredentials: true,

    query: {
      userId: userId,
    },

    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("🟢 SOCKET CONNECTED:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 SOCKET DISCONNECTED:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ SOCKET CONNECTION ERROR:", error.message);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};