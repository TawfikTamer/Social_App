import mongoose from "mongoose";
import { genderEnum, IUser, providerEnum, roleEnum } from "../../Common/index";

const userSchema = new mongoose.Schema<IUser>({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    minlength: [3, "Password must be at least 3 char"],
  },
  gender: {
    type: String,
    enum: genderEnum,
  },
  role: {
    type: String,
    enum: roleEnum,
    default: roleEnum.USER,
  },
  isDeactivated: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  provider: [
    {
      type: String,
      enum: Object.values(providerEnum),
    },
  ],
  isPublic: {
    type: Boolean,
    default: true,
  },
  phoneNumber: String,
  DOB: String,
  profilePicture: String,
  coverPicture: String,
  googleId: String,
  needToCompleteData: Boolean,
});

export const userModel = mongoose.model<IUser>("users", userSchema);
