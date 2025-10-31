import mongoose, { Document } from "mongoose";

export interface IMessage extends Document {
  text: string;
  ConversionId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
}
