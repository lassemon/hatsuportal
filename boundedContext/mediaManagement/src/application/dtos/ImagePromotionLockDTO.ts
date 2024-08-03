import { ImageMetadataDTO } from './ImageMetadataDTO'
import { ImageVersionMetadataDTO } from './ImageVersionMetadataDTO'

export interface ImagePromotionLockDTO {
  /** Locked staged (or target) version row as ImageMetadataDTO. */
  staged: ImageMetadataDTO
  /** Published current version row, when pointer is set and differs from staged row. */
  publishedCurrent: ImageVersionMetadataDTO | null
}
