import { io } from "socket.io-client";
import { getCurrentUser } from "./api/auth.api";
import { BACKEND_URL } from "./utils/constants";

const origin = new URL(BACKEND_URL, window.location.origin).origin;
export const socket = io(import.meta.env.VITE_SOCKET_URL || origin, {
  withCredentials: true,
  autoConnect: false,
  reconnectionDelayMax: 5_000,
});

export function startRealtime(userId: string) {
  let active = true;
  let triedSession = false;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;

  const handleConnect = () => { triedSession = false; };
  const handleConnectError = (error: Error & { data?: { code?: string } }) => {
    if (!active || socket.active) return;
    if (error.data?.code === "REALTIME_UNAVAILABLE") {
      retryTimer = setTimeout(() => socket.connect(), 5_000);
      return;
    }
    if (triedSession || (error.data?.code !== "SESSION_REQUIRED" && error.message !== "Sign in to connect to Pixora.")) return;

    triedSession = true;
    // Socket.IO does not retry a refused handshake. Let HTTP renew the cookie first.
    void getCurrentUser().then(({ data }) => {
      if (active && data?._id === userId) socket.connect();
    }).catch(() => {});
  };

  socket.on("connect", handleConnect);
  socket.on("connect_error", handleConnectError);
  socket.connect();

  return () => {
    active = false;
    clearTimeout(retryTimer);
    socket.off("connect", handleConnect);
    socket.off("connect_error", handleConnectError);
    socket.disconnect();
  };
}
