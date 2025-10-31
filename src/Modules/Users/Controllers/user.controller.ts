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
userRouter.post(
  "/profile/create-group",
  authenticationMiddleware,
  UserService.createGroup
);
userRouter.get(
  "/profile/list-friends",
  authenticationMiddleware,
  UserService.listFriendRequests
);
userRouter.patch(
  "/profile/response-to-friendrequest/:senderId",
  authenticationMiddleware,
  UserService.responseToFriendRequest
);

userRouter.delete(
  "/profile/cancel-friendrequest/:receiverId",
  authenticationMiddleware,
  UserService.cancelFriendRequest
);
userRouter.delete(
  "/profile/delete-rejected/:receiverId",
  authenticationMiddleware,
  UserService.deleteRejectedRequest
);
userRouter.delete(
  "/profile/remove-friend/:friendId",
  authenticationMiddleware,
  UserService.removeFriend
);
userRouter.post(
  "/profile/block-user/:blockedUserId",
  authenticationMiddleware,
  UserService.blockUser
);
userRouter.delete(
  "/profile/unblock-user/:blockedUserId",
  authenticationMiddleware,
  UserService.unBlockUser
);
userRouter.get(
  "/profile/list-block-users",
  authenticationMiddleware,
  UserService.listBlockedUsers
);

export { userRouter };
