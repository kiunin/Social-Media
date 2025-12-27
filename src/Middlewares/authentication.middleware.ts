import { NextFunction, Request, Response } from "express";
import { roleEnum } from "../DB/models/user.model";
import { decodedToken, TokenTypeEnum } from "../Utils/security/token";
import {
  BadRequestException,
  ForbiddenException,
} from "../Utils/response/error.response";

export const authentication = (
  tokenType: TokenTypeEnum = TokenTypeEnum.ACCESS,
  accessRole: roleEnum[] = []
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      throw new BadRequestException("Missing Authorization Header");
    }
    const { decoded, user } = await decodedToken({
      authorization: req.headers.authorization,
      tokenType,
    });

    if (!accessRole.includes(user.role))
      throw new ForbiddenException(
        "You Are not Authorized to Access this Route"
      );

    req.user = user;
    req.decoded = decoded;
    return next();
  };
};
