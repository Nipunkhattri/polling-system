import { io } from "socket.io-client";

let userId = localStorage.getItem("userId");
if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem("userId", userId);
}

export const socket = io("http://localhost:5000", {
  query: { userId },
});