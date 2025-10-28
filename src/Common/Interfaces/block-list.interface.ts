import { Types } from "mongoose";

export interface IBlockList {
  userID: Types.ObjectId;
  theBlockedUser: Types.ObjectId;
}
