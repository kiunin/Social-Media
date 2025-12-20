import type { Request, Response } from "express";
import { IConfirmEmailDTO, ILoginDTO, ISignupDTO } from "./auth.dto";
import { UserModel } from "../../DB/models/user.model";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/response/error.response";
import { UserRepository } from "../../DB/repository/user.repository";
import { compareHash, generateHash } from "../../Utils/security/hash";
import { generateOTP } from "../../Utils/generateOTP";
import { emailEvent } from "../../Utils/events/email.events";
import { generateToken } from "../../Utils/security/token";
import { accessSync } from "node:fs";

class AuthenticationService {
  private _usermodel = new UserRepository(UserModel);
  constructor() {}
  signup = async (req: Request, res: Response): Promise<Response> => {
    const { username, email, password }: ISignupDTO = req.body;

    const checkUser = await this._usermodel.findOne({
      filter: { email },
      select: "email",
    });
    if (checkUser) throw new ConflictException("User Already exists");

    const otp = generateOTP();
    const user = await this._usermodel.createUser({
      data: [
        {
          username,
          email,
          password: await generateHash(password),
          confirmEmailOTP: await generateHash(otp),
        },
      ],
      options: { validateBeforeSave: true },
    });
    await emailEvent.emit("confirmEmail", {
      to: email,
      username,
      otp,
    });

    if (!user) throw new BadRequestException("User not created");
    return res.status(201).json({ message: "User Created Successfully", user });
  };

  login = async (req: Request, res: Response) => {
    const { email, password }: ILoginDTO = req.body;
    const user = await this._usermodel.findOne({ filter: { email } });
    if (!user) throw new NotFoundException("User Not Found");
    if (!user.confirmedAt) throw new BadRequestException("Verify Your Account");
    if (!compareHash(password, user.password))
      throw new BadRequestException("Invalid Input");

    const accessToken = await generateToken({
      payload: { _id: user._id },
      secret: "ljvnpifgvpibvipqefv",
      options: {
        expiresIn: 3600,
      },
    });

    const refreshToken = await generateToken({
      payload: { _id: user._id },
      secret: "jpihpfjafjaoifh",
      options: {
        expiresIn: 3600,
      },
    });

    return res
      .status(200)
      .json({
        message: "User Logged in Successfully",
        data: { accessToken, refreshToken },
      });
  };

  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: IConfirmEmailDTO = req.body;
    const user = await this._usermodel.findOne({
      filter: {
        email,
        confirmEmailOTP: { $exists: true },
        confirmedAt: { $exists: false },
      },
    });
    if (!user) {
      throw new BadRequestException("User not found");
    }
    if (!compareHash(otp, user?.confirmEmailOTP as string)) {
      throw new BadRequestException("Invalid Otp");
    }
    await this._usermodel.updateOne({
      filter: { email },
      update: { confirmedAt: new Date(), $unset: { confirmEmailOTP: true } },
    });
    return res.status(200).json({ message: "User Confirmed Successfully" });
  };
}

export default new AuthenticationService();
