import { CustomSocket } from "../../../middlewares/socketAuth";
import { updateSocketsMap } from "../../../services/v1/sockets/socketsStore.service";

export const closeConnection = (socket: CustomSocket) => {
  socket.on("disconnect", async () => {
    if (socket.user) {
      await updateSocketsMap(socket.user, false, socket);
    }
  });
};
