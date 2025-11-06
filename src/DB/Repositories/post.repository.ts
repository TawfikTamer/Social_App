import { FilterQuery, PaginateOptions } from "mongoose";
import { IPost } from "../../Common";
import { postModel } from "../models/post.model";
import { BaseRepository } from "./base.repository";

export class PostRepository extends BaseRepository<IPost> {
  constructor() {
    super(postModel);
  }

  async postsPagination(
    filters?: FilterQuery<IPost>,
    options?: PaginateOptions
  ) {
    return await postModel.paginate(filters, options);
  }
}
