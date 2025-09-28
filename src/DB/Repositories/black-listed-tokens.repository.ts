import { Model } from "mongoose";
import { IBlackListedTokens } from "../../Common";
import { BaseRepository } from "./base.repository";

export class BlackListedTokenRepository extends BaseRepository<IBlackListedTokens> {
  constructor(blackListModel: Model<IBlackListedTokens>) {
    super(blackListModel);
  }
}
