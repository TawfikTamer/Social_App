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
import {
  CommentRepository,
  FriendShipRepository,
  PostRepository,
  reactionRepository,
} from "../../../DB/Repositories";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  emitter,
  pagination,
  S3ClientService,
  SuccessResponse,
  USER_MENTION_NOTIFICATION,
} from "../../../Utils";
import { FilterQuery, Types } from "mongoose";

class PostService {
  friendShipReop: FriendShipRepository = new FriendShipRepository();
  postRepo: PostRepository = new PostRepository();
  commentRepo: CommentRepository = new CommentRepository();
  reactionRepo: reactionRepository = new reactionRepository();
  s3 = new S3ClientService();

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {POST} /api/add-post
   * @description Create a new post with optional attachments and friend tags
   */
  addPost = async (req: Request, res: Response) => {
    // Get logged in user and post data
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { description, allowComments, tags } = req.body;
    const files = req.files as Express.Multer.File[];

    // Validate post content
    if (!description && !files?.length)
      throw new BadRequestException("description or files is required");

    // Handle user tags
    let uniqueTages: Types.ObjectId[] = [];
    if (tags) {
      // Remove duplicate tags
      uniqueTages = Array.from(new Set(tags));

      // Verify tagged users are friends
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

      // Validate all tagged users are valid friends
      const filterdFriends = (friends as IFriendShip[]).filter((result) => {
        if (result.senderId != null && result.receiverId != null) return result;
      });
      if (filterdFriends.length !== uniqueTages.length)
        throw new BadRequestException(
          "Invalid tags, you can only mention your friends"
        );

      // Send notification emails to tagged friends
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

    // Create initial post record
    let attachments: string[] = [];
    const post = await this.postRepo.createNewDocument({
      description,
      attachments,
      ownerId: _id,
      allowComments,
      tags: uniqueTages,
    });

    // Handle file attachments
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

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {PUT} /api/update-post/:postId
   * @description Update an existing post's content, settings, and tags
   */
  updatePost = async (req: Request, res: Response) => {
    // Get user and post data
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { postId } = req.params;
    const { description, allowComments, tags } = req.body;

    // Verify post exists
    const post = await this.postRepo.findDocumentById(
      postId as unknown as Types.ObjectId
    );
    if (!post) throw new NotFoundException("this post is not exist");

    // Verify post ownership
    if (!post.ownerId.equals(_id))
      throw new UnauthorizedException("you can't edit others posts");

    // Handle updated tags
    let uniqueTages: Types.ObjectId[] = [];
    if (tags) {
      // Remove duplicate tags
      uniqueTages = Array.from(new Set(tags));

      // Verify tagged users are friends
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

      // Validate all tagged users are valid friends
      const filterdFriends = (friends as IFriendShip[]).filter((result) => {
        if (result.senderId != null && result.receiverId != null) return result;
      });
      if (filterdFriends.length !== uniqueTages.length)
        throw new BadRequestException(
          "Invalid tags, you can only mention your friends"
        );

      // Send notification emails to newly tagged friends
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

    // Update post content and settings
    if (description) post.description = description;
    if (allowComments) post.allowComments = allowComments;

    // Save changes
    await post.save();

    res.status(200).json(SuccessResponse("post changed successfully"));
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {PATCH} /api/post-visibility/:postId
   * @description Change visibility settings of a post (public, friends, private)
   */
  changePostVisibility = async (req: Request, res: Response) => {
    // Get user and post data
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { postId } = req.params;
    const { visibility } = req.body;

    // Verify post exists
    const post = await this.postRepo.findDocumentById(
      postId as unknown as Types.ObjectId
    );
    if (!post) throw new NotFoundException("this post is not exist");

    // Verify post ownership
    if (!post.ownerId.equals(_id))
      throw new UnauthorizedException("you can't edit others posts");

    // Update and save visibility setting
    post.visibility = visibility;
    await post.save();

    res.status(200).json(SuccessResponse("post visibility has been changed"));
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {DELETE} /api/delete-post/:postId
   * @description Delete a post and all associated content (comments, reactions, attachments)
   */
  deletePost = async (req: Request, res: Response) => {
    // Get user and post data
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { postId } = req.params;

    // Verify post exists
    const post = await this.postRepo.findDocumentById(
      postId as unknown as Types.ObjectId
    );
    if (!post) throw new NotFoundException("this post is not exist");

    // Verify post ownership
    if (!post.ownerId.equals(_id))
      throw new UnauthorizedException("you can't delete others posts");

    // Delete post attachments from S3
    if (post.attachments?.length)
      await this.s3.deleteFolderFromS3(`${_id}/Posts/${post._id}`);

    // Find all comments on the post
    const comments = await this.commentRepo.findDocuments({
      refId: post._id as Types.ObjectId,
      onModel: commentOnModelEnum.POST,
    });

    // Process each comment and its replies
    for (const comment of comments as IComment[]) {
      // Get all replies to the comment
      const replies = await this.commentRepo.findDocuments({
        refId: comment._id,
        onModel: commentOnModelEnum.COMMENT,
      });

      // Delete reactions on comments and replies
      const repliesId = (replies as IComment[]).map((reply) => reply._id);
      await this.reactionRepo.deleteManyDocuments({
        reactOn: {
          $in: [comment._id, ...repliesId, postId],
        },
      });

      // Delete reply comments
      await this.commentRepo.deleteManyDocuments({
        refId: comment._id,
        onModel: commentOnModelEnum.COMMENT,
      });

      // Delete reply attachments
      await this.s3.deleteFolderFromS3(
        `${comment.ownerId}/Comments/${comment._id}`
      );
    }

    // Delete main comments
    await this.commentRepo.deleteManyDocuments({
      refId: post._id as Types.ObjectId,
      onModel: commentOnModelEnum.POST,
    });

    // Delete the post itself
    await post.deleteOne();
    res.status(200).json(SuccessResponse("post deleted successfully"));
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {GET} /api/list-posts
   * @description List posts based on filters (home feed, user profile, or own posts)
   */
  listPosts = async (req: Request, res: Response) => {
    // Get user and query parameters
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { page, limit, userId, home } = req.query;

    // Set up pagination
    const { limit: currentLimit } = pagination({
      page: Number(page),
      limit: Number(limit),
    });

    // Validate query parameters
    if (userId && home)
      throw new BadRequestException("wrong query, only home or userId");

    // Build filter based on request type
    let filter: FilterQuery<IPost> = {};

    if (userId) {
      // List specific user's posts
      filter.ownerId = userId;
    } else if (home) {
      // List home feed (posts from others)
      filter.ownerId = { $ne: _id };
      filter.visibility = {
        $in: [postVisibilityEnum.FRIENDS, postVisibilityEnum.PUBLIC],
      };
    } else {
      // List user's own posts
      filter.ownerId = _id;
    }

    // Fetch posts with pagination
    const unFilterdposts = await this.postRepo.postsPagination(filter, {
      select: "description visibility ownerId",
      limit: currentLimit,
      page: Number(page),
      customLabels: {
        meta: "meta",
      },
    });

    // Apply additional filters for visibility
    let posts = {};
    if (home || userId) {
      // Get user's friend list
      const userFriends = await this.friendShipReop.findDocuments({
        $or: [{ senderId: _id }, { receiverId: _id }],
        status: friendShipStatusEnum.ACCEPTED,
      });

      // Extract friend IDs
      let friends = (userFriends as IFriendShip[]).map((friend) => {
        if (friend.senderId.equals(_id)) return friend.receiverId.toString();
        else return friend.senderId.toString();
      });

      // Filter posts based on visibility and friendship
      posts = unFilterdposts.docs.filter((post) => {
        if (post.visibility == postVisibilityEnum.FRIENDS) {
          return friends.includes(post.ownerId.toString());
        } else return post;
      });
    } else {
      // Return all posts for user's own feed
      posts = unFilterdposts;
    }

    res
      .status(200)
      .json(SuccessResponse("Posts fetched successfully", 200, posts));
  };

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @API {GET} /api/get-post/:postId
   * @description Get a single post by ID with visibility checks
   */
  getPost = async (req: Request, res: Response) => {
    // Get user and post data
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { postId } = req.params;

    // Verify post exists
    const post = await this.postRepo.findDocumentById(
      postId as unknown as Types.ObjectId
    );
    if (!post) throw new NotFoundException("this post is not exist");

    // Check private post visibility
    if (post.visibility == postVisibilityEnum.ONLY_ME) {
      if (!post.ownerId.equals(_id))
        throw new UnauthorizedException("this post is private");
    }

    // Check friends-only post visibility
    if (post.visibility == postVisibilityEnum.FRIENDS) {
      // Verify friendship status
      const isFriends = await this.friendShipReop.findOneDocument({
        $or: [
          { senderId: _id, receiverId: post.ownerId },
          { senderId: post.ownerId, receiverId: _id },
        ],
        status: friendShipStatusEnum.ACCEPTED,
      });
      if (!isFriends)
        throw new UnauthorizedException("this post is for friends only");
    }

    res
      .status(200)
      .json(SuccessResponse("Posts fetched successfully", 200, post));
  };
}

export default new PostService();
