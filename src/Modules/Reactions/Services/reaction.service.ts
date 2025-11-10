import { Request, Response } from "express";
import { commentOnModelEnum, IRequest, IUser } from "../../../Common";
import {
  CommentRepository,
  PostRepository,
  reactionRepository,
} from "../../../DB/Repositories";

import { Types } from "mongoose";
import {
  BadRequestException,
  NotFoundException,
  SuccessResponse,
} from "../../../Utils";

/**
 * Service class handling all reaction-related operations including adding,
 * removing reactions on posts and comments, and listing reactions.
 */

class reactionService {
  postRepo: PostRepository = new PostRepository();
  commentRepo: CommentRepository = new CommentRepository();
  reactionRepo: reactionRepository = new reactionRepository();

  /**
   * Adds or updates a reaction on a post or comment
   * @route POST /reactions/react?postId=:postId OR ?commentId=:commentId
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @access Private - Requires authentication
   * @returns {Promise<void>} 201 - Success message
   * @throws {BadRequestException} When post/comment doesn't exist or invalid query parameters
   */
  reactOnSomething = async (req: Request, res: Response) => {
    // get logged in user
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { postId, commentId } = req.query;
    const { react } = req.body;

    // make sure only send post id or comment id not both
    if ((postId && commentId) || (!postId && !commentId))
      throw new BadRequestException("wrong query parameters");

    // if the react is on post, check if its exist
    let refModel = "";
    let reactOn = postId || commentId;
    if (postId) {
      const isPostExist = await this.postRepo.findDocumentById(
        postId as unknown as Types.ObjectId
      );
      if (!isPostExist) throw new NotFoundException("this post is not exist");
      refModel = commentOnModelEnum.POST;
    }

    // if the react is on comment, check if its exist
    if (commentId) {
      const iscommentExist = await this.commentRepo.findDocumentById(
        commentId as unknown as Types.ObjectId
      );
      if (!iscommentExist)
        throw new NotFoundException("this comment is not exist");
      refModel = commentOnModelEnum.COMMENT;
    }

    // add the react
    await this.reactionRepo.FindAndUpdateOrCreate(
      {
        reactOwner: _id,
        reactOn,
        refModel,
      },
      {
        react,
      }
    );
    res.status(201).json(SuccessResponse("reaction added successfully"));
  };

  /**
   * Removes a reaction from a post or comment
   * @route DELETE /reactions/unreact/:reactionId?postId=:postId OR ?commentId=:commentId
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @access Private - Requires authentication and reaction ownership
   * @returns {Promise<void>} 200 - Success message
   * @throws {BadRequestException} When reaction doesn't exist or invalid query parameters
   */
  unReactOnSomething = async (req: Request, res: Response) => {
    // get logged in user
    const {
      userData: { _id },
    } = (req as IRequest).loggedInUser as { userData: IUser };
    const { postId, commentId } = req.query;
    const { reactionId } = req.params;

    // make sure only send post id or comment id not both
    if ((postId && commentId) || (!postId && !commentId))
      throw new BadRequestException("wrong query parameters");

    // delete the reaction
    const reaction = await this.reactionRepo.findOneDocument({
      _id: reactionId,
      reactOwner: _id,
      reactOn: postId || commentId,
    });

    if (!reaction) throw new NotFoundException("this reaction is not found");

    await reaction.deleteOne();
    res.status(200).json(SuccessResponse("reaction removed successfully"));
  };

  /**
   * Lists all reactions on a post or comment
   * @route GET /reactions/list?postId=:postId OR ?commentId=:commentId
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @access Private - Requires authentication
   * @returns {Promise<void>} 200 - Returns array of reactions with user info
   * @throws {BadRequestException} When post/comment doesn't exist or invalid query parameters
   */
  listReactions = async (req: Request, res: Response) => {
    // get logged in user
    const { postId, commentId } = req.query;

    // make sure only send post id or comment id not both
    if ((postId && commentId) || (!postId && !commentId))
      throw new BadRequestException("wrong query parameters");

    // if the react is on post, check if its exist
    if (postId) {
      const isPostExist = await this.postRepo.findDocumentById(
        postId as unknown as Types.ObjectId
      );
      if (!isPostExist) throw new NotFoundException("this post is not exist");
    }

    // if the react is on comment, check if its exist
    if (commentId) {
      const iscommentExist = await this.commentRepo.findDocumentById(
        commentId as unknown as Types.ObjectId
      );
      if (!iscommentExist)
        throw new NotFoundException("this comment is not exist");
    }

    const reactions = await this.reactionRepo.findDocuments(
      {
        reactOn: postId || commentId,
      },
      "reactOwner react",
      {
        populate: {
          path: "reactOwner",
          select: "userName",
        },
      }
    );

    res
      .status(200)
      .json(SuccessResponse("reaction fetched successfully", 200, reactions));
  };
}

export default new reactionService();
