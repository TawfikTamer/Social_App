import mongoose from "mongoose";
import { IComment } from "../../Common";
// import  from "../../Common";

const commentSchema = new mongoose.Schema<IComment>(
  {
    content: String,
    attachments: String,
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "onModel",
      required: true,
    },
    onModel: {
      type: String,
      enum: ["posts", "comments"],
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// replies for comment
commentSchema.virtual("replies", {
  ref: "comments",
  localField: "_id",
  foreignField: "refId",
});

export const CommentModel = mongoose.model<IComment>("comments", commentSchema);
