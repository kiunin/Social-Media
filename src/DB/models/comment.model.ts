import { models, Schema, model, Types, HydratedDocument } from "mongoose";

export enum AllowCommentsEnum {
  ALLOW = "ALLOW",
  DENY = "DENY",
}

//export const postAvailability(){};

export interface IComment {
  content?: string;
  attachments?: string[];

  tags?: Types.ObjectId[];
  likes?: Types.ObjectId[];

  createdBy: Types.ObjectId;
  postId: Types.ObjectId;
  commentId?: Types.ObjectId;

  freezedBy?: Types.ObjectId;
  freezedAt?: Date;

  restoredBy?: Types.ObjectId;
  restoredAt?: Date;

  createdAt: Date;
  updatedAt?: Date;
}

export const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 500000,
      required: function (this) {
        return !this.attachments?.length;
      },
    },
    attachments: [String],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    postId: [{ type: Schema.Types.ObjectId, required: true, ref: "Post" }],
    commentId: [{ type: Schema.Types.ObjectId, ref: "User" }],
    freezedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    freezedAt: Date,

    restoredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    restoredAt: Date,
  },
  {
    timestamps: true,
  },
);

export const CommentModel =
  models.Comment || model<IComment>("Comment", commentSchema);
export type HCommenttDocument = HydratedDocument<IComment>;
