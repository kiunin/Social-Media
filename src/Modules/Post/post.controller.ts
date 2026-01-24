import { Router } from "express";
import { authentication } from "../../Middlewares/authentication.middleware";
import { TokenTypeEnum } from "../../Utils/security/token";
import { roleEnum } from "../../DB/models/user.model";
import { validation } from "../../Middlewares/validation.middleware";
import { createPostSchema, likePostSchema } from "./post.validation";
import postService from "./post.service";
import commentRouter from "../Comment/comment.controller";

const router: Router = Router({
  mergeParams: true,
});
router.use("/:postId/comment", commentRouter);

router.post(
  "/",
  authentication(TokenTypeEnum.ACCESS, [roleEnum.USER]),
  validation(createPostSchema),
  postService.createPost,
);

router.patch(
  "/:postId/like",
  authentication(TokenTypeEnum.ACCESS, [roleEnum.USER]),
  validation(likePostSchema),
  postService.likePost,
);

router.get(
  "/",
  authentication(TokenTypeEnum.ACCESS, [roleEnum.USER]),
  postService.getAllPosts,
);

export default router;
