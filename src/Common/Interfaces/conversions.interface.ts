import mongoose, { Document, Types } from "mongoose";

export interface IConversion extends Document<Types.ObjectId> {
  type: string;
  name?: string;
  members?: mongoose.Types.ObjectId[];
}
