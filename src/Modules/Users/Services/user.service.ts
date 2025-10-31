import { Request, Response } from "express";
import { userModel } from "../../../DB/models";
import {
  BlockListRepository,
  conversionsRepository,
  UserRepository,
} from "../../../DB/Repositories";
import {
  BadRequestException,
  isBlockingEachOther,
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
import { IFriendShip } from "../../../Common/Interfaces/friendShip.interface";

class UserService {
  userRep: UserRepository = new UserRepository(userModel);
  friendShipReop: FriendShipRepository = new FriendShipRepository();
  blockListRepo: BlockListRepository = new BlockListRepository();
  conversionsRepo: conversionsRepository = new conversionsRepository();

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
          },
          {
            path: "receiverId",
            select: "userName ",
          },
        ],
      }
    );

    const groups = await this.conversionsRepo.findDocuments({
      members: { $in: [_id] },
      type: conversionTypeEnum.GROUP,
    });
    res
      .status(200)
      .json(
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
  updateProfileData = async (req: Request, res: Response) => {};
  updateEmail = async (req: Request, res: Response) => {};
  updatePassword = async (req: Request, res: Response) => {};
  deleteAccount = async (req: Request, res: Response) => {};
  activateAccount = async (req: Request, res: Response) => {};
  deActivateAccount = async (req: Request, res: Response) => {};
  getProfileData = async (req: Request, res: Response) => {};
}

export default new UserService();
