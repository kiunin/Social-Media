"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = require("../../Utils/security/token");
const user_model_1 = require("../../DB/models/user.model");
const user_repository_1 = require("../../DB/repository/user.repository");
const s3_config_1 = require("../../Utils/multer/s3.config");
class userService {
    _usermodel = new user_repository_1.UserRepository(user_model_1.UserModel);
    constructor() { }
    getProfile = async (req, res) => {
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
exports.default = new userService();
