import { IPost } from "../../Common";
import { postModel } from "../models/post.model";
import { BaseRepository } from "./base.repository";

export class PostRepository extends BaseRepository<IPost> {
  constructor() {
    super(postModel);
  }
}
