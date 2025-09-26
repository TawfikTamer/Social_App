import { FilterQuery, Model, ProjectionType, QueryOptions } from "mongoose";

export abstract class BaseRepository<T> {
  constructor(private model: Model<T>) {}

  async createNewDocument(document: Partial<T>): Promise<T> {
    return await this.model.create(document);
  }

  async findOneDocument(filter: FilterQuery<T>, projection?: ProjectionType<T>, options?: QueryOptions): Promise<T | null> {
    return await this.model.findOne(filter, projection, options);
  }

  async upadeOneDocument(filter: FilterQuery<T>, document: Partial<T>): Promise<Object> {
    return await this.model.updateOne(filter, document);
  }

  async deleteOneDocument(filter: FilterQuery<T>): Promise<Object> {
    return await this.model.deleteOne(filter);
  }
}
