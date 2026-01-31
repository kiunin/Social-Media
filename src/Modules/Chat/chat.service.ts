import type { Request, Response } from "express";
import { IGetCHatDTO, ISayHiDTO, ISendMessageDTO } from "./chat.dto";
import { ChatModel } from "../../DB/models/chat.model";
import { ChatRepository } from "../../DB/repository/chat.repository";
import { UserRepository } from "../../DB/repository/user.repository";
import { UserModel } from "../../DB/models/user.model";
import { Types } from "mongoose";
import {
  BadRequestException,
  NotFoundException,
} from "../../Utils/response/error.response";

class ChatService {
  private _chatModel = new ChatRepository(ChatModel);
  private _userModel = new UserRepository(UserModel);
  constructor() {}
  //REST
  getChat = async (req: Request, res: Response) => {
    const { userId } = req.params as IGetCHatDTO;
    const chat = await this._chatModel.findOne({
      filter: {
        participants: {
          $all: [
            req.user?._id as Types.ObjectId,
            Types.ObjectId.createFromHexString(userId),
          ],
        },
        group: { $exists: false },
      },
      options: { populate: "participants" },
    });

    if (!chat) {
      throw new NotFoundException("Fail to get Chat");
    }
    return res.status(200).json({ message: "Done", data: { chat } });
  };

  //io
  sayHi = ({ message, socket, callback, io }: ISayHiDTO) => {
    try {
      console.log(message);
      callback ? callback("I received your message") : undefined;
    } catch (error) {
      socket.emit("custom_error", error);
    }
  };

  sendMessage = async ({ content, socket, sendTo, io }: ISendMessageDTO) => {
    try {
      const createdBy = socket.credentials?.user
        ?._id as unknown as Types.ObjectId;
      const user = await this._userModel.findOne({
        filter: {
          _id: Types.ObjectId.createFromHexString(sendTo),
          friends: { $in: [createdBy] },
        },
      });

      if (!user) throw new NotFoundException("User not Found");

      const chat = await this._chatModel.findOneAndUpdate({
        filter: {
          participants: {
            $all: [
              createdBy as Types.ObjectId,
              Types.ObjectId.createFromHexString(sendTo),
            ],
          },
          group: { $exists: false },
        },
        update: {
          $addToSet: {
            messages: {
              content,
              createdBy,
            },
          },
        },
      });

      if (!chat) {
        const [newChat] =
          (await this._chatModel.create({
            data: [
              {
                createdBy,
                messages: [{ content, createdBy }],
                participants: [
                  createdBy,
                  Types.ObjectId.createFromHexString(sendTo),
                ],
              },
            ],
          })) || [];
        if (!newChat) {
          throw new BadRequestException("Fail to create Chat");
        }
      }
      console.log({ content, sendTo, createdBy });
      io.emit("successMessage", { content });
      io.emit("newMessage", { content, from: socket.credentials?.user });
    } catch (error) {
      socket.emit("custom_error", error);
    }
  };
}

export default new ChatService();
