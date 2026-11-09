import { io } from "socket.io-client";
import { BACKEND_URL } from "./utils/constants";

const origin = new URL(BACKEND_URL, window.location.origin).origin;
const socket = io(import.meta.env.VITE_SOCKET_URL || origin, {
  withCredentials: true,
  autoConnect: false,
});

export const connectSocket = () => socket.connect();
export const disconnectSocket = () => socket.disconnect();
