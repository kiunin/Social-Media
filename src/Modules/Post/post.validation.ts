import * as z from "zod";
import { generalFields } from "../../Middlewares/validation.middleware";
import { fileValidation } from "../../Utils/multer/cloud.multer";
import {
  AllowCommentsEnum,
  AvailabilityEnum,
  LikeUnlikeEnum,
} from "../../DB/models/post.model";

export const createPostSchema = {
  body: z
    .strictObject({
      content: z.string().min(2).max(500000).optional(),
      attachments: z
        .array(generalFields.file(fileValidation.image))
        .max(3)
        .optional(),
      allowComments: z.enum(AllowCommentsEnum).default(AllowCommentsEnum.ALLOW),
      availability: z.enum(AvailabilityEnum).default(AvailabilityEnum.PUBLIC),
      likes: z.array(generalFields.id).optional(),
      tags: z.array(generalFields.id).max(20).optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.attachments?.length && !data.content) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "Please Provide Content or Attachments",
        });
      }
      if (
        data.tags?.length &&
        data.tags.length !== [...new Set(data.tags)].length
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["tags"],
          message: "Please Provide Unique Tags",
        });
      }
    }),
};

export const likePostSchema = {
  params: z.strictObject({
    postId: generalFields.id,
  }),
  query: z.strictObject({
    action: z.enum(LikeUnlikeEnum).default(LikeUnlikeEnum.Like),
  }),
};
