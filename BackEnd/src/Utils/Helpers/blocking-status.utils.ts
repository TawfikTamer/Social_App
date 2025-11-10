import { Types } from "mongoose";
import { BlockListRepository } from "../../DB/Repositories";

const blockListRepo = new BlockListRepository();

export const isBlockingEachOther = async (
  userId: Types.ObjectId,
  theOtherUserId: Types.ObjectId
): Promise<boolean> => {
  // check if one of them block the other
  const isBlocked = await blockListRepo.findOneDocument({
    $or: [
      { userID: userId, theBlockedUser: theOtherUserId },
      { userID: theOtherUserId, theBlockedUser: userId },
    ],
  });

  if (isBlocked) return true;

  return false;
};
