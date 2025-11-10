import { IConversion } from "../../Common";
import { conversionsModel } from "../models";
import { BaseRepository } from "./base.repository";

export class conversionsRepository extends BaseRepository<IConversion> {
  constructor() {
    super(conversionsModel);
  }
}
