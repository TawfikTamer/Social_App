import { IFriendShip } from "../../Common/Interfaces/friendShip.interface";
import { friendShipModel } from "../models";
import { BaseRepository } from "./base.repository";

export class FriendShipRepository extends BaseRepository<IFriendShip> {
  constructor() {
    super(friendShipModel);
  }
}
