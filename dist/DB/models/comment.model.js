"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModel = exports.commentSchema = exports.AllowCommentsEnum = void 0;
const mongoose_1 = require("mongoose");
var AllowCommentsEnum;
(function (AllowCommentsEnum) {
    AllowCommentsEnum["ALLOW"] = "ALLOW";
    AllowCommentsEnum["DENY"] = "DENY";
})(AllowCommentsEnum || (exports.AllowCommentsEnum = AllowCommentsEnum = {}));
exports.commentSchema = new mongoose_1.Schema({
    content: {
        type: String,
        minLength: 2,
        maxLength: 500000,
        required: function () {
            return !this.attachments?.length;
        },
    },
    attachments: [String],
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    postId: [{ type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Post" }],
    commentId: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    freezedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    freezedAt: Date,
    restoredBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    restoredAt: Date,
}, {
    timestamps: true,
});
exports.CommentModel = mongoose_1.models.Comment || (0, mongoose_1.model)("Comment", exports.commentSchema);
