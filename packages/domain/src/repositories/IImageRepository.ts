import Image from '../entities/Image'
import { PostId } from '../valueObjects/PostId'
import { IRepository } from './IRepository'

export interface IImageRepository<ITransaction = unknown> extends IRepository<ITransaction> {
  findById(id: PostId): Promise<Image | null>
  insert(image: Image): Promise<Image>
  update(image: Image): Promise<Image>
  delete(image: Image): Promise<void>
}
