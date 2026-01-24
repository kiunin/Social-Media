"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_model_1 = require("../../DB/models/post.model");
const post_repository_1 = require("../../DB/repository/post.repository");
const user_repository_1 = require("../../DB/repository/user.repository");
const user_model_1 = require("../../DB/models/user.model");
const error_response_1 = require("../../Utils/response/error.response");
const s3_config_1 = require("../../Utils/multer/s3.config");
const comment_repository_1 = require("../../DB/repository/comment.repository");
const comment_model_1 = require("../../DB/models/comment.model");
class CommentService {
    _usermodel = new user_repository_1.UserRepository(user_model_1.UserModel);
    _postmodel = new post_repository_1.PostRepository(post_model_1.PostModel);
    _commentmodel = new comment_repository_1.CommentRepository(comment_model_1.CommentModel);
    constructor() { }
    createComment = async (req, res) => {
        const { postId } = req.params;
        const post = await this._postmodel.findOne({
            filter: {
                _id: postId,
                allowComments: post_model_1.AllowCommentsEnum.ALLOW,
            },
        });
        if (!post) {
            throw new error_response_1.NotFoundException("Fail to Match Results");
        }
        if (req.body.tags?.length &&
            (await this._usermodel.find({
                filter: { _id: { $in: req.body.tags } },
            })).length !== req.body.tags.length) {
            throw new error_response_1.NotFoundException("Some mentioned Users do not exist");
        }
        let attachments = [];
        if (req.files?.length) {
            attachments = await (0, s3_config_1.uploadFiles)({
                files: req.files,
                path: `users/${post.createdBy}/post/${post.assetPostFolderID}`,
            });
        }
        const [comment] = (await this._commentmodel.create({
            data: [
                {
                    ...req.body,
                    attachments,
                    postId,
                    createdBy: req.user?._id,
                },
            ],
        })) || [];
        if (!comment)
            throw new error_response_1.BadRequestException("Fail to create comment");
        return res
            .status(201)
            .json({ message: "Post created successfully", comment });
    };
}
exports.default = new CommentService();
