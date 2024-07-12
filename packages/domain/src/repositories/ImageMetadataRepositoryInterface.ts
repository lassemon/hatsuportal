import ImageMetadata from '../entities/ImageMetadata'

export interface ImageMetadataRepositoryInterface<InsertImageMetadataQuery, UpdateImageMetadataQuery> {
  findById(id?: string): Promise<ImageMetadata | null>
  insert(insertMetadataQuery: InsertImageMetadataQuery): Promise<ImageMetadata>
  update(updateMetadataQuery: UpdateImageMetadataQuery): Promise<ImageMetadata>
  delete(imageId: string): Promise<void>
}
