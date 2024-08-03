import Image from '../../domain/entities/Image'
import { ImageId } from '../../domain/valueObjects/ImageId'
import { ImageVersionId } from '../../domain/valueObjects/ImageVersionId'
import { StagedImage } from '../../domain/entities/StagedImage'
import { CurrentImage } from '../../domain/entities/CurrentImage'
import { ImageMetadataDTO } from '../dtos/ImageMetadataDTO'
import { ImageVersionMetadataDTO } from '../dtos/ImageVersionMetadataDTO'

export interface StagedImageVersionIdentifier {
  imageId: ImageId
  stagedVersionId: ImageVersionId
}

export interface IImageRepository {
  findById(id: ImageId): Promise<ImageMetadataDTO | null>
  findByIdAndVersionId(id: ImageId, versionId: ImageVersionId): Promise<ImageMetadataDTO | null>
  findAllStorageKeys(): Promise<string[]>
  findStagedStorageKeys(imageId: ImageId): Promise<string[]>
  insertStaged(image: StagedImage): Promise<StagedImageVersionIdentifier>
  insertCurrent(image: CurrentImage): Promise<ImageMetadataDTO>
  rollbackCurrentVersion(image: CurrentImage): Promise<void>
  pruneOldVersions(imageId: string, retainCount: number): Promise<string[]>
  update(image: CurrentImage): Promise<ImageMetadataDTO>
  discardStagedVersion({ imageId, stagedVersionId }: StagedImageVersionIdentifier): Promise<ImageVersionMetadataDTO>
  delete(image: Image): Promise<string[]>
}
