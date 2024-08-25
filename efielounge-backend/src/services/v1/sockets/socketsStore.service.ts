import { Socket } from "socket.io";
const connectedSocketsMap: Map<string, Socket> = new Map();

export const updateSocketsMap = (
  user: any,
  connected: boolean,
  socket: Socket
) => {
  if (!user._id) {
    return null;
  }
  if (connected) {
    connectedSocketsMap.set(user._id.toString(), socket);
  } else {
    connectedSocketsMap.delete(user._id.toString());
  }
  return true;
};

export const getUserProfileSockets = (userId: string): Socket | undefined => {
  return connectedSocketsMap.get(userId);
};

export const getAllAdminProfileSockets = (): Socket[] | [] => {
  return Array.from(connectedSocketsMap.values());
};
