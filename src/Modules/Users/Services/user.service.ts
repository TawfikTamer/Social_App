import { Request, Response } from "express";
import {
  blackListedTokensModel,
  otpModel,
  userModel,
} from "../../../DB/models";
import {
  BlackListedTokenRepository,
  BlockListRepository,
  conversionsRepository,
  UserOTPsRepository,
  UserRepository,
} from "../../../DB/Repositories";
import {
  BadRequestException,
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
} from "../../../Common";
import { DeleteResult, FilterQuery, Types } from "mongoose";
import { FriendShipRepository } from "../../../DB/Repositories/friendship.repository";
import { IFriendShip } from "../../../Common";
import { customAlphabet } from "nanoid";

class UserService {
  userRep: UserRepository = new UserRepository(userModel);
  friendShipReop: FriendShipRepository = new FriendShipRepository();
  blockListRepo: BlockListRepository = new BlockListRepository();
  conversionsRepo: conversionsRepository = new conversionsRepository();
  otpRep: UserOTPsRepository = new UserOTPsRepository(otpModel);
  blackListedRep: BlackListedTokenRepository = new BlackListedTokenRepository(
    blackListedTokensModel
  );
  s3 = new S3ClientService();

  uploadProfilePic = async (req: Request, res: Response) => {
    const { userData } = (req as IRequest).loggedInUser;
    const coverPic = req.file;

    // check for the user
    if (!userData) throw new BadRequestException("please login");

    // check if the file is not send
    if (!coverPic) throw new BadRequestException("please upload photo first");

    // upload the photo in AWS s3
    const { url, key_name } = await this.s3.uploadFileOnS3(
      coverPic as Express.Multer.File,
      `${userData?._id}/Profile-Pic`
    );

    // store the key in the DB
    userData.profilePicture = key_name;
    await userData.save();

    return res.status(200).json(
      SuccessResponse("profile-pic uploaded successfully", 200, {
        url,
        key_name,
      })
    );
  };

  uploadCoverPic = async (req: Request, res: Response) => {
    const { userData } = (req as IRequest).loggedInUser;
    const coverPic = req.file;

    // check for the user
    if (!userData) throw new BadRequestException("please login");

    // check if the file is not send
    if (!coverPic) throw new BadRequestException("please upload photo first");

    // upload the photo in AWS s3
    const { url, key_name } = await this.s3.uploadFileOnS3(
      coverPic as Express.Multer.File,
      `${userData?._id}/Cover-Pic`
    );

    // store the key in the DB
    userData.coverPicture = key_name;
    await userData.save();

    return res.status(200).json(
      SuccessResponse("cover-pic uploaded successfully", 200, {
        url,
        key_name,
      })
    );
  };

  renewSignedUrl = async (req: Request, res: Response) => {
    const { userData } = (req as IRequest).loggedInUser;
    const { key, key_type } = req.body as {
      key: string;
      key_type: "profilePicture" | "coverPicture";
    };

    // check for the user
    if (!userData) throw new BadRequestException("please login");

    // check if the key is exist in the user model
    if (!userData[key_type]) throw new BadRequestException("Invaild Key");

    // renew the url
    const url = await this.s3.getFileWithSignedURL(key);

    return res
      .status(200)
      .json(SuccessResponse("url has been renewed", 200, { url, key }));
  };

