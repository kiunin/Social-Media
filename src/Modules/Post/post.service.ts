import type { Request, Response } from "express";
import {
  AvailabilityEnum,
  LikeUnlikeEnum,
  PostModel,
} from "../../DB/models/post.model";
import { PostRepository } from "../../DB/repository/post.repository";
import { UserRepository } from "../../DB/repository/user.repository";
import { HUserDocument, UserModel } from "../../DB/models/user.model";
import {
  BadRequestException,
  NotFoundException,
} from "../../Utils/response/error.response";
import { uploadFiles } from "../../Utils/multer/s3.config";
import { v4 as uuid } from "uuid";
import { UpdateQuery } from "mongoose";

//export const postAvailability = (req: Request) => {};
class PostService {
  private _usermodel = new UserRepository(UserModel);
  private _postmodel = new PostRepository(PostModel);
  constructor() {}
  createPost = async (req: Request, res: Response) => {
    if (
      req.body.tags?.length &&
      (
        await this._usermodel.find({
          filter: { _id: { $in: req.body.tags } },
        })
      ).length !== req.body.tags.length
    ) {
      throw new NotFoundException("Some mentioned Users do not exist");
    }

    let attachments: string[] = [];
    let assetfolder = undefined;
    if (req.files?.length) {
      let assetPostFolderID = uuid();
      attachments = await uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${req.user?._id}/post/${assetPostFolderID}`,
      });
      assetfolder = assetPostFolderID;
    }

    const [post] =
      (await this._postmodel.create({
        data: [
          {
            ...req.body,
            attachments,
            assetPostFolderID: assetfolder,
            createdBy: req.user?._id,
          },
        ],
      })) || [];

    if (!post) throw new BadRequestException("Fail to create post");

    return res.status(201).json({ message: "Post created successfully", post });
  };

  likePost = async (req: Request, res: Response) => {
    const { postId } = req.params as unknown as { postId: string };
    const { action } = req.query as unknown as { action: string };

    let update: UpdateQuery<HUserDocument> = {
      $addToSet: { likes: req.user?._id },
    };

    if (action === LikeUnlikeEnum.Unlike) {
      update = { $pull: { likes: req.user?._id } };
    }
    const post = await this._postmodel.findOneAndUpdate({
      filter: { _id: postId },
      update,
    });
    if (!post) {
      throw new NotFoundException("Post does not exist");
    }

    return res.status(200).json({ message: "Done", post });
  };

  getAllPosts = async (req: Request, res: Response) => {
    let { page, size } = req.query as unknown as { page: number; size: number };
    const posts = await this._postmodel.paginate({
      filter: { availability: AvailabilityEnum.PUBLIC },
      page,
      size,
    });

    return res.status(200).json({ message: "Done", posts });
  };
}

export default new PostService();
