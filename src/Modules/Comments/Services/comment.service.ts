import { Request, Response } from "express";
import {
  CommentRepository,
  FriendShipRepository,
  PostRepository,
  reactionRepository,
} from "../../../DB/Repositories";
import {
  BadRequestException,
  S3ClientService,
  SuccessResponse,
} from "../../../Utils";
import {
  commentOnModelEnum,
  friendShipStatusEnum,
  IComment,
  IRequest,
  IUser,
  postVisibilityEnum,
} from "../../../Common";
import { Types } from "mongoose";

/**
 * Service class handling all comment-related operations including adding, updating,
 * deleting comments and replies, as well as retrieving comments with their associated data.
 */

class CommentService {
  friendShipReop: FriendShipRepository = new FriendShipRepository();
  commentRepo: CommentRepository = new CommentRepository();
  postRepo: PostRepository = new PostRepository();
  reactionRepo: reactionRepository = new reactionRepository();
  s3 = new S3ClientService();

  /**
   * Adds a new comment to a post
   * @route POST /comments/add-comment/:postId
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @access Private - Requires authentication
   * @returns {Promise<void>} 201 - Returns the newly created comment
   * @throws {BadRequestException} When post doesn't exist, is private, or doesn't allow comments
   */
  addComment = async (req: Request, res: Response) => {
    // get logged in user
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    // get post ID
    const { postId } = req.params;
    // get comment data
    const { content } = req.body as IComment;
    const file = req.file as Express.Multer.File;

    // check if the post is exist,
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

    // check if the post's owner allow comments
    if (!post.allowComments && post.ownerId != _id)
      throw new BadRequestException("this post doesn't allow comments");

    // add the comment
    const comment = {
      content,
      ownerId: _id,
      onModel: commentOnModelEnum.POST,
      refId: postId as unknown as Types.ObjectId,
    };
    const newComment = await this.commentRepo.createNewDocument(comment);

    // handle attachment
    let attachment: any;
    if (file) {
      attachment = await this.s3.uploadFileOnS3(
        file,
        `${_id}/Comments/${newComment._id}`
      );
      newComment.attachments = attachment.key_name;
      await newComment.save();
    }

    res.status(201).json(SuccessResponse("comment added", 201, newComment));
  };

  /**
   * Adds a reply to an existing comment
   * @route POST /comments/add-reply?commentId=:commentId
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @access Private - Requires authentication
   * @returns {Promise<void>} 201 - Returns the newly created reply
   * @throws {BadRequestException} When comment doesn't exist or underlying post has visibility restrictions
   */
  addReply = async (req: Request, res: Response) => {
    // get logged in user
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    // get comment ID
    const { commentId } = req.query;
    // get reply data
    const { content } = req.body as IComment;
    const file = req.file as Express.Multer.File;

    // check if the comment is exist
    const comment = await this.commentRepo.findDocumentById(
      commentId as unknown as Types.ObjectId
    );
    if (!comment)
      throw new BadRequestException(
        "you can't reply to this comment because it is not exist"
      );

    // get the post ID
    let postId;
    if (comment.onModel == commentOnModelEnum.POST)
      postId = (comment.refId as unknown as any)._id;
    else postId = (comment.refId as unknown as any).refId;

    // check if the post is exist,
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

    // check if the post's owner allow comments
    if (!post.allowComments && post.ownerId != _id)
      throw new BadRequestException("this post doesn't allow comments");

    // add the reply
    const reply = {
      content,
      ownerId: _id,
      onModel: commentOnModelEnum.COMMENT,
      refId: commentId as unknown as Types.ObjectId,
    };
    const newReply = await this.commentRepo.createNewDocument(reply);

    // handle attachment
    let attachment: any;
    if (file) {
      attachment = await this.s3.uploadFileOnS3(
        file,
        `${_id}/Comments/${commentId}/Replies/${newReply._id}`
      );
      newReply.attachments = attachment.key_name;
      await newReply.save();
    }

    res.status(201).json(SuccessResponse("reply added", 201, newReply));
  };

  /**
   * Updates the content of an existing comment or reply
   * @route PATCH /comments/update-comment/:commentId
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @access Private - Requires authentication and comment ownership
   * @returns {Promise<void>} 200 - Success message
   * @throws {BadRequestException} When comment doesn't exist or user isn't the owner
   */
  updateComment = async (req: Request, res: Response) => {
    // get logged in user
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { commentId } = req.params;
    const { newContent } = req.body;

    // get the comment or reply
    const comment = await this.commentRepo.findDocumentById(
      commentId as unknown as Types.ObjectId
    );
    if (!comment) throw new BadRequestException("this comment is not exist");

    // check if the user is the owner of the comment
    if (!comment.ownerId.equals(_id))
      throw new BadRequestException("you can't update others comments");

    // update the comment
    comment.content = newContent;
    await comment.save();

    res.status(200).json(SuccessResponse("comment has been updated"));
  };

