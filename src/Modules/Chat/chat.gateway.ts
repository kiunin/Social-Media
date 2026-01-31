import { Server } from "socket.io";
import { IAuthSocket } from "../Gateway/gateway.dto";
import { ChatEvents } from "./chat.events";

export class ChatGateway {
  constructor() {}
  private _chatEvent = new ChatEvents();

  register = (socket: IAuthSocket, io: Server) => {
    this._chatEvent.sayHi(socket, io);
    this._chatEvent.sendMessage(socket, io);
  };
}
