"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModel = exports.chatSchema = exports.messageSchema = void 0;
const mongoose_1 = require("mongoose");
exports.messageSchema = new mongoose_1.Schema({
    content: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 5000,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
}, {
    timestamps: true,
});
exports.chatSchema = new mongoose_1.Schema({
    participants: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
    ],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    group: String,
    groupImage: String,
    roomId: {
        type: String,
        required: function () {
            return this.roomId;
        },
    },
    messages: [exports.messageSchema],
}, {
    timestamps: true,
});
exports.ChatModel = mongoose_1.models.Chat || (0, mongoose_1.model)("Chat", exports.chatSchema);
