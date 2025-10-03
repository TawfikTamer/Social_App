import mongoose from "mongoose";
import { IBlackListedTokens } from "../../Common";

const blackListTokenSchema = new mongoose.Schema<IBlackListedTokens>({
  accsessTokenId: {
    type: String,
    required: true,
    index: { name: "idx_accsessToken" },
  },
  refreshTokenId: {
    type: String,
    required: true,
    index: { name: "idx_accsessToken" },
  },
  expirationDate: {
    type: Date,
    required: true,
  },
});

export const blackListedTokensModel = mongoose.model<IBlackListedTokens>(
  "Black listed token",
  blackListTokenSchema
);
