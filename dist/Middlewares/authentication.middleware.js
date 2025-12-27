"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = void 0;
const token_1 = require("../Utils/security/token");
const error_response_1 = require("../Utils/response/error.response");
const authentication = (tokenType = token_1.TokenTypeEnum.ACCESS, accessRole = []) => {
    return async (req, res, next) => {
        if (!req.headers.authorization) {
            throw new error_response_1.BadRequestException("Missing Authorization Header");
        }
        const { decoded, user } = await (0, token_1.decodedToken)({
            authorization: req.headers.authorization,
            tokenType,
        });
        if (!accessRole.includes(user.role))
            throw new error_response_1.ForbiddenException("You Are not Authorized to Access this Route");
        req.user = user;
        req.decoded = decoded;
        return next();
    };
};
exports.authentication = authentication;