  // --------------------------- frind ship APIS --------------------------------
  sendFriendRequest = async (req: Request, res: Response) => {
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { receiverId } = req.params;

    // check if the receiver is exist
    if (!receiverId) throw new BadRequestException("insert reciver Id");
    const isExist = await this.userRep.findDocumentById(
      receiverId as unknown as Types.ObjectId
    );
    if (!isExist) throw new BadRequestException("this user is not exist");

    // check if the sender and receiver ID are the same
    if ((receiverId as unknown as Types.ObjectId) == _id)
      throw new BadRequestException("can't send request to yourself");

    // check if they are not blocking
    if (await isBlockingEachOther(_id, receiverId as unknown as Types.ObjectId))
      throw new BadRequestException("Can't take this action");

    // check if the request has not been send already
    const isSendBefore = await this.friendShipReop.findOneDocument({
      $or: [
        { receiverId: receiverId as unknown as Types.ObjectId },
        { senderId: receiverId as unknown as Types.ObjectId },
      ],
    });

    if (isSendBefore) {
      // if the request is rejected , send it again
      if (isSendBefore.status == friendShipStatusEnum.REJECTED) {
        isSendBefore.status = friendShipStatusEnum.PENDING;
        await isSendBefore.save();
        return res
          .status(200)
          .json(SuccessResponse("request resend successfully", 200));
      } else if (isSendBefore.status == friendShipStatusEnum.ACCEPTED) {
        return res
          .status(200)
          .json(SuccessResponse("you are already friends", 200));
      }
    } else {
      // creat new request
      await this.friendShipReop.createNewDocument({
        senderId: _id,
        receiverId: receiverId as unknown as Types.ObjectId,
      });
    }

    res.status(200).json(SuccessResponse("request send successfully", 200));
  };

