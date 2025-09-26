import mongoose, { Document } from "mongoose";
import { genderEnum, roleEnum } from "../Enums/user.enum";

export interface IUser extends Document {
  userName: string;
  email: string;
  password: string;
  gender: genderEnum;
  role?: roleEnum;
  isDeactivated?: boolean;
  isVerified?: boolean;
  isPublic?: boolean;
  provider?: string;
  phoneNumber?: string;
  DOB?: Date;
  profilePicture?: string;
  coverPicture?: string;
  googleId?: string;
}

export interface IEmailArguments {
  to: string;
  subject: string;
  content: string;
  cc?: string;
  attachments?: [];
}

export interface IUserOTPS {
  userId: mongoose.Schema.Types.ObjectId;
  confirm?: string;
  recovery?: string;
  expiration: Date;
}
