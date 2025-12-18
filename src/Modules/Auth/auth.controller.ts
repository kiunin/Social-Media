import { Router } from "express";
import authService from "./auth.service";
import { validation } from "../../Middlewares/validation.middleware";
import { signupSchema } from "./auth.validation";

const router = Router();

router.get("/signup", validation(signupSchema), authService.signup);
router.get("/login", authService.login);

export default router;
