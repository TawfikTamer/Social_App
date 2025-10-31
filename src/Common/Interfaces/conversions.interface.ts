import mongoose, { Document } from "mongoose";

export interface IConversion extends Document<mongoose.Schema.Types.ObjectId> {
  type: string;
  name?: string;
  members?: mongoose.Types.ObjectId[];
}
