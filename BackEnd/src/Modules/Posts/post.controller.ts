import { Router } from "express";
import {
  authenticationMiddleware,
  multerMiddleWare,
  validationMiddleware,
} from "../../Middlewares";
import postService from "./Services/post.service";
import {
  addPostValidator,
  updatePostValidator,
  deletePostValidator,
  changePostVisibilityValidator,
  listPostsValidator,
  getPostValidator,
} from "../../Utils";

const postRouter = Router();

// Add post
postRouter.post(
  "/add-post",
  authenticationMiddleware,
  multerMiddleWare().array("post-attachments", 20),
  validationMiddleware(addPostValidator),
  postService.addPost
);

// Update post
postRouter.put(
  "/update-post/:postId",
  authenticationMiddleware,
  validationMiddleware(updatePostValidator),
  postService.updatePost
);

// Delete post
postRouter.delete(
  "/delete-post/:postId",
  authenticationMiddleware,
  validationMiddleware(deletePostValidator),
  postService.deletePost
);

// Change visibility
postRouter.patch(
  "/post-visibility/:postId",
  authenticationMiddleware,
  validationMiddleware(changePostVisibilityValidator),
  postService.changePostVisibility
);

// Get posts
postRouter.get(
  "/list-posts",
  authenticationMiddleware,
  validationMiddleware(listPostsValidator),
  postService.listPosts
);

// Get post by Id
postRouter.get(
  "/get-post/:postId",
  authenticationMiddleware,
  validationMiddleware(getPostValidator),
  postService.getPost
);

export { postRouter };
