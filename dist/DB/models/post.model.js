"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = exports.postSchema = exports.LikeUnlikeEnum = exports.AvailabilityEnum = exports.AllowCommentsEnum = void 0;
const mongoose_1 = require("mongoose");
var AllowCommentsEnum;
(function (AllowCommentsEnum) {
    AllowCommentsEnum["ALLOW"] = "ALLOW";
    AllowCommentsEnum["DENY"] = "DENY";
})(AllowCommentsEnum || (exports.AllowCommentsEnum = AllowCommentsEnum = {}));
var AvailabilityEnum;
(function (AvailabilityEnum) {
    AvailabilityEnum["PUBLIC"] = "PUBLIC";
    AvailabilityEnum["FRIENDS"] = "FRIENDS";
    AvailabilityEnum["ONLYME"] = "ONLYME";
})(AvailabilityEnum || (exports.AvailabilityEnum = AvailabilityEnum = {}));
var LikeUnlikeEnum;
(function (LikeUnlikeEnum) {
    LikeUnlikeEnum["Like"] = "Like";
    LikeUnlikeEnum["Unlike"] = "Unlike";
})(LikeUnlikeEnum || (exports.LikeUnlikeEnum = LikeUnlikeEnum = {}));
exports.postSchema = new mongoose_1.Schema({
    content: {
        type: String,
        minLength: 2,
        maxLength: 500000,
        required: function () {
            return !this.attachments?.length;
        },
    },
    attachments: [String],
    allowComments: {
        type: String,
        enum: Object.values(AllowCommentsEnum),
        default: AllowCommentsEnum.ALLOW,
    },
    assetPostFolderID: String,
    availability: {
        type: String,
        enum: Object.values(AvailabilityEnum),
        default: AvailabilityEnum.PUBLIC,
    },
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
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
exports.PostModel = mongoose_1.models.Post || (0, mongoose_1.model)("Post", exports.postSchema);
