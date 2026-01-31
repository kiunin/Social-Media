"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const chat_validation_1 = require("./chat.validation");
const chat_service_1 = __importDefault(require("./chat.service"));
const token_1 = require("../../Utils/security/token");
const user_model_1 = require("../../DB/models/user.model");
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const router = (0, express_1.Router)({ mergeParams: true });
router.post("/signup", (0, authentication_middleware_1.authentication)(token_1.TokenTypeEnum.ACCESS, [user_model_1.roleEnum.USER]), (0, validation_middleware_1.validation)(chat_validation_1.getChatSchema), chat_service_1.default.sayHi);
exports.default = router;
