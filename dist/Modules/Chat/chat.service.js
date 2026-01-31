"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chat_model_1 = require("../../DB/models/chat.model");
const chat_repository_1 = require("../../DB/repository/chat.repository");
const user_repository_1 = require("../../DB/repository/user.repository");
const user_model_1 = require("../../DB/models/user.model");
const mongoose_1 = require("mongoose");
const error_response_1 = require("../../Utils/response/error.response");
class ChatService {
    _chatModel = new chat_repository_1.ChatRepository(chat_model_1.ChatModel);
    _userModel = new user_repository_1.UserRepository(user_model_1.UserModel);
    constructor() { }
    getChat = async (req, res) => {
        const { userId } = req.params;
        const chat = await this._chatModel.findOne({
            filter: {
                participants: {
                    $all: [
                        req.user?._id,
                        mongoose_1.Types.ObjectId.createFromHexString(userId),
                    ],
                },
                group: { $exists: false },
            },
            options: { populate: "participants" },
        });
        if (!chat) {
            throw new error_response_1.NotFoundException("Fail to get Chat");
        }
        return res.status(200).json({ message: "Done", data: { chat } });
    };
    sayHi = ({ message, socket, callback, io }) => {
        try {
            console.log(message);
            callback ? callback("I received your message") : undefined;
        }
        catch (error) {
            socket.emit("custom_error", error);
        }
    };
    sendMessage = async ({ content, socket, sendTo, io }) => {
        try {
            const createdBy = socket.credentials?.user
                ?._id;
            const user = await this._userModel.findOne({
                filter: {
                    _id: mongoose_1.Types.ObjectId.createFromHexString(sendTo),
                    friends: { $in: [createdBy] },
                },
            });
            if (!user)
                throw new error_response_1.NotFoundException("User not Found");
            const chat = await this._chatModel.findOneAndUpdate({
                filter: {
                    participants: {
                        $all: [
                            createdBy,
                            mongoose_1.Types.ObjectId.createFromHexString(sendTo),
                        ],
                    },
                    group: { $exists: false },
                },
                update: {
                    $addToSet: {
                        messages: {
                            content,
                            createdBy,
                        },
                    },
                },
            });
            if (!chat) {
                const [newChat] = (await this._chatModel.create({
                    data: [
                        {
                            createdBy,
                            messages: [{ content, createdBy }],
                            participants: [
                                createdBy,
                                mongoose_1.Types.ObjectId.createFromHexString(sendTo),
                            ],
                        },
                    ],
                })) || [];
                if (!newChat) {
                    throw new error_response_1.BadRequestException("Fail to create Chat");
                }
            }
            console.log({ content, sendTo, createdBy });
            io.emit("successMessage", { content });
            io.emit("newMessage", { content, from: socket.credentials?.user });
        }
        catch (error) {
            socket.emit("custom_error", error);
        }
    };
}
exports.default = new ChatService();
