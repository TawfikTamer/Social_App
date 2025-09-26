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
    required: true,
    minlength: [3, "Password must be at least 3 char"],
  },
  gender: {
    type: String,
    enum: genderEnum,
    required: true,
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
  provider: {
    type: String,
    enum: providerEnum,
    default: providerEnum.LOCAL,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  phoneNumber: String,
  DOB: Date,
  profilePicture: String,
  coverPicture: String,
  googleId: String,
});

export const userModel = mongoose.model<IUser>("users", userSchema);
