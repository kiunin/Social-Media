import * as z from "zod";
import { loginSchema, signupSchema } from "./auth.validation";

export type ISignupDTO = z.infer<typeof signupSchema.body>;
export type ILoginDTO = z.infer<typeof loginSchema.body>;
