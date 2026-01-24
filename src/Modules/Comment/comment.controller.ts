import { Router } from "express";
import { authentication } from "../../Middlewares/authentication.middleware";
import { TokenTypeEnum } from "../../Utils/security/token";
import { roleEnum } from "../../DB/models/user.model";
import { validation } from "../../Middlewares/validation.middleware";
import { createCommentSchema } from "./comment.validation";
import postService from "./comment.service";
import {
  cloudFileUpload,
  fileValidation,
} from "../../Utils/multer/cloud.multer";

const router = Router();

router.post(
  "/",
  authentication(TokenTypeEnum.ACCESS, [roleEnum.USER]),
  validation(createCommentSchema),
  cloudFileUpload({ validation: fileValidation.image }).array("attachments", 3),
  postService.createComment,
);

export default router;
