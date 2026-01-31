import z from "zod";
import { LogoutEnum } from "../../Utils/security/token";
import { generalFields } from "../../Middlewares/validation.middleware";

export const logoutSchema = {
  body: z.strictObject({
    flag: z.enum(LogoutEnum).default(LogoutEnum.ONLY),
  }),
};

export const friendRequestSchema = {
  params: z.strictObject({
    userId: generalFields.id,
  }),
};
