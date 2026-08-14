import { io, Socket } from "socket.io-client";
const URL = "http://localhost:6001";

let socket: Socket | null;

// export const socket= io(URL, {
//     withCredentials : true,
//     autoConnect : true
// })

export const connectSocket = (userId: string) => {
  if (socket) {
    return socket;
  }
  socket = io(URL, {
    withCredentials: true,
    query: {
      userId,
    },
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
