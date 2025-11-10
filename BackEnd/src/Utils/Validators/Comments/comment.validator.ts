import z from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const addCommentValidator = {
  params: z.strictObject({ postId: objectId }),
  body: z.strictObject({ content: z.string().min(1) }),
};

export const addReplyValidator = {
  query: z.strictObject({ commentId: objectId }),
  body: z.strictObject({ content: z.string().min(1) }),
};

export const updateCommentValidator = {
  params: z.strictObject({ commentId: objectId }),
  body: z.strictObject({ newContent: z.string().min(1) }),
};

export const deleteCommentValidator = {
  params: z.strictObject({ commentId: objectId }),
};

export const getAllCommentsValidator = {
  params: z.strictObject({ postId: objectId }),
};

export const getCommentByIdValidator = {
  params: z.strictObject({ commentId: objectId }),
};

export const getCommentWithRepliesValidator = {
  params: z.strictObject({ commentId: objectId }),
};
