import { Document, Types } from "mongoose";
import { commentOnModelEnum } from "../Enums/comment.enum";

export interface IComment extends Document<Types.ObjectId> {
  content: string;
  ownerId: Types.ObjectId;
  attachments?: string;
  refId: Types.ObjectId;
  onModel: commentOnModelEnum;
}
