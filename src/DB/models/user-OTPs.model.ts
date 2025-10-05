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
    default: new Date(
      Date.now() + parseInt(process.env.OTPS_EXPIRES_IN_MIN!) * 60 * 1000
    ),
  },
});

// delete any expired otp if found
userOTPsSchema.post("findOne", async function (doc) {
  if (doc) {
    if (new Date() > doc.expiration) {
      await doc.deleteOne();
    }
  }
});

export const otpModel = mongoose.model<IUserOTPS>("user OTPs", userOTPsSchema);
