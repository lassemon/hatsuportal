import Image from '../../domain/entities/Image'
import { ImageId } from '../../domain/valueObjects/ImageId'
import { ImageVersionId } from '../../domain/valueObjects/ImageVersionId'
import { StagedImage } from '../models/StagedImage'
import { CurrentImage } from '../models/CurrentImage'
import { IRepository } from '@hatsuportal/foundation'

export interface StagedImageVersionIdentifier {
  imageId: ImageId
  stagedVersionId: ImageVersionId
}

export interface IImageRepository extends IRepository {
  findById(id: ImageId): Promise<Image | null>
  findByIdAndVersionId(id: ImageId, versionId: ImageVersionId): Promise<Image | null>
  insertStaged(image: StagedImage): Promise<StagedImageVersionIdentifier>
  insertCurrent(image: CurrentImage): Promise<Image>
  update(image: CurrentImage): Promise<Image>
  discardStagedVersion({ imageId, stagedVersionId }: StagedImageVersionIdentifier): Promise<void>
  delete(image: Image): Promise<Image>
}
