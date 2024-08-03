import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { EntityLoadResult } from '@hatsuportal/platform'
import { ImageAttachmentReadModelDTO } from '../../dtos/image/ImageAttachmentReadModelDTO'
import { ImageLoadError } from './errors/ImageLoadError'

export interface IMediaGateway {
  getImageById(params: { imageId: string }): Promise<EntityLoadResult<ImageAttachmentReadModelDTO, ImageLoadError>>
  prepareStagedImageFile(command: mediaV1.CreateStagedImageCommand): Promise<mediaV1.PreparedStagedImageContract>
  registerPreparedStagedImageFileRollbackCleanup(prepared: mediaV1.PreparedStagedImageContract): Promise<void>
  saveStagedImageMetadata(prepared: mediaV1.PreparedStagedImageContract): Promise<void>
  createStagedImageVersion(command: mediaV1.CreateStagedImageCommand): Promise<mediaV1.CreateStagedImageVersionResult>
  promoteImageVersion(command: mediaV1.PromoteImageVersionCommand): Promise<void>
  deleteImage(command: mediaV1.DeleteImageCommand): Promise<void>
}
