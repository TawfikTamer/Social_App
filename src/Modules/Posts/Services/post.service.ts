import { Request, Response } from "express";
import {
  commentOnModelEnum,
  friendShipStatusEnum,
  IComment,
  IFriendShip,
  IPost,
  IRequest,
  IUser,
  postVisibilityEnum,
} from "../../../Common";
import { userModel } from "../../../DB/models";
import {
  BlockListRepository,
  CommentRepository,
  FriendShipRepository,
  PostRepository,
  UserRepository,
} from "../../../DB/Repositories";
import {
  BadRequestException,
  emitter,
  pagination,
  S3ClientService,
  SuccessResponse,
  USER_MENTION_NOTIFICATION,
} from "../../../Utils";
import { FilterQuery, Types } from "mongoose";

class PostService {
  userRepo: UserRepository = new UserRepository(userModel);
  friendShipReop: FriendShipRepository = new FriendShipRepository();
  postRepo: PostRepository = new PostRepository();
  commentRepo: CommentRepository = new CommentRepository();
  blockListRepo: BlockListRepository = new BlockListRepository();
  s3 = new S3ClientService();

  addPost = async (req: Request, res: Response) => {
    // get logged in user
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    // get post data
    const { description, allowComments, tags } = req.body;
    const files = req.files as Express.Multer.File[];

    // make sure there is at least one data for the post
    if (!description && !files?.length)
      throw new BadRequestException("description or files is required");

    // handel tages
    let uniqueTages: Types.ObjectId[] = [];
    if (tags) {
      // check if the tags is not doublicated
      uniqueTages = Array.from(new Set(tags));

      // check if the tags and the post owners are friends
      const friends = await this.friendShipReop.findDocuments(
        {
          status: friendShipStatusEnum.ACCEPTED,
          $or: [
            { receiverId: _id, senderId: { $in: uniqueTages } },
            { receiverId: { $in: uniqueTages }, senderId: _id },
          ],
        },
        "-status -__v",
        {
          populate: [
            {
              path: "senderId",
              select: "_id userName email",
            },
            {
              path: "receiverId",
              select: "_id userName email",
            },
          ],
        }
      );

      // check if the tags is for valid users
      const filterdFriends = (friends as IFriendShip[]).filter((result) => {
        if (result.senderId != null && result.receiverId != null) return result;
      });
      if (filterdFriends.length !== uniqueTages.length)
        throw new BadRequestException(
          "Invalid tags, you can only mention your friends"
        );

      // send notification (email) to the users in the tags about that post
      (filterdFriends as IFriendShip[]).map((result) => {
        if (result.senderId._id.equals(_id))
          emitter.emit("sendEmail", {
            to: (result.receiverId as unknown as IUser).email,
            subject: "You've Been Mentioned",
            content: USER_MENTION_NOTIFICATION(
              (result.senderId as unknown as IUser).userName
            ),
          });
        else
          emitter.emit("sendEmail", {
            to: (result.senderId as unknown as IUser).email,
            subject: "You've Been Mentioned",
            content: USER_MENTION_NOTIFICATION(
              (result.receiverId as unknown as IUser).userName
            ),
          });
      });
    }

    let attachments: string[] = [];
    // create post
    const post = await this.postRepo.createNewDocument({
      description,
      attachments,
      ownerId: _id,
      allowComments,
      tags: uniqueTages,
    });

    // upload any attachments
    if (files?.length) {
      const uploadedData = await this.s3.uploadFilesOnS3(
        files,
        `${_id}/Posts/${post._id}`
      );
      attachments = uploadedData.map(({ key_name }) => key_name);
    }
    post.attachments = attachments;
    post.save();

    return res
      .status(201)
      .json(SuccessResponse("Post added successfully", 201, post));
  };

  updatePost = async (req: Request, res: Response) => {
    // get logged in user
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    // get post id
    const { postId } = req.params;
    // get updated data
    const { description, allowComments, tags } = req.body;

    // find the post
    const post = await this.postRepo.findDocumentById(
      postId as unknown as Types.ObjectId
    );
    if (!post) throw new BadRequestException("this post is not exist");

    // check if this post belongs to user
    if (!post.ownerId.equals(_id))
      throw new BadRequestException("you can't edit others posts");

    // handel tages
    let uniqueTages: Types.ObjectId[] = [];
    if (tags) {
      // check if the tags is not doublicated
      uniqueTages = Array.from(new Set(tags));

      // check if the tags and the post owners are friends
      const friends = await this.friendShipReop.findDocuments(
        {
          status: friendShipStatusEnum.ACCEPTED,
          $or: [
            { receiverId: _id, senderId: { $in: uniqueTages } },
            { receiverId: { $in: uniqueTages }, senderId: _id },
          ],
        },
        "-status -__v",
        {
          populate: [
            {
              path: "senderId",
              select: "_id userName email",
            },
            {
              path: "receiverId",
              select: "_id userName email",
            },
          ],
        }
      );

      // check if the tags is for valid users
      const filterdFriends = (friends as IFriendShip[]).filter((result) => {
        if (result.senderId != null && result.receiverId != null) return result;
      });
      if (filterdFriends.length !== uniqueTages.length)
        throw new BadRequestException(
          "Invalid tags, you can only mention your friends"
        );

      // send notification (email) to the users in the tags about that post
      (filterdFriends as IFriendShip[]).map((result) => {
        if (result.senderId._id.equals(_id))
          emitter.emit("sendEmail", {
            to: (result.receiverId as unknown as IUser).email,
            subject: "You've Been Mentioned",
            content: USER_MENTION_NOTIFICATION(
              (result.senderId as unknown as IUser).userName
            ),
          });
        else
          emitter.emit("sendEmail", {
            to: (result.senderId as unknown as IUser).email,
            subject: "You've Been Mentioned",
            content: USER_MENTION_NOTIFICATION(
              (result.receiverId as unknown as IUser).userName
            ),
          });
      });
      post.tags = uniqueTages;
    }

    // update the description
    if (description) post.description = description;

    // update comments allowance
    if (allowComments) post.allowComments = allowComments;

    // save the new changes
    await post.save();

    res.status(200).json(SuccessResponse("post changed successfully"));
  };

