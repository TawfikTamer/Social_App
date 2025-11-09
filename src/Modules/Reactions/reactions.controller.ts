import { Router } from "express";
import reactionService from "./Services/reaction.service";
import {
  authenticationMiddleware,
  validationMiddleware,
} from "../../Middlewares";
import {
  reactOnSomethingValidator,
  unReactOnSomethingValidator,
  listReactionsValidator,
} from "../../Utils";

const reactionRouter = Router();

// react
reactionRouter.post(
  "/react",
  authenticationMiddleware,
  validationMiddleware(reactOnSomethingValidator),
  reactionService.reactOnSomething
);

// unreact
reactionRouter.delete(
  "/un-react/:reactionId",
  authenticationMiddleware,
  validationMiddleware(unReactOnSomethingValidator),
  reactionService.unReactOnSomething
);

// list reactions
reactionRouter.get(
  "/list-reactions",
  authenticationMiddleware,
  validationMiddleware(listReactionsValidator),
  reactionService.listReactions
);

export { reactionRouter };
