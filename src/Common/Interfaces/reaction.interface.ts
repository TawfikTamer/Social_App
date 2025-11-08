import mongoose, { Document } from "mongoose";
import { commentOnModelEnum } from "../Enums/comment.enum";

export interface IReaction extends Document<mongoose.Types.ObjectId> {
  react: String;
  reactOwner: mongoose.Types.ObjectId;
  reactOn: mongoose.Types.ObjectId;
  refModel: commentOnModelEnum;
}
