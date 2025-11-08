import { Request, Response } from "express";
import { commentOnModelEnum, IRequest, IUser } from "../../../Common";
import {
  CommentRepository,
  FriendShipRepository,
  PostRepository,
  reactionRepository,
  UserRepository,
} from "../../../DB/Repositories";
import { userModel } from "../../../DB/models";
import { Types } from "mongoose";
import { BadRequestException, SuccessResponse } from "../../../Utils";

class reactionService {
  userRepo: UserRepository = new UserRepository(userModel);
  friendShipReop: FriendShipRepository = new FriendShipRepository();
  postRepo: PostRepository = new PostRepository();
  commentRepo: CommentRepository = new CommentRepository();
  reactionRepo: reactionRepository = new reactionRepository();

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
      if (!isPostExist) throw new BadRequestException("this post is not exist");
      refModel = commentOnModelEnum.POST;
    }

    // if the react is on comment, check if its exist
    if (commentId) {
      const iscommentExist = await this.commentRepo.findDocumentById(
        commentId as unknown as Types.ObjectId
      );
      if (!iscommentExist)
        throw new BadRequestException("this comment is not exist");
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

    if (!reaction) throw new BadRequestException("this reaction is not found");

    await reaction.deleteOne();
    res.status(200).json(SuccessResponse("reaction removed successfully"));
  };

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
      if (!isPostExist) throw new BadRequestException("this post is not exist");
    }

    // if the react is on comment, check if its exist
    if (commentId) {
      const iscommentExist = await this.commentRepo.findDocumentById(
        commentId as unknown as Types.ObjectId
      );
      if (!iscommentExist)
        throw new BadRequestException("this comment is not exist");
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
