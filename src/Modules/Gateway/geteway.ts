import { Server as httpServer } from "node:http";
import { Server } from "socket.io";
import { decodedToken, TokenTypeEnum } from "../../Utils/security/token";
import { IAuthSocket } from "./gateway.dto";
import { ChatGateway } from "../Chat/chat.gateway";

let io: Server | null = null;
export const initialize = (httpServer: httpServer) => {
  io = new Server(httpServer, { cors: { origin: "*" } });
  const connectedSockets = new Map<string, string[]>();

  io.use(async (socket: IAuthSocket, next) => {
    try {
      const { user, decoded } = await decodedToken({
        authorization: socket.handshake.auth.authorization,
        tokenType: TokenTypeEnum.ACCESS,
      });
      const userTabs = connectedSockets.get(user._id.toString()) || [];
      userTabs.push(socket.id);
      connectedSockets.set(user._id.toString(), userTabs);
      socket.credentials = { user, decoded };
      next();
    } catch (error: any) {
      next(error);
    }
  });

  function disconnection(socket: IAuthSocket) {
    socket.on("disconnect", () => {
      const userId = socket.credentials?.user._id?.toString() as string;
      const remainingTabs =
        connectedSockets.get(userId)?.filter((tab) => {
          return tab !== socket.id;
        }) || [];
      if (remainingTabs.length) {
        connectedSockets.set(userId, remainingTabs);
      } else {
        connectedSockets.delete(userId);
      }
      console.log(`logged out: ${connectedSockets}`);
    });
  }
  const chatGateway: ChatGateway = new ChatGateway();
  io.on("connection", (socket: IAuthSocket) => {
    chatGateway.register(socket, getIO());
    disconnection(socket);
    socket.on("sayHi", (data, callback) => {
      console.log(data);
      callback("Data received");
    });

    socket.emit("product", { id: 1, name: "Product", price: 10000 });
  });
  io.of("/admin").on("connection", (socket) => {
    console.log("Admin Connection", socket.id);
  });
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
