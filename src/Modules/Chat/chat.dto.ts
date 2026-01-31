import * as z from "zod";
import { IAuthSocket } from "../Gateway/gateway.dto";
import { getChatSchema } from "./chat.validation";
import { Server } from "socket.io";

export interface ISayHiDTO {
  message: string;
  socket: IAuthSocket;
  callback: any;
  io: Server;
}

export interface ISendMessageDTO {
  content: string;
  socket: IAuthSocket;
  callback: any;
  sendTo: string;
  io: Server;
}

export type IGetCHatDTO = z.infer<typeof getChatSchema.params>;
