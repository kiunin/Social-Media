import { Server } from "socket.io";
import { IAuthSocket } from "../Gateway/gateway.dto";
import { ISendMessageDTO } from "./chat.dto";
import ChatService from "./chat.service";

export class ChatEvents {
  private _chatService = ChatService;
  constructor() {}
  sayHi = (socket: IAuthSocket, io: Server) => {
    return socket.on("sayHi", (message, callback) => {
      this._chatService.sayHi({ message, socket, callback, io });
    });
  };
  sendMessage = (socket: IAuthSocket, io: Server) => {
    return socket.on(
      "sendMessage",
      (data: { content: string; sendTo: string }) => {
        this._chatService.sendMessage({
          ...data,
          socket,
          io,
        } as ISendMessageDTO);
      },
    );
  };
}
