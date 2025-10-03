import mongoose, { Document } from "mongoose";
import { genderEnum, roleEnum } from "../Enums/user.enum";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface IUser extends Document {
  userName: string;
  email: string;
  password?: string;
  gender: genderEnum;
  role?: roleEnum;
  isDeactivated?: boolean;
  isVerified?: boolean;
  isPublic?: boolean;
  provider?: string[];
  phoneNumber?: string;
  DOB?: Date;
  profilePicture?: string;
  coverPicture?: string;
  googleId?: string;
  needToCompleteData?: boolean;
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
  confirm?: string | null;
  recovery?: string;
  expiration: Date;
}

export interface IRequest extends Request {
  loggedInUser: {
    userData?: IUser;
    accessTokenData?: JwtPayload;
    refreshTokenData?: JwtPayload;
  };
}

export interface IBlackListedTokens extends Document {
  accsessTokenId: string;
  refreshTokenId: string;
  expirationDate: Date;
}
