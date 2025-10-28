import { IBlockList } from "../../Common";
import { blockListModel } from "../models/blocked-list-model";
import { BaseRepository } from "./base.repository";

export class BlockListRepository extends BaseRepository<IBlockList> {
  constructor() {
    super(blockListModel);
  }
}
