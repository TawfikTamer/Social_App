import z from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

const xorPostComment = z
  .object({ postId: objectId.optional(), commentId: objectId.optional() })
  .refine(
    (v) => Boolean((v.postId && !v.commentId) || (v.commentId && !v.postId)),
    {
      message: "Either postId or commentId must be provided, but not both",
    }
  );

export const reactOnSomethingValidator = {
  query: xorPostComment,
  body: z.strictObject({ react: z.string().min(1) }),
};

export const unReactOnSomethingValidator = {
  params: z.strictObject({ reactionId: objectId }),
  query: xorPostComment,
};

export const listReactionsValidator = {
  query: xorPostComment,
};
