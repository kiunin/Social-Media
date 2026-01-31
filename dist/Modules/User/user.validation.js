"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendRequestSchema = exports.logoutSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const token_1 = require("../../Utils/security/token");
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
exports.logoutSchema = {
    body: zod_1.default.strictObject({
        flag: zod_1.default.enum(token_1.LogoutEnum).default(token_1.LogoutEnum.ONLY),
    }),
};
exports.friendRequestSchema = {
    params: zod_1.default.strictObject({
        userId: validation_middleware_1.generalFields.id,
    }),
};
