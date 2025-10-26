import { Router } from "express";
import {
  authenticationMiddleware,
  multerMiddleWare,
} from "../../../Middlewares/index";
import UserService from "../Services/user.service";

const userRouter = Router();

userRouter.patch(
  "/profile/uplaod-profile-pic",
  authenticationMiddleware,
  multerMiddleWare().single("profile-pic"),
  UserService.uploadProfilePic
);
userRouter.patch(
  "/profile/uplaod-cover-pic",
  authenticationMiddleware,
  multerMiddleWare().single("cover-pic"),
  UserService.uploadCoverPic
);
userRouter.patch(
  "/profile/renew-url",
  authenticationMiddleware,
  UserService.renewSignedUrl
);
userRouter.delete(
  "/profile/delete-user",
  authenticationMiddleware,
  UserService.deleteAccount
);
userRouter.post(
  "/profile/send-friend-request/:receiverId",
  authenticationMiddleware,
  UserService.sendFriendRequest
);
userRouter.get(
  "/profile/list-friends",
  authenticationMiddleware,
  UserService.listFriendRequests
);
userRouter.patch(
  "/profile/response-to-friendrequest",
  authenticationMiddleware,
  UserService.responseToFriendRequest
);

export { userRouter };
