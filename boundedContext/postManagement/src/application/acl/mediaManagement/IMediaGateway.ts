import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { ImageAttachmentReadModelDTO } from '../../dtos/image/ImageAttachmentReadModelDTO'
import { ImageLoadError } from './errors/ImageLoadError'
import ImageLoadResult from './outcomes/ImageLoadResult'

export interface IMediaGateway {
  getImageById(params: { imageId: string }): Promise<ImageLoadResult<ImageAttachmentReadModelDTO, ImageLoadError>>
  createStagedImageVersion(command: mediaV1.CreateStagedImageCommand): Promise<mediaV1.CreateStagedImageVersionResult>
  promoteImageVersion(command: mediaV1.PromoteImageVersionCommand): Promise<void>
  discardImageVersion(command: mediaV1.DiscardImageVersionCommand): Promise<void>
  updateImage(command: mediaV1.UpdateImageCommand): Promise<mediaV1.UpdateImageResult>
  deleteImage(command: mediaV1.DeleteImageCommand): Promise<void>
}