  listFriendRequests = async (req: Request, res: Response) => {
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { status } = req.query;

    // check for the status
    const filter: FilterQuery<IFriendShip> = {
      status: status ? status : friendShipStatusEnum.PENDING,
    };

    if (filter.status == friendShipStatusEnum.ACCEPTED) {
      // show the user's friends
      filter.$or = [{ receiverId: _id }, { senderId: _id }];
    } else {
      // show the pending and rejected requests that the user has
      filter.receiverId = _id;
    }

    // get the list from DB
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

  responseToFriendRequest = async (req: Request, res: Response) => {
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { senderId } = req.params;
    const { response } = req.body as {
      response: friendShipStatusEnum;
    };

    const request = await this.friendShipReop.findOneDocument({
      senderId,
      receiverId: _id,
      status: friendShipStatusEnum.PENDING,
    });

    if (!request) throw new BadRequestException("this request if not valid");

    request.status = response;
    await request.save();

    res.status(200).json(SuccessResponse(`request has been ${response}`, 200));
  };

  cancelFriendRequest = async (req: Request, res: Response) => {
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { receiverId } = req.params;

    // cancel only the pending request the the user send
    const isExist = await this.friendShipReop.deleteOneDocument({
      senderId: _id,
      receiverId,
      status: friendShipStatusEnum.PENDING,
    });

    if (!(isExist as DeleteResult).deletedCount)
      throw new BadRequestException(
        "this request is already canceled or accepted"
      );

    res.status(200).json(SuccessResponse("request has been canceled", 200));
  };

  deleteRejectedRequest = async (req: Request, res: Response) => {
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { receiverId } = req.params;

    // delete only the request that the receiver reject
    const isExist = await this.friendShipReop.deleteOneDocument({
      senderId: _id,
      receiverId,
      status: friendShipStatusEnum.REJECTED,
    });

    if (!(isExist as DeleteResult).deletedCount)
      throw new BadRequestException("this request is already deleted");

    res.status(200).json(SuccessResponse("request has been deleted", 200));
  };

  removeFriend = async (req: Request, res: Response) => {
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { friendId } = req.params;

    // delete the users friendship if they are already friends to each other
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

    if (!(isExist as DeleteResult).deletedCount)
      throw new BadRequestException("you are already not friends");

    res.status(200).json(SuccessResponse("friend has been removed", 200));
  };

  blockUser = async (req: Request, res: Response) => {
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { blockedUserId } = req.params;

    // check is this user is exist
    const isExist = await this.userRep.findDocumentById(
      blockedUserId as unknown as Types.ObjectId
    );
    if (!isExist) throw new BadRequestException("this user is not exist");

    // check if the one who will be blocked didn't block the user in the first place
    const isBlocked = await this.blockListRepo.findOneDocument({
      userID: blockedUserId,
      theBlockedUser: _id,
    });
    if (isBlocked)
      throw new BadRequestException("this user already blocked you");

    // block the user
    this.blockListRepo.FindAndUpdateOrCreate({
      userID: _id,
      theBlockedUser: blockedUserId as unknown as Types.ObjectId,
    });

    // delete any friend request between this users
    this.friendShipReop.deleteOneDocument({
      $or: [
        { senderId: _id, receiverId: blockedUserId },
        { senderId: blockedUserId, receiverId: _id },
      ],
    });

    res.status(200).json(SuccessResponse("user has been blocked", 200));
  };

  listBlockedUsers = async (req: Request, res: Response) => {
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };

    // get the list from DB
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

  unBlockUser = async (req: Request, res: Response) => {
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { blockedUserId } = req.params;

    // Check if user is blocked before attempting to unblock
    const isBlocked = await this.blockListRepo.deleteOneDocument({
      userID: _id,
      theBlockedUser: blockedUserId,
    });
    if (!(isBlocked as DeleteResult).deletedCount)
      throw new BadRequestException("you can't unblock this user");

    res.status(200).json(SuccessResponse("user has been unblocked", 200));
  };

  createGroup = async (req: Request, res: Response) => {
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { name, members } = req.body;

    // check for the members in DB
    const membersExist = await this.userRep.findDocuments({
      _id: {
        $in: members,
      },
    });
    if (members.length != (membersExist as string[]).length)
      throw new BadRequestException("members not found");

    // check if the users are friends
    const isFriends = await this.friendShipReop.findDocuments({
      $or: [
        { senderId: _id, receiverId: { $in: members } },
        { receiverId: _id, senderId: { $in: members } },
      ],
      status: friendShipStatusEnum.ACCEPTED,
    });

    if (members.length != (isFriends as string[]).length)
      throw new BadRequestException("members are not friends");

    const group = await this.conversionsRepo.createNewDocument({
      type: conversionTypeEnum.GROUP,
      name,
      members: [...members, _id],
    });

    res.status(201).json(SuccessResponse("group created", 201, group));
  };
  // ----------------------------------------------------------------------------

  updateProfileData = async (req: Request, res: Response) => {
    // get loggedIn user
    const { userData } = (req as IRequest).loggedInUser;
    // get data to be updated
    const { userName, gender, isPublic, phoneNumber, DOB } = req.body as IUser;

    // encrypt phoneNumber
    let encryptedPhoneNumber = undefined;
    if (phoneNumber) encryptedPhoneNumber = encrypt(phoneNumber as string);

    const newData = {
      userName: userName || userData?.userName,
      gender: gender || userData?.gender,
      isPublic: isPublic || userData?.isPublic,
      phoneNumber: encryptedPhoneNumber || userData?.phoneNumber,
      DOB: DOB || userData?.DOB,
    };

    // update the user
    this.userRep.updateOneDocument({ _id: userData?._id }, newData);

    res.status(200).json(SuccessResponse("data updated succeccfully"));
  };
  updateEmail = async (req: Request, res: Response) => {
    // get loggedIn user
    const { userData } = (req as IRequest).loggedInUser;
    // get the new email
    const { newEmail } = req.body;

    // check if the new email is exist
    const isNewEmailExist = await this.userRep.findOneDocument({
      _id: { $ne: userData?._id },
      email: newEmail,
    });
    if (isNewEmailExist)
      throw new BadRequestException("this email already exist");

    // check if the new email is the current one
    if (userData?.email == newEmail)
      throw new BadRequestException("this is your current email");

    // send an email to the user to confirm the new one
    const nanoid = customAlphabet("1234567890", 6);
    const OTP: string = nanoid();

    // send email with the OTP
    emitter.emit("sendEmail", {
      to: newEmail,
      subject: "Confirm New Email",
      content: CHANGE_EMAIL_VERIFICATION(OTP, newEmail),
    });

    // hash the otp
    const hasedOTP = await hashingData(
      OTP,
      parseInt(process.env.SALT_ROUNDS as string)
    );

    // send the otp to the DB
    await this.otpRep.createNewDocument({
      userId: userData?._id as Types.ObjectId,
      confirm: hasedOTP,
      expiration: new Date(
        Date.now() + parseInt(process.env.OTPS_EXPIRES_IN_MIN!) * 60 * 1000
      ),
    });

    res.status(200).json(SuccessResponse("please check your new email"));
  };
  confirmNewEmail = async (req: Request, res: Response) => {
    // get loggedIn user
    const { userData, accessTokenData, refreshTokenData } = (req as IRequest)
      .loggedInUser;
    // get the new email and the OTP
    const { newEmail, OTP } = req.body;

    // find the otp of this user
    const userOTP = await this.otpRep.findOneDocument({
      userId: userData?._id,
    });
    console.log(userData);

    if (!userOTP || userOTP.expiration < new Date()) {
      throw new BadRequestException("otp Expired, try to register again");
    }

    // check if the otp is correct
    const correctOTP: string = userOTP.confirm as string;
    const isCorrect = await compareHashedData(OTP, correctOTP);
    if (!isCorrect) {
      throw new BadRequestException("wrong OTP");
    }

    // delete the otp from DB
    await this.otpRep.deleteOneDocument({
      userId: userData?._id,
    });

    // send welcome email
    emitter.emit("sendEmail", {
      to: newEmail,
      subject: "Welcome Email",
      content: EMAIL_UPDATED_NOTIFICATION(
        userData?.email as string,
        userData?.userName as string
      ),
    });

    // update the new email
    if (userData) userData.email = newEmail;

    // revoke the token to log out the user
    await this.blackListedRep.createNewDocument({
      accsessTokenId: accessTokenData?.jti,
      refreshTokenId: refreshTokenData?.jti,
      expirationDate: new Date((accessTokenData?.exp as number) * 1000),
    });

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
  updatePassword = async (req: Request, res: Response) => {
    // get loggedIn user
    const { userData } = (req as IRequest).loggedInUser;
    // get the old and new Passwords
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // check if the new password and the confirm one is matches
    if (newPassword !== confirmNewPassword)
      throw new BadRequestException("passwords don't match");

    // check if the old password is the correct one
    const isCorrect = await compareHashedData(
      oldPassword,
      userData?.password as string
    );
    if (!isCorrect) throw new BadRequestException("wrong password");

    // check if the new password is the old one
    if (oldPassword == newPassword)
      throw new BadRequestException(
        "can't change the password to the current one"
      );

    // has the new password and update it
    const hasedPassword = await hashingData(
      newPassword as string,
      parseInt(process.env.SALT_ROUNDS as string)
    );
    if (userData) userData.password = hasedPassword;
    userData?.save();

    // send an email to inform the user about
    emitter.emit("sendEmail", {
      to: userData!.email,
      subject: `password Changed`,
      content: PASSWORD_CHANGED(),
    });

    res.status(200).json(SuccessResponse("password has been changed"));
  };

  getYourProfileData = async (req: Request, res: Response) => {
    //get loggedIn user
    const {
      userData: { userName, email, phoneNumber, DOB, isPublic, gender },
    } = (req as IRequest).loggedInUser as { userData: IUser };

    // decrypt the phone number
    const decryptedPhoneNumber = decrypt(phoneNumber as string);

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

  viewProfile = async (req: Request, res: Response) => {
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { userID } = req.params;

    // search for the user
    const user = await this.userRep.findOneDocument(
      { _id: userID },
      "userName gender coverPicture profilePicture "
    );
    if (!user) throw new BadRequestException("this user not found");

    // get friend state
    const friendState = await this.friendShipReop.findOneDocument({
      $or: [
        { senderId: user._id, receiverId: _id },
        { senderId: _id, receiverId: (user as IUser)._id },
      ],
    });

    res.status(200).json(
      SuccessResponse("here is user profile", 200, {
        user,
        friendState: friendState?.status || "not friends",
      })
    );
  };

  deActivateAccount = async (req: Request, res: Response) => {
    //get loggedIn user
    const { userData, accessTokenData, refreshTokenData } = (req as IRequest)
      .loggedInUser;

    // deactivate the account
    userData!.isDeactivated = true;
    userData?.save();

    // revoke the token to log out the user
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

  deleteAccount = async (req: Request, res: Response) => {
    // delete user account from user nodel
    // delete any otm for the user
    // delete user's photos from s3
    // delete user's posts
    // delete user's comments and replyes
    // delete user's friendShips
    // delete user's messages
    // delete the user from any group he joined
  };
}

export default new UserService();
