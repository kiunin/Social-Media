"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequestModel = exports.friendRequestSchema = void 0;
const mongoose_1 = require("mongoose");
exports.friendRequestSchema = new mongoose_1.Schema({
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    sendTo: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    acceptedAt: Date,
}, {
    timestamps: true,
});
exports.FriendRequestModel = mongoose_1.models.friendRequest ||
    (0, mongoose_1.model)("FriendRequest", exports.friendRequestSchema);
