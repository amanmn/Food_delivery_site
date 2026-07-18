import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SERVERURL, {
  withCredentials: true,
});

socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
socket.on("disconnect", () => console.log("❌ Socket disconnected"));

export const joinSocketRoom = (userId) => {
  if (!userId) return;
  socket.emit("joinRoom", { userId });
};