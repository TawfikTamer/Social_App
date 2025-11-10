import { Request, Response } from "express";
import { DeleteResult, FilterQuery, Types } from "mongoose";
import { customAlphabet } from "nanoid";

import {
  BlackListedTokenRepository,
  BlockListRepository,
  conversionsRepository,
  UserOTPsRepository,
  UserRepository,
  FriendShipRepository,
  PostRepository,
  CommentRepository,
  reactionRepository,
} from "../../../DB/Repositories";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  CHANGE_EMAIL_VERIFICATION,
  compareHashedData,
  decrypt,
  EMAIL_UPDATED_NOTIFICATION,
  emitter,
  encrypt,
  hashingData,
  isBlockingEachOther,
  PASSWORD_CHANGED,
  S3ClientService,
  SuccessResponse,
} from "../../../Utils";
import {
  conversionTypeEnum,
  friendShipStatusEnum,
  IRequest,
  IUser,
  IFriendShip,
  IPost,
  commentOnModelEnum,
  IComment,
} from "../../../Common";
import { JwtPayload } from "jsonwebtoken";

/**
 * Service class handling all user profile-related operations including:
 * - Profile management (pictures, personal info)
 * - Friend requests and relationships
 * - User blocking functionality
 * - Group creation and management
 * - Account settings and privacy
 * - Account deactivation and deletion
 */
class UserService {
  userRep: UserRepository = new UserRepository();
  friendShipReop: FriendShipRepository = new FriendShipRepository();
  blockListRepo: BlockListRepository = new BlockListRepository();
  conversionsRepo: conversionsRepository = new conversionsRepository();
  otpRep: UserOTPsRepository = new UserOTPsRepository();
  blackListedRep: BlackListedTokenRepository = new BlackListedTokenRepository();
  postRepo: PostRepository = new PostRepository();
  commentRepo: CommentRepository = new CommentRepository();
  reactionRepo: reactionRepository = new reactionRepository();

