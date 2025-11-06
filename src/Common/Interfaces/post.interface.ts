import { Document, Types } from "mongoose";
import { postVisibilityEnum } from "../Enums/post.enum";

export interface IPost extends Document<Types.ObjectId> {
  description?: string;
  attachments?: string[];
  ownerId: Types.ObjectId;
  allowComments?: boolean;
  tags: Types.ObjectId[];
  visibility: postVisibilityEnum;
}
