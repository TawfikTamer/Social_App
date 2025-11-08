import { AggregateOptions, PipelineStage } from "mongoose";
import { IComment } from "../../Common";
import { CommentModel } from "../models";
import { BaseRepository } from "./base.repository";

export class CommentRepository extends BaseRepository<IComment> {
  constructor() {
    super(CommentModel);
  }

  async commentAggregation(
    pipeline?: PipelineStage[],
    options?: AggregateOptions
  ): Promise<IComment[]> {
    return await CommentModel.aggregate<IComment>(pipeline, options);
  }
}
