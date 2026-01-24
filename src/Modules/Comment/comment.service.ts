import type { Request, Response } from "express";
import { AllowCommentsEnum, PostModel } from "../../DB/models/post.model";
import { PostRepository } from "../../DB/repository/post.repository";
import { UserRepository } from "../../DB/repository/user.repository";
import { UserModel } from "../../DB/models/user.model";
import {
  BadRequestException,
  NotFoundException,
} from "../../Utils/response/error.response";
import { uploadFiles } from "../../Utils/multer/s3.config";
import { CommentRepository } from "../../DB/repository/comment.repository";
import { CommentModel } from "../../DB/models/comment.model";
//import { postAvailability } from "../Post/post.service";

class CommentService {
  private _usermodel = new UserRepository(UserModel);
  private _postmodel = new PostRepository(PostModel);
  private _commentmodel = new CommentRepository(CommentModel);
  constructor() {}
  createComment = async (req: Request, res: Response) => {
    const { postId } = req.params as unknown as { postId: string };
    const post = await this._postmodel.findOne({
      filter: {
        _id: postId,
        allowComments: AllowCommentsEnum.ALLOW,
        //$or: postAvailability(req),
      },
    });
    if (!post) {
      throw new NotFoundException("Fail to Match Results");
    }
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
    if (req.files?.length) {
      attachments = await uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${post.createdBy}/post/${post.assetPostFolderID}`,
      });
    }

    const [comment] =
      (await this._commentmodel.create({
        data: [
          {
            ...req.body,
            attachments,
            postId,
            createdBy: req.user?._id,
          },
        ],
      })) || [];

    if (!comment) throw new BadRequestException("Fail to create comment");

    return res
      .status(201)
      .json({ message: "Post created successfully", comment });
  };
}

export default new CommentService();
