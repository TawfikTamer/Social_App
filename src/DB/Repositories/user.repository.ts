import { Model } from "mongoose";
import { IUser, IUserOTPS } from "../../Common";
import { BaseRepository } from "./base.repository";

export class UserRepository extends BaseRepository<IUser> {
  constructor(userModel: Model<IUser>) {
    super(userModel);
  }
}

export class UserOTPsRepository extends BaseRepository<IUserOTPS> {
  constructor(otpModel: Model<IUserOTPS>) {
    super(otpModel);
  }
}
