import mongoose from "mongoose";
import { commentOnModelEnum, IReaction, reactionsEnum } from "../../Common";

const reactionSchema = new mongoose.Schema<IReaction>({
  react: {
    type: String,
    required: true,
    enum: reactionsEnum,
    defaultL: reactionsEnum.LIKE,
  },
  reactOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  reactOn: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "refModel",
    required: true,
  },
  refModel: {
    type: String,
    enum: commentOnModelEnum,
    default: commentOnModelEnum.POST,
    required: true,
  },
});

export const reactionModel = mongoose.model<IReaction>(
  "reactions",
  reactionSchema
);
