import mongoose, { PaginateModel } from "mongoose";
import { IPost, postVisibilityEnum } from "../../Common";
import mongoosePaginate from "mongoose-paginate-v2";

const postSchema = new mongoose.Schema<IPost>({
  description: String,
  attachments: [String],
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  allowComments: {
    type: Boolean,
    default: true,
  },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  visibility: {
    type: String,
    enum: postVisibilityEnum,
    default: postVisibilityEnum.PUBLIC,
  },
});
postSchema.plugin(mongoosePaginate);
export const postModel = mongoose.model<IPost, PaginateModel<IPost>>(
  "posts",
  postSchema
);
