import * as z from "zod";
import { generalFields } from "../../Middlewares/validation.middleware";

export const loginSchema = {
  body: z.strictObject({
    email: generalFields.email,
    password: generalFields.password,
  }),
};

export const signupSchema = {
  body: loginSchema.body
    .extend({
      username: generalFields.username,
      confirmPassword: generalFields.confirmPassword,
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Password mismatch",
        });
        if (data.username?.split(" ").length != 2) {
          ctx.addIssue({
            code: "custom",
            path: ["username"],
            message: "Name must be 2 words",
          });
        }
      }
    }),
};
