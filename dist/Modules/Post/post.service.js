"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_model_1 = require("../../DB/models/post.model");
const post_repository_1 = require("../../DB/repository/post.repository");
const user_repository_1 = require("../../DB/repository/user.repository");
const user_model_1 = require("../../DB/models/user.model");
const error_response_1 = require("../../Utils/response/error.response");
const s3_config_1 = require("../../Utils/multer/s3.config");
const uuid_1 = require("uuid");
class PostService {
    _usermodel = new user_repository_1.UserRepository(user_model_1.UserModel);
    _postmodel = new post_repository_1.PostRepository(post_model_1.PostModel);
    constructor() { }
    createPost = async (req, res) => {
        if (req.body.tags?.length &&
            (await this._usermodel.find({
                filter: { _id: { $in: req.body.tags } },
            })).length !== req.body.tags.length) {
            throw new error_response_1.NotFoundException("Some mentioned Users do not exist");
        }
        let attachments = [];
        let assetfolder = undefined;
        if (req.files?.length) {
            let assetPostFolderID = (0, uuid_1.v4)();
            attachments = await (0, s3_config_1.uploadFiles)({
                files: req.files,
                path: `users/${req.user?._id}/post/${assetPostFolderID}`,
            });
            assetfolder = assetPostFolderID;
        }
        const [post] = (await this._postmodel.create({
            data: [
                {
                    ...req.body,
                    attachments,
                    assetPostFolderID: assetfolder,
                    createdBy: req.user?._id,
                },
            ],
        })) || [];
        if (!post)
            throw new error_response_1.BadRequestException("Fail to create post");
        return res.status(201).json({ message: "Post created successfully", post });
    };
    likePost = async (req, res) => {
        const { postId } = req.params;
        const { action } = req.query;
        let update = {
            $addToSet: { likes: req.user?._id },
        };
        if (action === post_model_1.LikeUnlikeEnum.Unlike) {
            update = { $pull: { likes: req.user?._id } };
        }
        const post = await this._postmodel.findOneAndUpdate({
            filter: { _id: postId },
            update,
        });
        if (!post) {
            throw new error_response_1.NotFoundException("Post does not exist");
        }
        return res.status(200).json({ message: "Done", post });
    };
    getAllPosts = async (req, res) => {
        let { page, size } = req.query;
        const posts = await this._postmodel.paginate({
            filter: { availability: post_model_1.AvailabilityEnum.PUBLIC },
            page,
            size,
        });
        return res.status(200).json({ message: "Done", posts });
    };
}
exports.default = new PostService();
