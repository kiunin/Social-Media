import { Request, Response } from "express";
import { LogoutDTO } from "./user.dto";
import { createRevokeToken, LogoutEnum } from "../../Utils/security/token";
import { JwtPayload } from "jsonwebtoken";
import { UpdateQuery } from "mongoose";
import { IUser, UserModel } from "../../DB/models/user.model";
import { UserRepository } from "../../DB/repository/user.repository";
import {
  createPresignedURL,
  uploadFile,
  uploadFiles,
} from "../../Utils/multer/s3.config";

class userService {
  private _usermodel = new UserRepository(UserModel);
  constructor() {}
  getProfile = async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json({
      message: "Done",
      data: { user: req.user, decoded: req.decoded },
    });
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    const { flag }: LogoutDTO = req.body;
    const update: UpdateQuery<IUser> = {};
    let statusCode: number = 200;

    switch (flag) {
      case LogoutEnum.ONLY:
        await createRevokeToken(req.decoded as JwtPayload);
        statusCode = 201;
        break;
      case LogoutEnum.ALL:
        update.changeCredentialsTime = new Date();
        break;

      default:
        break;
    }

    await this._usermodel.updateOne({
      filter: { _id: req.decoded?._id },
      update,
    });

    return res.status(statusCode).json({
      message: "Done",
    });
  };

  profileImage = async (req: Request, res: Response): Promise<Response> => {
    const {
      ContentType,
      originalname,
    }: { ContentType: string; originalname: string } = req.body;
    const { url, Key } = await createPresignedURL({
      ContentType,
      originalname,
      path: `users/${req.decoded?._id}/profile`,
    });
    await this._usermodel.updateOne({
      filter: { _id: req.decoded?._id },
      update: {
        profileImage: Key,
      },
    });

    return res.status(200).json({
      message: "Done",
      url,
      Key,
    });
  };

  coverImage = async (req: Request, res: Response): Promise<Response> => {
    const urls = await uploadFiles({
      files: req.files as Express.Multer.File[],
      path: `users/${req.decoded?._id}/cover`,
    });
    await this._usermodel.updateOne({
      filter: { _id: req.decoded?._id },
      update: {
        profileImage: key,
      },
    });

    return res.status(200).json({
      message: "Done",
    });
  };
}

export default new userService();
