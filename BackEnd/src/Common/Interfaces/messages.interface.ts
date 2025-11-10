import { Document, Types } from "mongoose";

export interface IMessage extends Document<Types.ObjectId> {
  text: string;
  ConversionId: Types.ObjectId;
  senderId: Types.ObjectId;
}
