import { models, Schema, model, Types } from "mongoose";
import { string } from "zod";
export enum genderEnum {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum roleEnum {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  userName?: string;

  email: string;
  confirmEmailOTP?: string;
  confirmedAt?: Date;

  password: string;
  resetPasswordOTP?: string;

  phone?: string;
  address?: string;
  gender: genderEnum;
  role: roleEnum;

  createdAt: Date;
  updatedAt?: Date;
}

export const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, requried: true, minLength: 2, maxLength: 25 },
    lastName: { type: String, requried: true, minLength: 2, maxLength: 25 },
    email: { type: String, requried: true, unique: true },
    confirmEmailOTP: String,
    confirmedAt: Date,
    password: { type: String, requried: true },
    resetPasswordOTP: String,
    phone: String,
    address: String,
    gender: { type: String, enum: Object.values(genderEnum) },
    role: {
      type: String,
      enum: Object.values(roleEnum),
      default: roleEnum.USER,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema
  .virtual("username")
  .set(function (value: string) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

export const userModel = models.user || model("User", userSchema);
