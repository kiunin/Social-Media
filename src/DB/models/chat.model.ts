import { models, Schema, model, Types, HydratedDocument } from "mongoose";

export interface IMessage {
  content: string;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChat {
  participants: Types.ObjectId[];
  messages: IMessage[];

  group?: string;
  groupImage?: string;
  roomId: string;

  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt?: Date;
}

export const messageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 5000,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export const chatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    group: String,
    groupImage: String,
    roomId: {
      type: String,
      required: function (this) {
        return this.roomId as unknown as boolean;
      },
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  },
);

export const ChatModel = models.Chat || model<IChat>("Chat", chatSchema);
export type HChatDocument = HydratedDocument<IChat>;
export type HMessageDocument = HydratedDocument<IMessage>;