  s3 = new S3ClientService();

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {PATCH} /api/profile/uplaod-profile-pic
   * @description Upload a new profile picture using multer and S3 storage
   */
  uploadProfilePic = async (req: Request, res: Response) => {
    // Get logged in user and file data
    const { userData } = (req as IRequest).loggedInUser;
    const profilePic = req.file;

    // Validate user authentication and file upload
    if (!userData) throw new BadRequestException("please login");
    if (!profilePic) throw new BadRequestException("please upload photo first");

    // Upload photo to AWS S3
    const { url, key_name } = await this.s3.uploadFileOnS3(
      profilePic as Express.Multer.File,
      `${userData?._id}/Profile-Pic`
    );

    // Update user profile picture reference
    userData.profilePicture = key_name;
    await userData.save();

    return res.status(200).json(
      SuccessResponse("profile-pic uploaded successfully", 200, {
        url,
        key_name,
      })
    );
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {PATCH} /api/profile/uplaod-cover-pic
   * @description Upload a new cover photo using multer and S3 storage
   */
  uploadCoverPic = async (req: Request, res: Response) => {
    // Get logged in user and file data
    const { userData } = (req as IRequest).loggedInUser;
    const coverPic = req.file;

    // Validate user authentication and file upload
    if (!userData) throw new BadRequestException("please login");
    if (!coverPic) throw new BadRequestException("please upload photo first");

    // Upload photo to AWS S3
    const { url, key_name } = await this.s3.uploadFileOnS3(
      coverPic as Express.Multer.File,
      `${userData?._id}/Cover-Pic`
    );

    // Update user cover photo reference
    userData.coverPicture = key_name;
    await userData.save();

    return res.status(200).json(
      SuccessResponse("cover-pic uploaded successfully", 200, {
        url,
        key_name,
      })
    );
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {PATCH} /api/profile/renew-url
   * @description Generate new signed URL for profile or cover picture
   */
  renewSignedUrl = async (req: Request, res: Response) => {
    // Get logged in user and key info
    const { userData } = (req as IRequest).loggedInUser;
    const { key, key_type } = req.body as {
      key: string;
      key_type: "profilePicture" | "coverPicture";
    };

    // Validate user and key existence
    if (!userData) throw new BadRequestException("please login");
    if (!userData[key_type]) throw new BadRequestException("Invaild Key");

    // Generate new signed URL
    const url = await this.s3.getFileWithSignedURL(key);

    return res
      .status(200)
      .json(SuccessResponse("url has been renewed", 200, { url, key }));
  };

  // --------------------------- frind ship APIS --------------------------------
  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {POST} /api/profile/send-friend-request/:receiverId
   * @description Send friend request to another user
   */
  sendFriendRequest = async (req: Request, res: Response) => {
    // Get sender id and receiver id
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { receiverId } = req.params;

    // Validate receiver exists
    if (!receiverId) throw new BadRequestException("insert reciver Id");
    const isExist = await this.userRep.findDocumentById(
      receiverId as unknown as Types.ObjectId
    );
    if (!isExist) throw new NotFoundException("this user is not exist");

    // Prevent self-friend requests
    if ((receiverId as unknown as Types.ObjectId) == _id)
      throw new BadRequestException("can't send request to yourself");

    // Check blocking status between users
    if (await isBlockingEachOther(_id, receiverId as unknown as Types.ObjectId))
      throw new UnauthorizedException("Can't take this action");

    // Check existing friend request
    const isSendBefore = await this.friendShipReop.findOneDocument({
      $or: [
        { receiverId: receiverId as unknown as Types.ObjectId },
        { senderId: receiverId as unknown as Types.ObjectId },
      ],
    });

    // Handle existing request cases
    if (isSendBefore) {
      // If rejected, resend request
      if (isSendBefore.status == friendShipStatusEnum.REJECTED) {
        isSendBefore.status = friendShipStatusEnum.PENDING;
        await isSendBefore.save();
        return res
          .status(200)
          .json(SuccessResponse("request resend successfully", 200));
      } else if (isSendBefore.status == friendShipStatusEnum.ACCEPTED) {
        // If already friends, return friendly message
        return res
          .status(200)
          .json(SuccessResponse("you are already friends", 200));
      }
    } else {
      // Create new friend request
      await this.friendShipReop.createNewDocument({
        senderId: _id,
        receiverId: receiverId as unknown as Types.ObjectId,
      });
    }

    res.status(200).json(SuccessResponse("request send successfully", 200));
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {GET} /api/profile/list-friends
   * @description Get list of friend requests or accepted friends based on status
   */
  listFriendRequests = async (req: Request, res: Response) => {
    // Get user ID and request status
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { status } = req.query;

    // Build filter based on friendship status
    const filter: FilterQuery<IFriendShip> = {
      status: status ? status : friendShipStatusEnum.PENDING,
    };

    // Adjust filter based on status
    if (filter.status == friendShipStatusEnum.ACCEPTED) {
      // For accepted friends, show all connections
      filter.$or = [{ receiverId: _id }, { senderId: _id }];
    } else {
      // For pending/rejected, show only incoming requests
      filter.receiverId = _id;
    }

    // Fetch friend list with user details
    const list = await this.friendShipReop.findDocuments(
      filter,
      {},
      {
        populate: [
          {
            path: "senderId",
            select: "userName ",
            match: { isDeactivated: { $ne: true } },
          },
          {
            path: "receiverId",
            select: "userName ",
            match: { isDeactivated: { $ne: true } },
          },
        ],
      }
    );

    // Get user's group memberships
    const groups = await this.conversionsRepo.findDocuments({
      members: { $in: [_id] },
      type: conversionTypeEnum.GROUP,
    });

    res.status(200).json(
      SuccessResponse("here is the your friendship list", 200, {
        list,
        groups,
      })
    );
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {PATCH} /api/profile/response-to-friendrequest/:senderId
   * @description Accept or reject a pending friend request
   */
  responseToFriendRequest = async (req: Request, res: Response) => {
    // Get user info and response data
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { senderId } = req.params;
    const { response } = req.body as {
      response: friendShipStatusEnum;
    };

    // Find the pending friend request
    const request = await this.friendShipReop.findOneDocument({
      senderId,
      receiverId: _id,
      status: friendShipStatusEnum.PENDING,
    });

    // Validate request exists
    if (!request) throw new NotFoundException("this request is not valid");

    // Update request status
    request.status = response;
    await request.save();

    res.status(200).json(SuccessResponse(`request has been ${response}`, 200));
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {DELETE} /api/profile/cancel-friendrequest/:receiverId
   * @description Cancel a pending friend request sent by the user
   */
  cancelFriendRequest = async (req: Request, res: Response) => {
    // Get user and receiver IDs
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { receiverId } = req.params;

    // Try to delete the pending request
    const isExist = await this.friendShipReop.deleteOneDocument({
      senderId: _id,
      receiverId,
      status: friendShipStatusEnum.PENDING,
    });

    // Check if request was found and deleted
    if (!(isExist as DeleteResult).deletedCount)
      throw new BadRequestException(
        "this request is already canceled or accepted"
      );

    res.status(200).json(SuccessResponse("request has been canceled", 200));
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {DELETE} /api/profile/delete-rejected/:receiverId
   * @description Delete a rejected friend request from history
   */
  deleteRejectedRequest = async (req: Request, res: Response) => {
    // Get user and receiver IDs
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { receiverId } = req.params;

    // Try to delete the rejected request
    const isExist = await this.friendShipReop.deleteOneDocument({
      senderId: _id,
      receiverId,
      status: friendShipStatusEnum.REJECTED,
    });

    // Verify request was found and deleted
    if (!(isExist as DeleteResult).deletedCount)
      throw new NotFoundException("this request is already deleted");

    res.status(200).json(SuccessResponse("request has been deleted", 200));
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {DELETE} /api/profile/remove-friend/:friendId
   * @description Remove an accepted friend connection
   */
  removeFriend = async (req: Request, res: Response) => {
    // Get user and friend IDs
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { friendId } = req.params;

    // Try to delete the friendship connection
    const isExist = await this.friendShipReop.deleteOneDocument({
      $and: [
        {
          $or: [
            {
              senderId: _id,
              receiverId: friendId,
            },
            {
              senderId: friendId,
              receiverId: _id,
            },
          ],
        },
        { status: friendShipStatusEnum.ACCEPTED },
      ],
    });

    // Verify friendship existed and was deleted
    if (!(isExist as DeleteResult).deletedCount)
      throw new NotFoundException("you are already not friends");

    res.status(200).json(SuccessResponse("friend has been removed", 200));
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {POST} /api/profile/block-user/:blockedUserId
   * @description Block a user and remove any friend connections
   */
  blockUser = async (req: Request, res: Response) => {
    // Get user and target IDs
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { blockedUserId } = req.params;

    // Validate target user exists
    const isExist = await this.userRep.findDocumentById(
      blockedUserId as unknown as Types.ObjectId
    );
    if (!isExist) throw new NotFoundException("this user is not exist");

    // Check if target user has already blocked you
    const isBlocked = await this.blockListRepo.findOneDocument({
      userID: blockedUserId,
      theBlockedUser: _id,
    });
    if (isBlocked) throw new ConflictException("this user already blocked you");

    // Add block record
    this.blockListRepo.FindAndUpdateOrCreate({
      userID: _id,
      theBlockedUser: blockedUserId as unknown as Types.ObjectId,
    });

    // Remove any existing friend connections
    this.friendShipReop.deleteOneDocument({
      $or: [
        { senderId: _id, receiverId: blockedUserId },
        { senderId: blockedUserId, receiverId: _id },
      ],
    });

    res.status(200).json(SuccessResponse("user has been blocked", 200));
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {GET} /api/profile/list-block-users
   * @description Get list of users blocked by the current user
   */
  listBlockedUsers = async (req: Request, res: Response) => {
    // Get user ID
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };

    // Fetch blocked users with their usernames
    const list = await this.blockListRepo.findDocuments(
      {
        userID: _id,
      },
      "theBlockedUser",
      {
        populate: [
          {
            path: "theBlockedUser",
            select: "userName ",
          },
        ],
      }
    );

    res.status(200).json(SuccessResponse("here is the block list", 200, list));
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {DELETE} /api/profile/unblock-user/:blockedUserId
   * @description Remove a user from the current user's block list
   */
  unBlockUser = async (req: Request, res: Response) => {
    // Get user and target IDs
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { blockedUserId } = req.params;

    // Try to remove block record
    const isBlocked = await this.blockListRepo.deleteOneDocument({
      userID: _id,
      theBlockedUser: blockedUserId,
    });

    // Verify block record existed and was removed
    if (!(isBlocked as DeleteResult).deletedCount)
      throw new NotFoundException("you can't unblock this user");

    res.status(200).json(SuccessResponse("user has been unblocked", 200));
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {POST} /api/profile/create-group
   * @description Create a new group with specified members from friends list
   */
  createGroup = async (req: Request, res: Response) => {
    // Get user ID and group details
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { name, members } = req.body;

    // Validate all members exist
    const membersExist = await this.userRep.findDocuments({
      _id: {
        $in: members,
      },
    });
    if (members.length != (membersExist as string[]).length)
      throw new NotFoundException("members not found");

    // Verify all members are friends with creator
    const isFriends = await this.friendShipReop.findDocuments({
      $or: [
        { senderId: _id, receiverId: { $in: members } },
        { receiverId: _id, senderId: { $in: members } },
      ],
      status: friendShipStatusEnum.ACCEPTED,
    });

    // Ensure all members are from friends list
    if (members.length != (isFriends as string[]).length)
      throw new BadRequestException("members are not friends");

    // Create the group with all members including creator
    const group = await this.conversionsRepo.createNewDocument({
      type: conversionTypeEnum.GROUP,
      name,
      members: [...members, _id],
    });

    res.status(201).json(SuccessResponse("group created", 201, group));
  };
  // ----------------------------------------------------------------------------

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {PUT} /api/profile/update-profile
   * @description Update user profile information (username, gender, privacy, phone, DOB)
   */
  updateProfileData = async (req: Request, res: Response) => {
    // Get current user data
    const { userData } = (req as IRequest).loggedInUser;

    // Get fields to update
    const { userName, gender, isPublic, phoneNumber, DOB } = req.body as IUser;

    // Handle phone number encryption if provided
    let encryptedPhoneNumber = undefined;
    if (phoneNumber) encryptedPhoneNumber = encrypt(phoneNumber as string);

    // Prepare update data with fallbacks to current values
    const newData = {
      userName: userName || userData?.userName,
      gender: gender || userData?.gender,
      isPublic: isPublic || userData?.isPublic,
      phoneNumber: encryptedPhoneNumber || userData?.phoneNumber,
      DOB: DOB || userData?.DOB,
    };

    // Perform update operation
    this.userRep.updateOneDocument({ _id: userData?._id }, newData);

    res.status(200).json(SuccessResponse("data updated successfully"));
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {POST} /api/profile/change-email
   * @description Initiate email change process by sending OTP to new email
   */
  updateEmail = async (req: Request, res: Response) => {
    // Get current user info
    const { userData } = (req as IRequest).loggedInUser;
    const { newEmail } = req.body;

    // Validate new email is not already in use
    const isNewEmailExist = await this.userRep.findOneDocument({
      _id: { $ne: userData?._id },
      email: newEmail,
    });
    if (isNewEmailExist)
      throw new ConflictException("this email already exist");

    // Prevent unnecessary updates
    if (userData?.email == newEmail)
      throw new BadRequestException("this is your current email");

    // Generate verification OTP
    const nanoid = customAlphabet("1234567890", 6);
    const OTP: string = nanoid();

    // Send verification email
    emitter.emit("sendEmail", {
      to: newEmail,
      subject: "Confirm New Email",
      content: CHANGE_EMAIL_VERIFICATION(OTP, newEmail),
    });

    // Store hashed OTP
    const hasedOTP = await hashingData(
      OTP,
      parseInt(process.env.SALT_ROUNDS as string)
    );

    // Save OTP record with expiration
    await this.otpRep.createNewDocument({
      userId: userData?._id as Types.ObjectId,
      confirm: hasedOTP,
      expiration: new Date(
        Date.now() + parseInt(process.env.OTPS_EXPIRES_IN_MIN!) * 60 * 1000
      ),
    });

    res.status(200).json(SuccessResponse("please check your new email"));
  };
  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {PATCH} /api/profile/confrim-changing-email
   * @description Verify OTP and complete email change process
   */
  confirmNewEmail = async (req: Request, res: Response) => {
    // Get user data and tokens
    const { userData, accessTokenData, refreshTokenData } = (req as IRequest)
      .loggedInUser;
    const { newEmail, OTP } = req.body;

    // Find and validate OTP
    const userOTP = await this.otpRep.findOneDocument({
      userId: userData?._id,
    });

    // Check OTP validity and expiration
    if (!userOTP || userOTP.expiration < new Date()) {
      throw new BadRequestException("otp Expired, try to register again");
    }

    // Verify OTP matches
    const correctOTP: string = userOTP.confirm as string;
    const isCorrect = await compareHashedData(OTP, correctOTP);
    if (!isCorrect) {
      throw new BadRequestException("wrong OTP");
    }

    // Cleanup used OTP
    await this.otpRep.deleteOneDocument({
      userId: userData?._id,
    });

    // Send confirmation email
    emitter.emit("sendEmail", {
      to: newEmail,
      subject: "Welcome Email",
      content: EMAIL_UPDATED_NOTIFICATION(
        userData?.email as string,
        userData?.userName as string
      ),
    });

    // Update user's email
    if (userData) userData.email = newEmail;

    // Invalidate current tokens
    await this.blackListedRep.createNewDocument({
      accsessTokenId: accessTokenData?.jti,
      refreshTokenId: refreshTokenData?.jti,
      expirationDate: new Date((accessTokenData?.exp as number) * 1000),
    });

    // Save changes and send response
    userData?.save();
    return res
      .status(200)
      .json(
        SuccessResponse(
          "email has been updated, Now you need to log in again with the new one",
          200
        )
      );
  };
  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {PATCH} /api/profile/update-password
   * @description Update user password with verification
   */
  updatePassword = async (req: Request, res: Response) => {
    // Get current user data
    const { userData } = (req as IRequest).loggedInUser;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // Validate password confirmation matches
    if (newPassword !== confirmNewPassword)
      throw new BadRequestException("passwords don't match");

    // Verify current password
    const isCorrect = await compareHashedData(
      oldPassword,
      userData?.password as string
    );
    if (!isCorrect) throw new BadRequestException("wrong password");

    // Prevent using same password
    if (oldPassword == newPassword)
      throw new BadRequestException(
        "can't change the password to the current one"
      );

    // Hash and update new password
    const hasedPassword = await hashingData(
      newPassword as string,
      parseInt(process.env.SALT_ROUNDS as string)
    );
    if (userData) userData.password = hasedPassword;
    userData?.save();

    // Send change notification email
    emitter.emit("sendEmail", {
      to: userData!.email,
      subject: `password Changed`,
      content: PASSWORD_CHANGED(),
    });

    res.status(200).json(SuccessResponse("password has been changed"));
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {GET} /api/profile/profile-data
   * @description Get current user's profile data with decrypted phone number
   */
  getYourProfileData = async (req: Request, res: Response) => {
    // Extract profile fields from user data
    const {
      userData: { userName, email, phoneNumber, DOB, isPublic, gender },
    } = (req as IRequest).loggedInUser as { userData: IUser };

    // Decrypt sensitive information
    const decryptedPhoneNumber = decrypt(phoneNumber as string);

    // Return formatted profile data
    res.status(200).json(
      SuccessResponse("here is your data", 200, {
        userName,
        email,
        phoneNumber: decryptedPhoneNumber,
        DOB,
        isPublic,
        gender,
      })
    );
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {GET} /api/profile/view-profile/:userID
   * @description View another user's profile with friendship status
   */
  viewProfile = async (req: Request, res: Response) => {
    // Get current user and target user IDs
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { userID } = req.params;

    // Find target user's public profile data
    const user = await this.userRep.findOneDocument(
      { _id: userID },
      "userName gender coverPicture profilePicture "
    );
    if (!user) throw new BadRequestException("this user not found");

    // Get friendship status between users
    const friendState = await this.friendShipReop.findOneDocument({
      $or: [
        { senderId: user._id, receiverId: _id },
        { senderId: _id, receiverId: (user as IUser)._id },
      ],
    });

    // Return profile with friendship info
    res.status(200).json(
      SuccessResponse("here is user profile", 200, {
        user,
        friendState: friendState?.status || "not friends",
      })
    );
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {PATCH} /api/profile/deActivte
   * @description Temporarily deactivate user account and invalidate tokens
   */
  deActivateAccount = async (req: Request, res: Response) => {
    // Get user data and tokens
    const { userData, accessTokenData, refreshTokenData } = (req as IRequest)
      .loggedInUser;

    // Set account as deactivated
    userData!.isDeactivated = true;
    userData?.save();

    // Invalidate current auth tokens
    await this.blackListedRep.createNewDocument({
      accsessTokenId: accessTokenData?.jti,
      refreshTokenId: refreshTokenData?.jti,
      expirationDate: new Date((accessTokenData?.exp as number) * 1000),
    });

    res
      .status(200)
      .json(
        SuccessResponse(
          "account now has been deactivated, login again to active it"
        )
      );
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {DELETE} /api/profile/delete-user
   * @description Permanently delete user account and all associated data
   */
  deleteAccount = async (req: Request, res: Response) => {
    // Get user data and tokens
    const {
      userData: { _id },
      accessTokenData,
      refreshTokenData,
    } = (req as IRequest).loggedInUser as {
      userData: IUser;
      accessTokenData: JwtPayload;
      refreshTokenData: JwtPayload;
    };

    await Promise.all([
      // delete any OTP for the user
      this.otpRep.deleteManyDocuments({ userId: _id }),

      // delete user's photos from S3
      this.s3.deleteFolderFromS3(`${_id}`),

      // delete user's comments and replies
      this.commentRepo.deleteManyDocuments({
        ownerId: _id,
      }),

      // delete user's reactions
      this.reactionRepo.deleteManyDocuments({
        reactOwner: _id,
      }),

      // delete user's friendships
      this.friendShipReop.deleteManyDocuments({
        $or: [{ senderId: _id }, { receiverId: _id }],
      }),

      // delete user's block list
      this.blockListRepo.deleteManyDocuments({
        $or: [{ theBlockedUser: _id }, { userID: _id }],
      }),

      // delete the user from any group they joined
      this.conversionsRepo.updateManyDocument(
        {
          type: conversionTypeEnum.GROUP,
          members: { $in: [_id] },
        },
        {
          $pull: { members: _id },
        }
      ),
    ]);

    // delete user's posts
    // --------------------------------------------
    const posts = await this.postRepo.findDocuments({ ownerId: _id });

    if (posts && (posts as IPost[]).length > 0) {
      const postIds = (posts as IPost[]).map((post) => post._id);

      // Find comments on ALL posts
      const comments = await this.commentRepo.findDocuments({
        refId: { $in: postIds },
        onModel: commentOnModelEnum.POST,
      });

      if (comments && (comments as IComment[]).length > 0) {
        const commentIds = (comments as IComment[]).map((c) => c._id);

        // Find replies to ALL comments
        const replies = await this.commentRepo.findDocuments({
          refId: { $in: commentIds },
          onModel: commentOnModelEnum.COMMENT,
        });

        const replyIds =
          replies && (replies as IComment[]).length > 0
            ? (replies as IComment[]).map((r) => r._id)
            : [];

        const allIds = [...postIds, ...commentIds, ...replyIds];

        // Delete everything in parallel
        await Promise.all([
          // Delete reactions on ALL posts/comments/replies
          this.reactionRepo.deleteManyDocuments({
            reactOn: { $in: allIds },
          }),

          // Delete ALL replies
          replyIds.length > 0
            ? this.commentRepo.deleteManyDocuments({
                _id: { $in: replyIds },
              })
            : Promise.resolve(),

          // Delete ALL comments
          this.commentRepo.deleteManyDocuments({
            _id: { $in: commentIds },
          }),
        ]);
      } else {
        // No comments exist - still need to delete reactions on posts
        await this.reactionRepo.deleteManyDocuments({
          reactOn: { $in: postIds },
        });
      }

      // Delete all the posts
      await this.postRepo.deleteManyDocuments({ ownerId: _id });
    }
    // --------------------------------------------

    // revoke the token
    this.blackListedRep.createNewDocument({
      accsessTokenId: accessTokenData?.jti,
      refreshTokenId: refreshTokenData?.jti,
      expirationDate: new Date((accessTokenData?.exp as number) * 1000),
    });

    // delete user account from user model
    await this.userRep.deleteOneDocument({ _id });

    res.status(200).json(SuccessResponse("account has been deleted"));
  };
}

export default new UserService();
