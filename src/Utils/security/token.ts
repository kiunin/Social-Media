import { JwtPayload, Secret, sign, SignOptions, verify } from "jsonwebtoken";
import { HUserDocument, roleEnum, UserModel } from "../../DB/models/user.model";
import { v4 as uuid } from "uuid";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../response/error.response";
import { UserRepository } from "../../DB/repository/user.repository";
import { TokenModel } from "../../DB/models/token.model";
import { TokenRepository } from "../../DB/repository/token.repository";
export enum SignatureLevelEnum {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum LogoutEnum {
  ONLY = "ONLY",
  ALL = "ALL",
}

export enum TokenTypeEnum {
  ACCESS = "ACCESS",
  REFRESH = "REFRESH",
}

export const generateToken = async ({
  payload,
  secret,
  options,
}: {
  payload: Object;
  secret: Secret;
  options: SignOptions;
}): Promise<string> => {
  return await sign(payload, secret, options);
};

export const verifyToken = async ({
  token,
  secret,
}: {
  token: string;
  secret: Secret;
}): Promise<JwtPayload> => {
  return (await verify(token, secret)) as JwtPayload;
};

export const getSignatureLevel = async (
  role: roleEnum = roleEnum.USER,
): Promise<SignatureLevelEnum> => {
  let signatureLevel: SignatureLevelEnum = SignatureLevelEnum.USER;
  switch (role) {
    case roleEnum.USER:
      signatureLevel = SignatureLevelEnum.USER;
      break;

    case roleEnum.ADMIN:
      signatureLevel = SignatureLevelEnum.ADMIN;
      break;

    default:
      break;
  }
  return signatureLevel;
};

export const getSignature = async (
  signatureLevel: SignatureLevelEnum = SignatureLevelEnum.USER,
): Promise<{ access_token: string; refresh_token: string }> => {
  let signature: { access_token: string; refresh_token: string } = {
    access_token: "",
    refresh_token: "",
  };

  switch (signatureLevel) {
    case SignatureLevelEnum.ADMIN:
      signature.access_token = process.env.ACCESS_ADMIN_TOKEN_SECRET as string;
      signature.refresh_token = process.env
        .REFRESH_ADMIN_TOKEN_SECRET as string;
      break;

    case SignatureLevelEnum.USER:
      signature.access_token = process.env.ACCESS_USER_TOKEN_SECRET as string;
      signature.refresh_token = process.env.REFRESH_USER_TOKEN_SECRET as string;
      break;

    default:
      break;
  }
  return signature;
};

export const createLoginCredentials = async (
  user: HUserDocument,
): Promise<{ access_token: string; refresh_token: string }> => {
  const signatureLevel = await getSignatureLevel(user.role);
  const signature = await getSignature(signatureLevel);
  const jwtid = uuid();

  const access_token = await generateToken({
    payload: { _id: user._id },
    secret: signature.access_token,
    options: {
      expiresIn: Number(process.env.ACCESS_EXPIRES_IN),
      jwtid,
    },
  });

  const refresh_token = await generateToken({
    payload: { _id: user._id },
    secret: signature.refresh_token,
    options: {
      expiresIn: Number(process.env.REFRESH_EXPIRES_IN),
      jwtid,
    },
  });
  return { access_token, refresh_token };
};

export const decodedToken = async ({
  authorization,
  tokenType = TokenTypeEnum.ACCESS,
}: {
  authorization: string;
  tokenType: TokenTypeEnum;
}) => {
  const userModel = new UserRepository(UserModel);
  const tokenModel = new TokenRepository(TokenModel);
  const [bearer, token] = authorization.split(" ");
  if (!bearer || !token) {
    throw new UnauthorizedException("Missing Token Parts");
  }
  const signature = await getSignature(bearer as SignatureLevelEnum);
  const decoded = await verifyToken({
    token,
    secret:
      tokenType === TokenTypeEnum.REFRESH
        ? signature.refresh_token
        : signature.access_token,
  });
  if (!decoded?._id || !decoded?.iat)
    throw new UnauthorizedException("Invalid Token payload");

  if (await tokenModel.findOne({ filter: { jti: decoded.jti as string } })) {
    throw new NotFoundException("invalid or old login credentials");
  }

  const user = await userModel.findOne({ filter: { _id: decoded._id } });
  if (!user) throw new NotFoundException("User Not Found");
  if (!user.changeCredentialsTime?.getTime() || 0 > decoded.iat * 1000) {
    throw new UnauthorizedException("Logged out of all devices");
  }

  return { user, decoded };
};

export const createRevokeToken = async (decoded: JwtPayload) => {
  const tokenModel = new TokenRepository(TokenModel);
  const [results] =
    (await tokenModel.create({
      data: [
        {
          jti: decoded.jti as string,
          expiresIn: decoded.iat as number,
          userId: decoded._id,
        },
      ],
    })) || [];
  if (!results) throw new BadRequestException("Fail to revoke token");

  return results;
};
