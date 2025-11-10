import { Document, Types } from "mongoose";
import { friendShipStatusEnum } from "../Enums/friendShip.enum";

export interface IFriendShip extends Document<Types.ObjectId> {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  status: friendShipStatusEnum;
}
