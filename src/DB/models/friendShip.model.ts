import mongoose from "mongoose";
import { friendShipStatusEnum } from "../../Common";
import { IFriendShip } from "../../Common";

const friendShipSchema = new mongoose.Schema<IFriendShip>({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  status: {
    type: String,
    enum: friendShipStatusEnum,
    default: friendShipStatusEnum.PENDING,
  },
});

export const friendShipModel = mongoose.model<IFriendShip>(
  "friendShip",
  friendShipSchema
);
