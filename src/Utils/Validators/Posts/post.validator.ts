import z from "zod";
import { postVisibilityEnum } from "../../../Common";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const addPostValidator = {
  body: z.strictObject({
    description: z.string().optional(),
    allowComments: z.boolean().optional(),
    tags: z.array(objectId).optional(),
  }),
};

export const updatePostValidator = {
  params: z.strictObject({ postId: objectId }),
  body: z.strictObject({
    description: z.string().optional(),
    allowComments: z.boolean().optional(),
    tags: z.array(objectId).optional(),
  }),
};

export const changePostVisibilityValidator = {
  params: z.strictObject({ postId: objectId }),
  body: z.strictObject({ visibility: z.nativeEnum(postVisibilityEnum) }),
};

export const deletePostValidator = {
  params: z.strictObject({ postId: objectId }),
};

export const listPostsValidator = {
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    userId: objectId.optional(),
    home: z.string().optional(),
  }),
};

export const getPostValidator = {
  params: z.strictObject({ postId: objectId }),
};
