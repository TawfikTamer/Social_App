import { Router } from "express";
import {
  authenticationMiddleware,
  multerMiddleWare,
  verifyRefreshTokenMiddleware,
  validationMiddleware,
} from "../../../Middlewares";
import UserService from "../Services/user.service";
import {
  renewSignedUrlValidator,
  sendFriendRequestValidator,
  createGroupValidator,
  listFriendRequestsValidator,
  responseToFriendRequestValidator,
  cancelFriendRequestValidator,
  deleteRejectedRequestValidator,
  removeFriendValidator,
  blockUserValidator,
  unBlockUserValidator,
  listBlockedUsersValidator,
  updateProfileDataValidator,
  updateEmailValidator,
  confirmNewEmailValidator,
  updatePasswordValidator,
  viewProfileValidator,
} from "../../../Utils";

const userRouter = Router();

// ----------------- user pictures -----------------
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
  validationMiddleware(renewSignedUrlValidator),
  UserService.renewSignedUrl
);

// ----------------- friend ship APIs -----------------
userRouter.post(
  "/profile/send-friend-request/:receiverId",
  authenticationMiddleware,
  validationMiddleware(sendFriendRequestValidator),
  UserService.sendFriendRequest
);

userRouter.post(
  "/profile/create-group",
  authenticationMiddleware,
  validationMiddleware(createGroupValidator),
  UserService.createGroup
);

userRouter.get(
  "/profile/list-friends",
  authenticationMiddleware,
  validationMiddleware(listFriendRequestsValidator),
  UserService.listFriendRequests
);

userRouter.patch(
  "/profile/response-to-friendrequest/:senderId",
  authenticationMiddleware,
  validationMiddleware(responseToFriendRequestValidator),
  UserService.responseToFriendRequest
);

userRouter.delete(
  "/profile/cancel-friendrequest/:receiverId",
  authenticationMiddleware,
  validationMiddleware(cancelFriendRequestValidator),
  UserService.cancelFriendRequest
);

userRouter.delete(
  "/profile/delete-rejected/:receiverId",
  authenticationMiddleware,
  validationMiddleware(deleteRejectedRequestValidator),
  UserService.deleteRejectedRequest
);

userRouter.delete(
  "/profile/remove-friend/:friendId",
  authenticationMiddleware,
  validationMiddleware(removeFriendValidator),
  UserService.removeFriend
);

// ----------------- Block list APIs -----------------
userRouter.post(
  "/profile/block-user/:blockedUserId",
  authenticationMiddleware,
  validationMiddleware(blockUserValidator),
  UserService.blockUser
);

userRouter.delete(
  "/profile/unblock-user/:blockedUserId",
  authenticationMiddleware,
  validationMiddleware(unBlockUserValidator),
  UserService.unBlockUser
);

userRouter.get(
  "/profile/list-block-users",
  authenticationMiddleware,
  validationMiddleware(listBlockedUsersValidator),
  UserService.listBlockedUsers
);

// ----------------- prfile Updates -----------------
userRouter.put(
  "/profile/update-profile",
  authenticationMiddleware,
  validationMiddleware(updateProfileDataValidator),
  UserService.updateProfileData
);

userRouter.post(
  "/profile/change-email",
  authenticationMiddleware,
  validationMiddleware(updateEmailValidator),
  UserService.updateEmail
);

userRouter.patch(
  "/profile/confrim-changing-email",
  authenticationMiddleware,
  verifyRefreshTokenMiddleware,
  validationMiddleware(confirmNewEmailValidator),
  UserService.confirmNewEmail
);

userRouter.patch(
  "/profile/update-password",
  authenticationMiddleware,
  validationMiddleware(updatePasswordValidator),
  UserService.updatePassword
);

userRouter.get(
  "/profile/profile-data",
  authenticationMiddleware,
  UserService.getYourProfileData
);

userRouter.get(
  "/profile/view-profile/:userID",
  authenticationMiddleware,
  validationMiddleware(viewProfileValidator),
  UserService.viewProfile
);

// ----------------- freeze the account -----------------
userRouter.patch(
  "/profile/deActivte",
  authenticationMiddleware,
  verifyRefreshTokenMiddleware,
  UserService.deActivateAccount
);

// ----------------- delete the account -----------------
userRouter.delete(
  "/profile/delete-user",
  authenticationMiddleware,
  UserService.deleteAccount
);

export { userRouter };
