import { Router } from "express";
import { validation } from "../../Middlewares/validation.middleware";
import { getChatSchema } from "./chat.validation";
import chatService from "./chat.service";
import { TokenTypeEnum } from "../../Utils/security/token";
import { roleEnum } from "../../DB/models/user.model";
import { authentication } from "../../Middlewares/authentication.middleware";

const router = Router({ mergeParams: true });

router.post(
  "/signup",
  authentication(TokenTypeEnum.ACCESS, [roleEnum.USER]),
  validation(getChatSchema),
  chatService.sayHi,
);

export default router;
