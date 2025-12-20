import { JwtPayload, Secret, sign, SignOptions, verify } from "jsonwebtoken";

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
