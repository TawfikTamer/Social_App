import mongoose from "mongoose";
import { IMessage } from "../../Common";

const messagesSchema = new mongoose.Schema<IMessage>({
  text: String,
  ConversionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "conversions",
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "conversions",
    required: true,
  },
});

export const messagesModel = mongoose.model<IMessage>(
  "messages",
  messagesSchema
);
