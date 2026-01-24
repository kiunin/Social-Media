"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = __importDefault(require("./user.service"));
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const token_1 = require("../../Utils/security/token");
const user_model_1 = require("../../DB/models/user.model");
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const user_validation_1 = require("./user.validation");
const cloud_multer_1 = require("../../Utils/multer/cloud.multer");
const router = (0, express_1.Router)();
router.get("/profile", (0, authentication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.roleEnum.USER]), user_service_1.default.getProfile);
router.post("/logout", (0, authentication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.roleEnum.USER]), (0, validation_middleware_1.validation)(user_validation_1.logoutSchema), user_service_1.default.logout);
router.patch("/profile-image", (0, authentication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.roleEnum.USER]), (0, validation_middleware_1.validation)(user_validation_1.logoutSchema), (0, cloud_multer_1.cloudFileUpload)({
    validation: [...cloud_multer_1.fileValidation.image],
    storageApproach: cloud_multer_1.storageEnum.MEMORY,
    maxSizeMb: 3,
}).single("attachments"), user_service_1.default.profileImage);
router.patch("/cover-image", (0, authentication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.roleEnum.USER]), (0, validation_middleware_1.validation)(user_validation_1.logoutSchema), (0, cloud_multer_1.cloudFileUpload)({
    validation: [...cloud_multer_1.fileValidation.image],
    storageApproach: cloud_multer_1.storageEnum.MEMORY,
    maxSizeMb: 3,
}).array("attachments", 5), user_service_1.default.coverImage);
exports.default = router;
