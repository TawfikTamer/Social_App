import mongoose from "mongoose";
import { IBlockList } from "../../Common";

const blockListSchema = new mongoose.Schema<IBlockList>(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    theBlockedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);

export const blockListModel = mongoose.model<IBlockList>(
  "block list",
  blockListSchema
);