  changePostVisibility = async (req: Request, res: Response) => {
    // get logged in user
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    // get post id
    const { postId } = req.params;
    // get updated data
    const { visibility } = req.body;

    // find the post
    const post = await this.postRepo.findDocumentById(
      postId as unknown as Types.ObjectId
    );
    if (!post) throw new BadRequestException("this post is not exist");

    // check if this post belongs to user
    if (!post.ownerId.equals(_id))
      throw new BadRequestException("you can't edit others posts");

    post.visibility = visibility;
    await post.save();

    res.status(200).json(SuccessResponse("post visibility has been changed"));
  };

  // Delete post
  deletePost = async (req: Request, res: Response) => {
    // get logged in user
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    // get post id
    const { postId } = req.params;

    // find the post
    const post = await this.postRepo.findDocumentById(
      postId as unknown as Types.ObjectId
    );
    if (!post) throw new BadRequestException("this post is not exist");

    // check if this post belongs to user
    if (!post.ownerId.equals(_id))
      throw new BadRequestException("you can't delete others posts");

    // delete post attachments
    if (post.attachments?.length)
      await this.s3.deleteFolderFromS3(`${_id}/Posts/${post._id}`);

    // delete comments on this post
    // find all comments on that post
    const comments = await this.commentRepo.findDocuments({
      refId: post._id as Types.ObjectId,
      onModel: commentOnModelEnum.POST,
    });

    // delete replies for each comment
    for (const comment of comments as IComment[]) {
      await this.commentRepo.deleteManyDocuments({
        refId: comment._id,
        onModel: commentOnModelEnum.COMMENT,
      });
      await this.s3.deleteFolderFromS3(
        `${comment.ownerId}/Comments/${comment._id}`
      );
    }

    // delete all main comments on that post
    await this.commentRepo.deleteManyDocuments({
      refId: post._id as Types.ObjectId,
      onModel: commentOnModelEnum.POST,
    });

    // delete the post
    await post.deleteOne();
    res.status(200).json(SuccessResponse("post deleted successfully"));
  };

  // list posts
  listPosts = async (req: Request, res: Response) => {
    // get logged in user
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { page, limit, userId, home } = req.query;

    // prepare the limits for pagination
    const { limit: currentLimit } = pagination({
      page: Number(page),
      limit: Number(limit),
    });

    // check what we will list
    if (userId && home)
      throw new BadRequestException("wrong query, only home or userId");

    // check which post will be list
    let filter: FilterQuery<IPost> = {};

    // list specific user's posts
    if (userId) filter.ownerId = userId;
    // list home page posts
    else if (home) {
      filter.ownerId = { $ne: _id };
      filter.visibility = {
        $in: [postVisibilityEnum.FRIENDS, postVisibilityEnum.PUBLIC],
      };
    }
    // list user's own posts
    else filter.ownerId = _id;

    // get all the posts with public and friends visibility
    const unFilterdposts = await this.postRepo.postsPagination(filter, {
      select: "description visibility ownerId",
      limit: currentLimit,
      page: Number(page),
      customLabels: {
        meta: "meta",
      },
    });

    // filter the posts
    let posts = {};
    if (home || userId) {
      // get the loggedIn user's friends
      const userFriends = await this.friendShipReop.findDocuments({
        $or: [{ senderId: _id }, { receiverId: _id }],
        status: friendShipStatusEnum.ACCEPTED,
      });
      // filter userFriends array to get only the IDs of the users excepte the logged in one
      let friends = (userFriends as IFriendShip[]).map((friend) => {
        if (friend.senderId.equals(_id)) return friend.receiverId.toString();
        else return friend.senderId.toString();
      });

      posts = unFilterdposts.docs.filter((post) => {
        if (post.visibility == postVisibilityEnum.FRIENDS) {
          // make sure the users are friends to each other to see the posts with friends visibility
          if (friends.includes(post.ownerId.toString())) {
            return post;
          }
        } else return post;
      });
    }
    // if the user wants to see his posts, just fetch all of them
    else posts = unFilterdposts;

    res
      .status(200)
      .json(SuccessResponse("Posts fetched successfully", 200, posts));
  };

  // get post by id
  getPost = async (req: Request, res: Response) => {
    // get logged in user
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { postId } = req.params;

    // check if the post exist
    const post = await this.postRepo.findDocumentById(
      postId as unknown as Types.ObjectId
    );
    if (!post) throw new BadRequestException("this post is not exist");

    // check if the post is private
    if (post.visibility == postVisibilityEnum.ONLY_ME) {
      if (!post.ownerId.equals(_id))
        throw new BadRequestException("this post is private");
    }

    // check if the post is for friends only
    if (post.visibility == postVisibilityEnum.FRIENDS) {
      // check if the user is a friend
      const isFriends = await this.friendShipReop.findOneDocument({
        $or: [
          { senderId: _id, receiverId: post.ownerId },
          { senderId: post.ownerId, receiverId: _id },
        ],
        status: friendShipStatusEnum.ACCEPTED,
      });
      if (!isFriends)
        throw new BadRequestException("this post is for friends only");
    }

    res
      .status(200)
      .json(SuccessResponse("Posts fetched successfully", 200, post));
  };
}

export default new PostService();
