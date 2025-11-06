import { Document, Types } from "mongoose";

export interface IPost extends Document<Types.ObjectId> {
  description?: string;
  attachments?: string[];
  ownerId: Types.ObjectId;
  allwoComments?: boolean;
  tags: Types.ObjectId[];
}
