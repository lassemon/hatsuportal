import { ImageMetadata, PostId } from '@hatsuportal/domain'

export interface IImageMetadataRepository {
  findById(id: PostId): Promise<ImageMetadata | null>
  insert(imageMetadata: ImageMetadata): Promise<ImageMetadata>
  update(imageMetadata: ImageMetadata): Promise<ImageMetadata>
  delete(imageId: PostId): Promise<void>
}
