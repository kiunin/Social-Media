import { Request, Response } from "express";
import { LogoutDTO } from "./user.dto";
import { createRevokeToken, LogoutEnum } from "../../Utils/security/token";
import { JwtPayload } from "jsonwebtoken";
import { Types, UpdateQuery } from "mongoose";
import { IUser, UserModel } from "../../DB/models/user.model";
import { UserRepository } from "../../DB/repository/user.repository";
import { createPresignedURL, uploadFiles } from "../../Utils/multer/s3.config";
import { FriendRequestRepository } from "../../DB/repository/friendrequest.repository";
import { FriendRequestModel } from "../../DB/models/friendrequest.model";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/response/error.response";

class userService {
  private _usermodel = new UserRepository(UserModel);
  private _friendmodel = new FriendRequestRepository(FriendRequestModel);
  constructor() {}
  getProfile = async (req: Request, res: Response): Promise<Response> => {
    await req.user?.populate("friends");
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
    // await this._usermodel.updateOne({
    //   filter: { _id: req.decoded?._id },
    //   update: {
    //     profileImage: key,
    //   },
    // });

    return res.status(200).json({
      message: "Done",
    });
  };

  sendFriendRequest = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const userId = req.params as unknown as { userId: Types.ObjectId };
    const friendRequestExists = await this._friendmodel.findOne({
      filter: {
        createdBy: {
          $in: [
            req.user?._id as Types.ObjectId,
            userId as unknown as Types.ObjectId,
          ],
        },
        sendTo: {
          $in: [
            req.user?._id as Types.ObjectId,
            userId as unknown as Types.ObjectId,
          ],
        },
      },
    });

    if (friendRequestExists) {
      throw new ConflictException("Friend Request already Exists");
    }
    const user = await this._usermodel.findOne({ filter: { _id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const [friend] =
      (await this._friendmodel.create({
        data: [
          {
            createdBy: req.user?._id as Types.ObjectId,
            sendTo: userId as unknown as Types.ObjectId,
          },
        ],
      })) || [];
    if (!friend) {
      throw new BadRequestException("Fail to send friend request");
    }

    return res.status(200).json({
      message: "Done",
    });
  };
  acceptFriendRequest = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const requestId = req.params as unknown as { requestId: Types.ObjectId };
    const friendRequestExists = await this._friendmodel.findOneAndUpdate({
      filter: {
        _id: requestId,
        sendTo: req.user?._id as Types.ObjectId,
        acceptedAt: { $exists: false },
      },
      update: {
        acceptedAt: new Date(),
      },
    });

    if (!friendRequestExists) {
      throw new NotFoundException("Fail to accept friend request");
    }

    await Promise.all([
      await this._usermodel.updateOne({
        filter: { _id: friendRequestExists.createdBy },
        update: { $addToSet: { friends: friendRequestExists.sendTo } },
      }),
      await this._usermodel.updateOne({
        filter: { _id: friendRequestExists.sendTo },
        update: { $addToSet: { friends: friendRequestExists.createdBy } },
      }),
    ]);

    return res.status(200).json({
      message: "Done",
    });
  };
}

export default new userService();
