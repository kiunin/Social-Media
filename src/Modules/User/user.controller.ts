import { Router } from "express";
import userService from "./user.service";
import { authentication } from "../../Middlewares/authentication.middleware";
import { TokenTypeEnum } from "../../Utils/security/token";
import { roleEnum } from "../../DB/models/user.model";
import { validation } from "../../Middlewares/validation.middleware";
import { logoutSchema } from "./user.validation";
import {
  cloudFileUpload,
  fileValidation,
  storageEnum,
} from "../../Utils/multer/cloud.multer";

const router = Router();

router.get(
  "/profile",
  authentication(TokenTypeEnum.ACCESS, [roleEnum.USER]),
  userService.getProfile
);

router.post(
  "/logout",
  authentication(TokenTypeEnum.ACCESS, [roleEnum.USER]),
  validation(logoutSchema),
  userService.logout
);

router.patch(
  "/profile-image",
  authentication(TokenTypeEnum.ACCESS, [roleEnum.USER]),
  validation(logoutSchema),
  cloudFileUpload({
    validation: [...fileValidation.images],
    storageApproach: storageEnum.MEMORY,
    maxSizeMb: 3,
  }).single("attachments"),
  userService.profileImage
);

router.patch(
  "/cover-image",
  authentication(TokenTypeEnum.ACCESS, [roleEnum.USER]),
  validation(logoutSchema),
  cloudFileUpload({
    validation: [...fileValidation.images],
    storageApproach: storageEnum.MEMORY,
    maxSizeMb: 3,
  }).array("attachments", 5),
  userService.coverImage
);

export default router;
