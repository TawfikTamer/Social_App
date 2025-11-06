import mongoose from "mongoose";
import { IPost } from "../../Common";

const postSchema = new mongoose.Schema<IPost>({
  description: String,
  attachments: [String],
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  allwoComments: {
    type: Boolean,
    default: true,
  },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
});

export const postModel = mongoose.model<IPost>("posts", postSchema);
