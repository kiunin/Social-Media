"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = require("../../Utils/security/token");
const user_model_1 = require("../../DB/models/user.model");
const user_repository_1 = require("../../DB/repository/user.repository");
const s3_config_1 = require("../../Utils/multer/s3.config");
const friendrequest_repository_1 = require("../../DB/repository/friendrequest.repository");
const friendrequest_model_1 = require("../../DB/models/friendrequest.model");
const error_response_1 = require("../../Utils/response/error.response");
class userService {
    _usermodel = new user_repository_1.UserRepository(user_model_1.UserModel);
    _friendmodel = new friendrequest_repository_1.FriendRequestRepository(friendrequest_model_1.FriendRequestModel);
    constructor() { }
    getProfile = async (req, res) => {
        await req.user?.populate("friends");
        return res.status(200).json({
            message: "Done",
            data: { user: req.user, decoded: req.decoded },
        });
    };
    logout = async (req, res) => {
        const { flag } = req.body;
        const update = {};
        let statusCode = 200;
        switch (flag) {
            case token_1.LogoutEnum.ONLY:
                await (0, token_1.createRevokeToken)(req.decoded);
                statusCode = 201;
                break;
            case token_1.LogoutEnum.ALL:
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
    profileImage = async (req, res) => {
        const { ContentType, originalname, } = req.body;
        const { url, Key } = await (0, s3_config_1.createPresignedURL)({
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
    coverImage = async (req, res) => {
        const urls = await (0, s3_config_1.uploadFiles)({
            files: req.files,
            path: `users/${req.decoded?._id}/cover`,
        });
        return res.status(200).json({
            message: "Done",
        });
    };
    sendFriendRequest = async (req, res) => {
        const userId = req.params;
        const friendRequestExists = await this._friendmodel.findOne({
            filter: {
                createdBy: {
                    $in: [
                        req.user?._id,
                        userId,
                    ],
                },
                sendTo: {
                    $in: [
                        req.user?._id,
                        userId,
                    ],
                },
            },
        });
        if (friendRequestExists) {
            throw new error_response_1.ConflictException("Friend Request already Exists");
        }
        const user = await this._usermodel.findOne({ filter: { _id: userId } });
        if (!user)
            throw new error_response_1.NotFoundException("User not found");
        const [friend] = (await this._friendmodel.create({
            data: [
                {
                    createdBy: req.user?._id,
                    sendTo: userId,
                },
            ],
        })) || [];
        if (!friend) {
            throw new error_response_1.BadRequestException("Fail to send friend request");
        }
        return res.status(200).json({
            message: "Done",
        });
    };
    acceptFriendRequest = async (req, res) => {
        const requestId = req.params;
        const friendRequestExists = await this._friendmodel.findOneAndUpdate({
            filter: {
                _id: requestId,
                sendTo: req.user?._id,
                acceptedAt: { $exists: false },
            },
            update: {
                acceptedAt: new Date(),
            },
        });
        if (!friendRequestExists) {
            throw new error_response_1.NotFoundException("Fail to accept friend request");
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
exports.default = new userService();
