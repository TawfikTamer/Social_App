import mongoose from "mongoose";
import { IConversion, conversionTypeEnum } from "../../Common";

const conversionsSchema = new mongoose.Schema<IConversion>({
  type: {
    type: String,
    enum: conversionTypeEnum,
    default: conversionTypeEnum.DIRECT,
  },
  name: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
});

export const conversionsModel = mongoose.model<IConversion>(
  "conversions",
  conversionsSchema
);
