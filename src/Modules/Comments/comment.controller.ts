import { Router } from "express";
import { authenticationMiddleware, multerMiddleWare } from "../../Middlewares";
import commentService from "./Services/comment.service";
const commentRouter = Router();

// Add comment
commentRouter.post(
  "/add-comment/:postId",
  authenticationMiddleware,
  multerMiddleWare().single("comment-attachment"),
  commentService.addComment
);
// Update comment
commentRouter.patch(
  "/update-comment/:commentId",
  authenticationMiddleware,
  commentService.updateComment
);
// Delete comment (comment owner or post owner)
commentRouter.delete(
  "/delete-comment/:commentId",
  authenticationMiddleware,
  commentService.deleteComment
);
// Get all comments for a post
commentRouter.get(
  "/post-comments/:postId",
  authenticationMiddleware,
  commentService.getAllComments
);
// Get comment by id
commentRouter.get(
  "/get-comment/:commentId",
  authenticationMiddleware,
  commentService.getCommentById
);
// Reply on comment
commentRouter.post(
  "/add-reply",
  authenticationMiddleware,
  multerMiddleWare().single("reply-attachment"),
  commentService.addReply
);
// get Comment With Replies
commentRouter.get(
  "/comment-with-replies/:commentId",
  authenticationMiddleware,
  commentService.getCommentWithReplies
);

export { commentRouter };
