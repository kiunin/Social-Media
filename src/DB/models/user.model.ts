import { models, Schema, model, Types, HydratedDocument } from "mongoose";
import { generateHash } from "../../Utils/security/hash";
import { emailEvent } from "../../Utils/events/email.events";

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
  username?: string;
  slug: string;

  email: string;
  confirmEmailOTP?: string;
  confirmedAt?: Date;
  changeCredentialsTime: Date;

  password: string;
  resetPasswordOTP?: string;

  phone?: string;
  address?: string;
  gender: genderEnum;
  role: roleEnum;
  profileImage: string;

  createdAt: Date;
  updatedAt?: Date;
}

export const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, requried: true, minLength: 2, maxLength: 25 },
    lastName: { type: String, requried: true, minLength: 2, maxLength: 25 },
    slug: { type: String, requried: true, minLength: 2, maxLength: 51 },
    email: { type: String, requried: true, unique: true },
    confirmEmailOTP: String,
    confirmedAt: Date,
    changeCredentialsTime: Date,
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
    profileImage: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema
  .virtual("username")
  .set(function (value: string) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName, slug: value.replaceAll(/\s+/g, "-") });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

userSchema.pre(
  "save",
  async function (
    this: HUserDocument & { wasNew: boolean; confirmEmailPlainOTP?: string },
    next,
  ) {
    this.wasNew = this.isNew;
    if (this.isModified("password")) {
      this.password = await generateHash(this.password);
    }
    if (this.isModified("confirmEmailOTP")) {
      this.confirmEmailPlainOTP = this.confirmEmailOTP as string;
      this.confirmEmailOTP = await generateHash(this.confirmEmailOTP as string);
    }
  },
);

userSchema.post("save", async function (doc, next) {
  const that = this as unknown as HUserDocument & {
    wasNew: boolean;
    confirmEmailPlainOTP?: string;
  };
  if (that.wasNew && that.confirmEmailPlainOTP) {
    await emailEvent.emit("confirmEmail", {
      to: this.email,
      uesrname: this.username,
      otp: that.confirmEmailPlainOTP,
    });
  }
});
export const UserModel = models.user || model<IUser>("User", userSchema);
export type HUserDocument = HydratedDocument<IUser>;
