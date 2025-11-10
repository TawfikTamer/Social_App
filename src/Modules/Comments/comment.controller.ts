import { Router } from "express";
import {
  authenticationMiddleware,
  multerMiddleWare,
  validationMiddleware,
} from "../../Middlewares";
import commentService from "./Services/comment.service";
import {
  addCommentValidator,
  updateCommentValidator,
  deleteCommentValidator,
  getAllCommentsValidator,
  getCommentByIdValidator,
  addReplyValidator,
  getCommentWithRepliesValidator,
} from "../../Utils";

const commentRouter = Router();

// Add comment
commentRouter.post(
  "/add-comment/:postId",
  authenticationMiddleware,
  multerMiddleWare().single("comment-attachment"),
  validationMiddleware(addCommentValidator),
  commentService.addComment
);

// Update comment
commentRouter.patch(
  "/update-comment/:commentId",
  authenticationMiddleware,
  validationMiddleware(updateCommentValidator),
  commentService.updateComment
);

// Delete comment (comment owner or post owner)
commentRouter.delete(
  "/delete-comment/:commentId",
  authenticationMiddleware,
  validationMiddleware(deleteCommentValidator),
  commentService.deleteComment
);

// Get all comments for a post
commentRouter.get(
  "/post-comments/:postId",
  authenticationMiddleware,
  validationMiddleware(getAllCommentsValidator),
  commentService.getAllComments
);

// Get comment by id
commentRouter.get(
  "/get-comment/:commentId",
  authenticationMiddleware,
  validationMiddleware(getCommentByIdValidator),
  commentService.getCommentById
);

// Reply on comment
commentRouter.post(
  "/add-reply",
  authenticationMiddleware,
  multerMiddleWare().single("reply-attachment"),
  validationMiddleware(addReplyValidator),
  commentService.addReply
);

// get Comment With Replies
commentRouter.get(
  "/comment-with-replies/:commentId",
  authenticationMiddleware,
  validationMiddleware(getCommentWithRepliesValidator),
  commentService.getCommentWithReplies
);

export { commentRouter };
