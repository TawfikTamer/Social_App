import { Router } from "express";
import { authenticationMiddleware, multerMiddleWare } from "../../Middlewares";
import postService from "./Services/post.service";
const postRouter = Router();

// Add post
postRouter.post(
  "/add-post",
  authenticationMiddleware,
  multerMiddleWare().array("post-attachments", 20),
  postService.addPost
);

// Update post
postRouter.put(
  "/update-post/:postId",
  authenticationMiddleware,
  postService.updatePost
);

// Delete post
postRouter.delete(
  "/delete-post/:postId",
  authenticationMiddleware,
  postService.deletePost
);

// Change visibility
postRouter.patch(
  "/post-visibility/:postId",
  authenticationMiddleware,
  postService.changePostVisibility
);

// Get posts
postRouter.get("/list-posts", authenticationMiddleware, postService.listPosts);

export { postRouter };
