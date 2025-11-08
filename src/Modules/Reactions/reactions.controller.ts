import { Router } from "express";
import reactionService from "./Services/reaction.service";
import { authenticationMiddleware } from "../../Middlewares";

const reactionRouter = Router();

// react
reactionRouter.post(
  "/react",
  authenticationMiddleware,
  reactionService.reactOnSomething
);

// unreact
reactionRouter.delete(
  "/un-react/:reactionId",
  authenticationMiddleware,
  reactionService.unReactOnSomething
);

// list reactions
reactionRouter.get(
  "/list-reactions",
  authenticationMiddleware,
  reactionService.listReactions
);

export { reactionRouter };
