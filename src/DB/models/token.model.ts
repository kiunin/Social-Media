import { models, Schema, model, Types, HydratedDocument } from "mongoose";

export interface IToken {
  userId: Types.ObjectId;
  jti: string;
  expiresIn: number;
}

export const tokenSchema = new Schema<IToken>(
  {
    jti: { type: String, requried: true, unique: true },
    expiresIn: { type: Number, required: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TokenModel = models.Token || model("Token", tokenSchema);
export type HTokenDocument = HydratedDocument<IToken>;
