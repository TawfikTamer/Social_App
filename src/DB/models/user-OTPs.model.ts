import mongoose from "mongoose";
import { IUserOTPS } from "../../Common";

const userOTPsSchema = new mongoose.Schema<IUserOTPS>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  confirm: {
    type: String,
  },
  recovery: {
    type: String,
  },
  expiration: {
    type: Date,
    default: new Date(Date.now() + 15 * 60 * 1000),
  },
});

export const otpModel = mongoose.model<IUserOTPS>("user OTPs", userOTPsSchema);
