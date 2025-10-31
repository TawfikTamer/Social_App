import { IConversion } from "../../Common";
import { conversionsModel } from "../models/conversions.model";
import { BaseRepository } from "./base.repository";

export class conversionsRepository extends BaseRepository<IConversion> {
  constructor() {
    super(conversionsModel);
  }
}
