import { IRepository } from '../../infrastructure'
import Image from '../entities/Image'
import { ImageId } from '../valueObjects/ImageId'

export interface IImageRepository extends IRepository {
  findById(id: ImageId): Promise<Image | null>
  insert(image: Image): Promise<Image>
  update(image: Image): Promise<Image>
  delete(image: Image): Promise<void>
}
