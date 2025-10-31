import { Document, Types } from "mongoose";

export interface IBlockList extends Document {
  userID: Types.ObjectId;
  theBlockedUser: Types.ObjectId;
}
