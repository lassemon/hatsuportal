import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { IMediaGateway } from '../../../../application/acl/mediaManagement/IMediaGateway'
import { ImageAttachmentReadModelDTO } from '../../../../application/dtos/image/ImageAttachmentReadModelDTO'
import { IMediaGatewayMapper } from '../../../../application/acl/mediaManagement/mappers/IMediaGatewayMapper'
import { ImageLoadError } from '../../../../application/acl/mediaManagement/errors/ImageLoadError'
import { ApplicationError, EntityLoadResult } from '@hatsuportal/platform'

export class MediaGateway implements IMediaGateway {
  constructor(
    private readonly mediaQueryFacade: mediaV1.IMediaQueryFacade,
    private readonly mediaCommandFacade: mediaV1.IMediaCommandFacade,
    private readonly mediaGatewayMapper: IMediaGatewayMapper
  ) {}

  async getImageById(params: { imageId: string }): Promise<EntityLoadResult<ImageAttachmentReadModelDTO, ImageLoadError>> {
    try {
      const image = await this.mediaQueryFacade.getImageById(params)
      return EntityLoadResult.success(this.mediaGatewayMapper.toAttachmentReadModelDTO(image))
    } catch (error) {
      if (error instanceof Error) {
        return EntityLoadResult.failure(new ImageLoadError({ imageId: params.imageId, error }))
      } else {
        return EntityLoadResult.failure(
          new ImageLoadError({
            imageId: params.imageId,
            error: new ApplicationError({ message: 'Unknown error occurred', cause: error })
          })
        )
      }
    }
  }

  async prepareStagedImageFile(command: mediaV1.CreateStagedImageCommand): Promise<mediaV1.PreparedStagedImageContract> {
    return this.mediaCommandFacade.prepareStagedImageFile(command)
  }

  async registerPreparedStagedImageFileRollbackCleanup(prepared: mediaV1.PreparedStagedImageContract): Promise<void> {
    return this.mediaCommandFacade.registerPreparedStagedImageFileRollbackCleanup(prepared)
  }

  async saveStagedImageMetadata(prepared: mediaV1.PreparedStagedImageContract): Promise<void> {
    return this.mediaCommandFacade.saveStagedImageMetadata(prepared)
  }

  async createStagedImageVersion(command: mediaV1.CreateStagedImageCommand): Promise<mediaV1.CreateStagedImageVersionResult> {
    return this.mediaCommandFacade.createStagedImageVersion(command)
  }

  async promoteImageVersion(command: mediaV1.PromoteImageVersionCommand): Promise<void> {
    return this.mediaCommandFacade.promoteImageVersion(command)
  }

  async deleteImage(command: mediaV1.DeleteImageCommand): Promise<void> {
    return this.mediaCommandFacade.deleteImage(command)
  }
}
