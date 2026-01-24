"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const token_1 = require("../../Utils/security/token");
const user_model_1 = require("../../DB/models/user.model");
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const comment_validation_1 = require("./comment.validation");
const comment_service_1 = __importDefault(require("./comment.service"));
const cloud_multer_1 = require("../../Utils/multer/cloud.multer");
const router = (0, express_1.Router)();
router.post("/", (0, authentication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.roleEnum.USER]), (0, validation_middleware_1.validation)(comment_validation_1.createCommentSchema), (0, cloud_multer_1.cloudFileUpload)({ validation: cloud_multer_1.fileValidation.image }).array("attachments", 3), comment_service_1.default.createComment);
exports.default = router;
