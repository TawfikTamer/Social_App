import { IMessage } from "../../Common";
import { messagesModel } from "../models";
import { BaseRepository } from "./base.repository";

export class messagesRepository extends BaseRepository<IMessage> {
  constructor() {
    super(messagesModel);
  }
}
