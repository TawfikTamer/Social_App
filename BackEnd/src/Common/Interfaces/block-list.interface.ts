import { Document, Types } from "mongoose";

export interface IBlockList extends Document<Types.ObjectId> {
  userID: Types.ObjectId;
  theBlockedUser: Types.ObjectId;
}
