import { IBlackListedTokens } from "../../Common";
import { BaseRepository } from "./base.repository";
import { blackListedTokensModel } from "../models";

export class BlackListedTokenRepository extends BaseRepository<IBlackListedTokens> {
  constructor() {
    super(blackListedTokensModel);
  }
}
