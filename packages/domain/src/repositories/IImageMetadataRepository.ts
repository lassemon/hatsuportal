import ImageMetadata from '../entities/ImageMetadata'
import { PostId } from '../valueObjects/PostId'

export interface IImageMetadataRepository {
  findById(id: PostId): Promise<ImageMetadata | null>
  insert(imageMetadata: ImageMetadata): Promise<ImageMetadata>
  update(imageMetadata: ImageMetadata): Promise<ImageMetadata>
  delete(imageId: PostId): Promise<void>
}
