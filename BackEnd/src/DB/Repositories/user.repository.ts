import { IUser, IUserOTPS } from "../../Common";
import { BaseRepository } from "./base.repository";
import { otpModel, userModel } from "../models";

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(userModel);
  }
}

export class UserOTPsRepository extends BaseRepository<IUserOTPS> {
  constructor() {
    super(otpModel);
  }
}
