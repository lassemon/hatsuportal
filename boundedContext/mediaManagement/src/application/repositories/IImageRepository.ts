import Image from '../../domain/entities/Image'
import { ImageId } from '../../domain/valueObjects/ImageId'
import { ImageVersionId } from '../../domain/valueObjects/ImageVersionId'
import { StagedImage } from '../../domain/entities/StagedImage'
import { CurrentImage } from '../../domain/entities/CurrentImage'
import { ImageMetadataDTO } from '../dtos/ImageMetadataDTO'
import { ImagePromotionLockDTO } from '../dtos/ImagePromotionLockDTO'

export interface StagedImageVersionIdentifier {
  imageId: ImageId
  stagedVersionId: ImageVersionId
}

export interface ImageCleanupCandidate {
  readonly id: string
  readonly updatedAt: number
}

export interface IImageRepository {
  findById(id: ImageId): Promise<ImageMetadataDTO | null>
  findAllCleanupCandidates(): Promise<ImageCleanupCandidate[]>
  findByIdAndVersionId(id: ImageId, versionId: ImageVersionId): Promise<ImageMetadataDTO | null>
  findByIdAndVersionIdForUpdate(id: ImageId, versionId: ImageVersionId): Promise<ImageMetadataDTO | null>
  findPromotionLockForUpdate(imageId: ImageId, stagedVersionId: ImageVersionId): Promise<ImagePromotionLockDTO | null>
  findAllStorageKeys(): Promise<string[]>
  findStagedStorageKeys(imageId: ImageId): Promise<string[]>
  insertStaged(image: StagedImage): Promise<StagedImageVersionIdentifier>
  insertCurrent(image: CurrentImage): Promise<ImageMetadataDTO>
  /**
   * Persists promotion state from a post-promoteToCurrent partial aggregate built by
   * toImageForPromotion (0–2 versions). Not intended for fully-hydrated aggregates.
   */
  savePromotedImage(image: Image): Promise<void>
  rollbackCurrentVersion(image: CurrentImage): Promise<void>
  pruneOldVersions(imageId: string, retainCount: number): Promise<string[]>
  delete(image: Image): Promise<string[]>
}
