import { IReaction } from "../../Common";
import { reactionModel } from "../models";
import { BaseRepository } from "./base.repository";

export class reactionRepository extends BaseRepository<IReaction> {
  constructor() {
    super(reactionModel);
  }
}
