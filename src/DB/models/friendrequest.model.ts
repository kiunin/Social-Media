import { models, Schema, model, Types, HydratedDocument } from "mongoose";

export interface IFriendRequest {
  createdBy: Types.ObjectId;
  sendTo: Types.ObjectId;

  acceptedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export const friendRequestSchema = new Schema<IFriendRequest>(
  {
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    sendTo: { type: Schema.Types.ObjectId, required: true, ref: "User" },

    acceptedAt: Date,
  },
  {
    timestamps: true,
  },
);

export const FriendRequestModel =
  models.friendRequest ||
  model<IFriendRequest>("FriendRequest", friendRequestSchema);
export type HFriendRequestDocument = HydratedDocument<IFriendRequest>;