  /**
   * Deletes a comment or reply and all associated data (reactions, attachments)
   * @route DELETE /comments/delete-comment/:commentId
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @access Private - Requires authentication and either comment ownership or post ownership
   * @returns {Promise<void>} 200 - Success message
   * @throws {BadRequestException} When comment doesn't exist or user lacks delete permission
   */
  deleteComment = async (req: Request, res: Response) => {
    // get logged in user
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { commentId } = req.params;

    // get the comment or reply
    const comment = await this.commentRepo.findDocumentById(
      commentId as unknown as Types.ObjectId,
      {},
      {
        populate: {
          path: "refId",
        },
      }
    );
    if (!comment) throw new BadRequestException("this comment is not exist");

    let postId;
    if (comment.onModel == commentOnModelEnum.POST)
      postId = (comment.refId as unknown as any)._id;
    else postId = (comment.refId as unknown as any).refId;

    // check if the post is exist,
    const post = await this.postRepo.findDocumentById(
      postId as unknown as Types.ObjectId
    );
    if (!post) throw new BadRequestException("this post is not exist");

    // check if the user is the owner of the comment or the user is the post owner
    if (!post.ownerId.equals(_id) && !comment.ownerId.equals(_id))
      throw new BadRequestException(
        "you don't have access to delete this comment"
      );

    // check if the comment has replies and delete them
    if (comment.onModel == commentOnModelEnum.POST) {
      const replies = await this.commentRepo.findDocuments({
        refId: comment._id,
      });

      // Map each reply id
      const repliesId =
        (replies as IComment[])?.map((reply) => reply._id) || [];

      // Delete the reactions on this comment and all its replies
      await this.reactionRepo.deleteManyDocuments({
        reactOn: {
          $in: [comment._id, ...repliesId],
        },
      });

      // delete the replies
      await this.commentRepo.deleteManyDocuments({
        refId: comment._id,
      });

      // delet comment and replies attachments
      await this.s3.deleteFolderFromS3(
        `${comment.ownerId}/Comments/${comment._id}`
      );
    } else {
      // if you want to delete a reply

      // delete its reactions
      await this.reactionRepo.deleteManyDocuments({
        reactOn: comment._id,
      });

      // delete its attachments
      await this.s3.deleteFolderFromS3(
        `${comment.ownerId}/Comments/${comment.refId._id}/Replies/${comment._id}`
      );
    }

    // delete the comment
    await comment.deleteOne();

    res.status(200).json(SuccessResponse("comment has been deleted"));
  };

  /**
   * Retrieves all comments for a specific post
   * @route GET /comments/post-comments/:postId
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @access Private - Requires authentication and appropriate post visibility permissions
   * @returns {Promise<void>} 200 - Returns array of comments
   * @throws {BadRequestException} When post doesn't exist or user lacks visibility permission
   */
  getAllComments = async (req: Request, res: Response) => {
    // get logged in user
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { postId } = req.params;

    // check if the post is exist,
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

    // get the comments of this post
    const comments = await this.commentRepo.findDocuments(
      { refId: postId },
      "content -_id"
    );

    res.status(200).json(SuccessResponse("comments featched", 200, comments));
  };

  /**
   * Retrieves a specific comment by its ID
   * @route GET /comments/get-comment/:commentId
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @access Private - Requires authentication
   * @returns {Promise<void>} 200 - Returns the requested comment
   * @throws {BadRequestException} When comment doesn't exist
   */
  getCommentById = async (req: Request, res: Response) => {
    const { commentId } = req.params;

    const comment = await this.commentRepo.findOneDocument({
      _id: commentId as unknown as Types.ObjectId,
      onModel: commentOnModelEnum.POST,
    });
    if (!comment) throw new BadRequestException("this comment is not exist");

    res.status(200).json(SuccessResponse("comment featched", 200, comment));
  };

  /**
   * Retrieves a comment along with all its replies using MongoDB aggregation
   * @route GET /comments/comment-with-replies/:commentId
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @access Private - Requires authentication
   * @returns {Promise<void>} 200 - Returns comment with nested replies array
   * @throws {BadRequestException} When comment doesn't exist
   */
  getCommentWithReplies = async (req: Request, res: Response) => {
    const { commentId } = req.params;

    // get the comment with its replies by aggregation
    const fullComment = await this.commentRepo.commentAggregation([
      {
        $match: {
          _id: new Types.ObjectId(commentId),
          onModel: commentOnModelEnum.POST,
        },
      },
      {
        $project: {
          _id: 1,
          content: 1,
          attachments: 1,
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "refId",
          as: "replies",
          pipeline: [
            {
              $project: {
                _id: 1,
                content: 1,
                attachments: 1,
              },
            },
          ],
        },
      },
    ]);
    if (!fullComment.length)
      throw new BadRequestException("this comment is not exist");

    res
      .status(200)
      .json(SuccessResponse("comment with replies featched", 200, fullComment));
  };
}

export default new CommentService();
