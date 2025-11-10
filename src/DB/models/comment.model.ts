import mongoose from "mongoose";
import { commentOnModelEnum, IComment } from "../../Common";

const commentSchema = new mongoose.Schema<IComment>({
  content: String,
  attachments: String,
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "onModel",
    required: true,
  },
  onModel: {
    type: String,
    enum: commentOnModelEnum,
    default: commentOnModelEnum.COMMENT,
    required: true,
  },
});

export const CommentModel = mongoose.model<IComment>("comments", commentSchema);
